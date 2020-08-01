document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //new
  //new end

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';
  
  //buttons
  document.querySelector('#inbox').disabled = false;
  document.querySelector('#compose').disabled = true;
  document.querySelector('#sent').disabled = false;
  document.querySelector('#archive').disabled = false;
  //buttons

  //form and post email
  let statusCode = 0;
  form = document.querySelector('#compose-form')

  form.onsubmit = () => {
    recipients = document.querySelector('#compose-recipients').value;
    subject = document.querySelector('#compose-subject').value;
    body = document.querySelector('#compose-body').value;
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => {
      statusCode = response.status;
      return response.json();
    })
    .then((result) => {
      if (statusCode == 201) {
        load_mailbox('sent');
      } else if (statusCode == 400) {
          let messageElement = document.createElement('h4');
          messageElement.innerHTML = result.error;
          messageElement.style.color = 'red';
          document.querySelector('#compose-form').insertBefore(messageElement, document.querySelector('.form-group'));
      }
    });

    // Stop form from submitting
    return false;
  }
  //form and post email end
  
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



/**
 * Get wanted mailbox view and fetch related emails from api
 * @param {string} mailbox - Wanted mailbox name
 */
function load_mailbox(mailbox) {
   
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';

  //buttons
  mailboxArray = ['#inbox', '#sent', '#archive']
  mailboxArray.forEach(mailboxName => {
    if (`#${mailbox}` === mailboxName) {
      document.querySelector(mailboxName).disabled = true;
    }
    else document.querySelector(mailboxName).disabled = false;
  })
  document.querySelector('#compose').disabled = false;
  //buttons


  // GET the emails of the related mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const singleEmailElement = document.createElement('div');
        singleEmailElement.className = 'single-email';

        const senderElement = document.createElement('div');
        const subjectElement = document.createElement('div');
        const timestampElement = document.createElement('div');
        const detailedViewButton = document.createElement('button');
        
        senderElement.className = "email-sender";
        senderElement.innerHTML = email.sender;
        singleEmailElement.append(senderElement);

        subjectElement.className = "email-subject";
        subjectElement.innerHTML = email.subject;
        singleEmailElement.append(subjectElement);
        
        timestampElement.className = 'email-timestamp';
        timestampElement.innerHTML = email.timestamp;
        singleEmailElement.append(timestampElement);
        

        // unarchive view button
        if (mailbox === 'archive')
        {
          const unarchiveButton = document.createElement('button');
          unarchiveButton.className = 'unarchive-button btn btn-danger';
          unarchiveButton.innerHTML = 'Unarchive';
          unarchiveButton.setAttribute('data-emailno', `${email.id}`);
          unarchiveButton.addEventListener("click", event => {
            // unarchive_email(event.target.dataset.emailno);
            fetch(`/emails/${event.target.dataset.emailno}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
                })
            }).then(() => load_mailbox('inbox'));

          });
          singleEmailElement.append(unarchiveButton);
        }
        // unarchive view button


        // detailed view button
        detailedViewButton.className = 'details-button btn btn-info';
        detailedViewButton.innerHTML = 'Details';
        detailedViewButton.setAttribute('data-emailno', `${email.id}`);
        detailedViewButton.addEventListener("click", event => {
          load_detailed_email(event.target.dataset.emailno);
        });
        singleEmailElement.append(detailedViewButton);
        // detailed view button

        // read email
        if (email.read) {
          singleEmailElement.style.backgroundColor = "gray";
        }
        // read email
        document.querySelector('#emails-view').append(singleEmailElement);
      });
  });
  // GET the emails of the related mailbox
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}



function load_detailed_email(emailno) {
 

  fetch(`/emails/${emailno}`)
  .then(response => response.json())
  .then(email => {
      const sender = email.sender
      const recipients = email.recipients
      const subject = email.subject
      const timestamp = email.timestamp
      const body = email.body

      const senderElement = document.createElement('div');
      const recipientsElement = document.createElement('div');
      const subjectElement = document.createElement('div');
      const timestampElement = document.createElement('div');
      const bodyElement = document.createElement('div');
      
      // arhive
      const archiveButton = document.createElement('button');
      archiveButton.className = 'details-button btn btn-info';
      archiveButton.innerHTML = 'Archive';
      archiveButton.addEventListener("click", () => {
        fetch(`/emails/${emailno}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
            })
        })
      });
      // arhive
      
      // reply
      const replyButton = document.createElement('button');
      replyButton.className = 'reply-button btn btn-warning';
      replyButton.innerHTML = 'Reply';
      replyButton.addEventListener("click", () => {
        load_prefilled_compose_view(emailno);
      });
      // reply

      senderElement.className = "email-sender";
      senderElement.innerHTML = 'Sender: ' + sender;
      recipientsElement.className = 'email-recipients';
      recipientsElement.innerHTML = 'Recipients: ' + recipients;
      subjectElement.className = "email-subject";
      subjectElement.innerHTML = 'Subject: ' + subject;
      timestampElement.className = 'email-timestamp';
      timestampElement.innerHTML = 'Timestamp: ' + timestamp;
      bodyElement.className = 'email-body';
      bodyElement.innerHTML = 'Body: ' + body;

      const detailedEmailElement = document.createElement('div');
      detailedEmailElement.className = 'detailed-email';
      
      const detailedViewElement = document.querySelector('#detailed-view');
      
      detailedEmailElement.append(senderElement);
      detailedEmailElement.append(recipientsElement);
      detailedEmailElement.append(subjectElement);
      detailedEmailElement.append(timestampElement);
      detailedEmailElement.append(bodyElement);
      detailedEmailElement.append(archiveButton);
      detailedEmailElement.append(replyButton);
      
      detailedViewElement.append(detailedEmailElement);
      // ... do something else with email ...
  })
  .then(() => {
    // Show the deetailed email and hide other views
    document.querySelector('#detailed-view').style.display = 'block';    
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    // Show the deetailed email and hide other views END


    //buttons
    document.querySelector('#inbox').disabled = false;
    //buttons
  });
  
  fetch(`/emails/${emailno}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });


  // How does this work ?
  // It is deleted after we left the page
  let detailedViewElement = document.querySelector('#detailed-view');
  while(detailedViewElement.firstChild) {
    detailedViewElement.removeChild(detailedViewElement.firstChild);
  }
}

function load_prefilled_compose_view(emailno) {
  fetch(`/emails/${emailno}`)
  .then(response => response.json())
  .then((email) => {
    
    compose_email();
    
    const subject = email.subject;
    const recipient = email.sender;
    const body = email.body;
    const bodyPrefill = `On ${email.timestamp} ${email.sender} wrote:\n`
    
    document.querySelector('#compose-recipients').value = recipient;
    if (subject.slice(0, 3) === 'Re:') {
      document.querySelector('#compose-subject').value = email.subject;
    } else {
      document.querySelector('#compose-subject').value = 'Re:' + email.subject;
    }
    document.querySelector('#compose-body').value = `${bodyPrefill} + ${body}\n`;
  });

}