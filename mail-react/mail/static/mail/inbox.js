function Inbox(props) {
  const emails = props.emails;
  const mailboxName = props.mailboxName;
  const setDetailed = props.onClickDetailed;
  const setArchive = props.onClickArchive;
  return(
    <div id={mailboxName}>
      <h1>{mailboxName.toUpperCase()}</h1>
      {emails.map(email => <ShortEmail email={email} onClickDetailed={setDetailed} onClickArchive={setArchive} key={email.id} /> )}
    </div>
  );
}

function ShortEmail(props) {
    const email = props.email;
    const setDetailed = props.onClickDetailed;
    const setArchive = props.onClickArchive;
    const isRead = email.read;
    const readEmailStyle = isRead ? 'read-email' : '';
    const toggleArchiveButtonText = email.archived ? 'Unarchive' : 'Archive';
    const toggleArchiveButtonStyle = email.archived ? 'danger' : 'warning';
    return (
      <div className={"email-box" + " " + readEmailStyle}>
          <div className="email-part-short">{email.sender}</div>
          <div className="email-part-short">{email.subject}</div>
          <div className="email-part-short">{email.timestamp}</div>
          <div className="email-part-short" className="buttons">
            <button key="detailed" onClick={(event) => setDetailed(email, event)} className="btn btn-info">Details</button>
            <button key="archive" onClick={(event) => setArchive(email, event)} className={`btn btn-${toggleArchiveButtonStyle}`}>
              {toggleArchiveButtonText}
            </button>
          </div>
      </div>
      // https://reactjs.org/docs/handling-events.html
    );
}

function DetailedEmail(props) {
  const email = props.email;
  const replyEmailPage = props.onClickReply;
  return (
    <div className="email-box-detailed">
      <div className="email-part-long">{email.sender}</div>
      <div className="email-part-long">{email.recipients}</div>
      <div className="email-part-long">{email.subject}</div>
      <div className="email-part-long">{email.body}</div>
      <div className="email-part-long">{email.timestamp}</div>
      <button className="btn btn-primary" onClick={(event) => replyEmailPage(email, event)} >Reply</button>
    </div>
  );
}

class Mailbox extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        mailbox:"inbox",
        error: null,
        isLoaded:false,
        isCompose:false,
        isDetailed:false,
        emails:[],
        detailedEmail:null,
        form: {
            recipients:"",
            subject:"",
            body:""
        }
      }
  }

  componentDidMount() {
    console.log('component did mount');
    const isCompose = this.state.isCompose;
    const isDetailed = this.state.isDetailed;
    if (!isCompose && !isDetailed) {
      const mailbox = this.state.mailbox;
      fetch(`/emails/${mailbox}`)
        .then(res => res.json())
        .then(
          (data) => {
            this.setState({
              isLoaded: true,
              emails: data
            });
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    }
  }
  
  setMailbox = (email) => {
      const mailbox =  event.target.id;
      this.setState(
        {
          mailbox:mailbox,
          detailedEmail:email,
          isCompose:false,
          isDetailed:false,
          form: {
            recipients:"",
            subject:"",
            body:""
          }
        },
        () => this.componentDidMount()
      );
  }
  
  setDetailed = (email) => {
    this.setState(
      {
        isDetailed:true,
        detailedEmail:email,
      },
      () => this.componentDidMount()
    );
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });
  }
  
  setCompose = () => {
    this.setState(
      {isCompose: true},
      () => this.componentDidMount()
    )
  }

  setArchive = (email) => {
    const arhiveStatus = email.archived;
    const archiveBool = arhiveStatus ? false : true;
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: archiveBool
      })
    })
    .then(() => this.setState({
      mailbox:'inbox',
    }))
    .then(() => this.componentDidMount());
  }
  
  replyEmailPage = (email) => {
    const haveRe = email.subject.slice(0, 3) == "Re:";
    const reSubject = haveRe ? `${email.subject}` : `Re: ${email.subject}`; 
    this.setState(
      {
        isCompose:true,
        isDetailed:false,
        form: {
            recipients:email.sender,
            subject:reSubject,
            body:`On ${email.timestamp} ${email.sender} wrote:\n ${email.body}`
        }
      });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: this.state.form['recipients'],
          subject: this.state.form['subject'],
          body: this.state.form['body']
      })
    })
    .then(() => {
      return this.setState(
        {
          mailbox:"sent",
          isCompose:false,
          isDetailed:false,
          form: {
              recipients:"",
              subject:"",
              body:""
          }
        });
    }).then(() => this.componentDidMount());
}

renderNavbar() {
    return(
      <div id="navbar">
          <button className="btn btn-sm btn-outline-primary" id="inbox" onClick={this.setMailbox}>Inbox</button>
          <button className="btn btn-sm btn-outline-primary" id="compose" onClick={this.setCompose}>Compose</button>
          <button className="btn btn-sm btn-outline-primary" id="sent" onClick={this.setMailbox}>Sent</button>
          <button className="btn btn-sm btn-outline-primary" id="archive" onClick={this.setMailbox}>Archived</button>
          <hr/>
      </div>
    );
}

  render() {
    const {mailbox, isCompose, error, isLoaded, emails, detailedEmail, isDetailed} = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      if (!isCompose && !isDetailed) {
        if (mailbox == 'inbox' || mailbox == 'sent' || mailbox == 'archive') {
          return(
            <div id="emails-view"> 
              {this.renderNavbar()}
              <Inbox emails={emails} mailboxName={mailbox} onClickDetailed={this.setDetailed} onClickArchive={this.setArchive} />
            </div>
          )
        }
      }
      else if (isDetailed) {
        return (
          <div id="detailed-view">
            {this.renderNavbar()}
            <DetailedEmail email={detailedEmail} onClickReply={this.replyEmailPage} />
          </div>
        );
      }
      else if (isCompose) {
        return this.renderComposePage()
      }
    }
  }

  renderComposePage() {
      return(
      <div id="compose-view">
          {this.renderNavbar()}
          <h3>New Email</h3>
          <form id="compose-form" onSubmit={(event) => this.handleSubmit(event)}>
              <div className="form-group">
                  From: <input disabled className="form-control" value={document.querySelector('#user_email_address').innerHTML} />
              </div>
              <div 
              className="form-group">
              To: <input id="compose-recipients"
              className="form-control"
              placeholder="Recipients"
              name="recipients"
              onChange={this.handleFormInputChange}
              value={this.state.form.recipients}
              />
              </div>
              <div className="form-group">
                  <input
                  className="form-control"
                  id="compose-subject"
                  placeholder="Subject"
                  name="subject"
                  onChange={this.handleFormInputChange}
                  value={this.state.form.subject}
                  />
              </div>
              <textarea
              className="form-control"
              id="compose-body"
              placeholder="Body"
              name="body"
              onChange={this.handleFormInputChange}
              value={this.state.form.body}
              />
              <input type="submit" className="btn btn-primary" name="submit" />
          </form>
      </div>
      );
  }

  handleFormInputChange = (event) => {
      const inputName = event.target.name;
      const val = event.target.value;
      this.setState(prevState => ({
          form: {                   // object that we want to update
              ...prevState.form,    // keep all other key-value pairs
              [inputName]: val    // update the value of specific key
          }
      }))
  }
}

ReactDOM.render(
  <Mailbox />,
  document.querySelector('#app')
  );