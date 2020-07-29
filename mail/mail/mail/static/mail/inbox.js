document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  const formElement = document.querySelector('#compose-form');
  formElement.onsubmit = sendMail

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  console.log('heere');
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function sendMail() {
  const recipientsElement = document.querySelector('#compose-recipients');
  const subjectElement = document.querySelector('#compose-subject');
  const bodyElement = document.querySelector('#compose-body');
  
  recipients = recipientsElement.value
  subject = subjectElement.value
  body = bodyElement.value
  
  // let statusCode;
  // let message;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients:recipients,
      subject:subject,
      body:body
    })
  })
  .then(response => response.json())
  .then(() => {console.log('here');console.log('leaving'); return load_mailbox()})
  // .then(response => {
  //   // statusCode = response.status;
  //   // console.log(`status code inside then is ${statusCode}`);
  //   return response.json();
  //   })
  // .then(result => {
  //   resulted_object = result;
  // })
  // .then(() => {
  //   infoElement = document.querySelector('#mail-sending-info')
  //   if (statusCode == 201) {
  //     infoElement.innerHTML = resulted_object.message; //`${message}`;
  //     infoElement.style.setProperty('color', 'green');
  //   } else if (statusCode == 400) {
  //     infoElement.innerHTML = resulted_object.error;
  //     infoElement.style.setProperty('color', 'aqua');
  //   } else {
  //     infoElement.innerHTML = 'Error sending mail';
  //     infoElement.style.setProperty('color', 'red');
  //   }
  //   // console.log(`status code outside then is ${statusCode}`);
  // })
  
  
  // abort the submit
  return false;
}