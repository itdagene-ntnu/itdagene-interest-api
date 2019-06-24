const nodemailer = require('nodemailer');
const creds = require('./client_secret.json');
const fs = require('fs');
const path = require('path');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL,
    serviceClient: creds.client_id,
    privateKey: creds.private_key
  }
});

async function mailHandler(interest) {
  fs.readFile(path.resolve(__dirname, '../public/mailTemplate'), function(
    err,
    html
  ) {
    transporter.sendMail({
      from: `"itDAGENE ${process.env.REACT_APP_YEAR} Interesse" <${process.env.EMAIL}>`,
      to: `${interest.contactPerson} - ${interest.companyName} <${interest.contactEmail}>`,
      subject: `itDAGENE ${process.env.REACT_APP_YEAR}: ${interest.companyName}`,
      text: 'Bekreftelse Interesse itDAGENE',
      html: html
    });
  });
}

module.exports = mailHandler;
