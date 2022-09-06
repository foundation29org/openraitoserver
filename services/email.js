'use strict'

const { TRANSPORTER_OPTIONS, client_server, blobAccessToken } = require('../config')
const nodemailer = require('nodemailer')
var hbs = require('nodemailer-express-handlebars')

var options = {
     viewEngine: {
         extname: '.hbs',
         layoutsDir: 'views/email/',
         defaultLayout : 'template'
     },
     viewPath: 'views/email/',
     extName: '.hbs'
 };

 var transporter = nodemailer.createTransport(TRANSPORTER_OPTIONS);
 transporter.use('compile', hbs(options));

function sendMailVerifyEmail (email, randomstring, lang, group){
  if(lang=='es'){
    var subjectlang='Raito - Activa la cuenta';
  }else if(lang=='pt'){
    var subjectlang='Raito - Ative a conta';
  }else if(lang=='de'){
    var subjectlang='Raito - Aktivieren Sie das Konto';
  }else if(lang=='nl'){
    var subjectlang='Raito - Activeer het account';
  }else{
    var subjectlang='Raito - Activate the account';
  }
  const decoded = new Promise((resolve, reject) => {
    var urlImg = 'https://raito29.azurewebsites.net/assets/img/logo-raito.png';
    var maillistbcc = [
      TRANSPORTER_OPTIONS.auth.user
    ];

    var mailOptions = {
      to: email,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: subjectlang,
      template: 'verify_email/_'+lang,
      context: {
        client_server : client_server,
        email : email,
        key : randomstring,
        urlImg: urlImg
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function sendMailRecoverPass (email, randomstring, lang){
  if(lang=='es'){
    var subjectlang='Raito - Recuperación de la cuenta';
  }else if(lang=='pt'){
    var subjectlang='Raito - Recuperação de conta';
  }else if(lang=='de'){
    var subjectlang='Raito - Kontowiederherstellung';
  }else if(lang=='nl'){
    var subjectlang='Raito - Accountherstel';
  }else{
    var subjectlang='Raito - Account Recovery';
  }
  const decoded = new Promise((resolve, reject) => {
    var urlImg = 'https://raito29.azurewebsites.net/assets/img/logo-raito.png';

    var maillistbcc = [
      TRANSPORTER_OPTIONS.auth.user,
    ];

    var mailOptions = {
      to: email,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: subjectlang,
      template: 'recover_pass/_'+lang,
      context: {
        client_server : client_server,
        email : email,
        key : randomstring,
        urlImg: urlImg
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}


function sendMailRequestNewLanguage (user, name, code){

  var maillistbcc = [
    TRANSPORTER_OPTIONS.auth.user
  ];

  const decoded = new Promise((resolve, reject) => {
    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: 'Request for new language',
      template: 'request_new_lang/_en',
      context: {
        user : user,
        name : name,
        code : code
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function sendMailRequestNewTranslation (user, lang, jsonData){

  var maillistbcc = [
    TRANSPORTER_OPTIONS.auth.user
  ];

  const decoded = new Promise((resolve, reject) => {
    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: 'Request for new translation',
      template: 'request_new_translation/_en',
      context: {
        user : user,
        lang : lang,
        jsonData : jsonData
      },
      attachments: [
      {   // utf-8 string as an attachment
          filename: lang+'.json',
          content: jsonData
      }]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function sendMailSupport (email, lang, role, supportStored){
  const decoded = new Promise((resolve, reject) => {
    var urlImg = 'https://raito29.azurewebsites.net/assets/img/logo-raito.png';
    var attachments = [];
    if(supportStored.files.length>0){
      supportStored.files.forEach(function(file) {
        var urlpath = blobAccessToken.blobAccountUrl+'filessupport/'+file+blobAccessToken.sasToken;
        attachments.push({filename: file, path: urlpath});
      });
    }
    var maillistbcc = [
      TRANSPORTER_OPTIONS.auth.user
    ];

    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: 'Mensaje para soporte de Raito',
      template: 'mail_support/_es',
      context: {
        email : email,
        lang : lang,
        info: supportStored
      },
      attachments: attachments
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function sendMailErrorFromServer (patient, msg, service){

  const decoded = new Promise((resolve, reject) => {
    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      subject: 'Error from server',
      template: 'error_from_server/_en',
      context: {
        client_server : client_server,
        patient : patient,
        msg : msg,
        service : service
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function sendMailErrorEmail (data, msg){

  const decoded = new Promise((resolve, reject) => {

    var mydata = JSON.stringify(data);
    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      subject: 'Error sending email: '+ msg,
      template: 'error_send_email/_en',
      context: {
        mydata : mydata
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}


function sendMailDev (params){
  const decoded = new Promise((resolve, reject) => {

    var maillistbcc = [
      TRANSPORTER_OPTIONS.auth.user
    ];

    var mailOptions = {
      to: 'dev@foundation29.org',
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: params.subject,
      template: 'mail_dev/_es',
      context: {
        data : JSON.stringify(params.data)
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}


module.exports = {
	sendMailVerifyEmail,
  sendMailRecoverPass,
  sendMailRequestNewLanguage,
  sendMailRequestNewTranslation,
  sendMailSupport,
  sendMailErrorFromServer,
  sendMailErrorEmail,
  sendMailDev
}
