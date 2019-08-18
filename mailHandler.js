const nodemailer = require('nodemailer');
const creds = require('./client_secret.json');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
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
  // Choose what tamplate to use
  const templateName = interest.english
    ? './mailTemplate_engelsk'
    : './mailTemplate_norsk';

  // Get the HTML from the template then,
  // Replace elements in the template to make it 'DYNAMIC AF'
  const html = fs
    .readFileSync(path.resolve(__dirname, templateName), 'utf8')
    .replace('&lt;COMPANYNAME&gt;', interest.companyName)
    .replace('&lt;YEAR&gt;', process.env.YEAR)
    .replace(
      '&lt;DATO&gt;',
      new Date().toLocaleString('no', { hour12: false })
    );

  // Returns a promise from Nodemailer
  return transporter.sendMail({
    from: `"itDAGENE ${process.env.YEAR}" <${process.env.EMAIL}>`,
    to: `${interest.contactPerson} - ${interest.companyName} <${interest.contactEmail}>`,
    subject: `itDAGENE ${process.env.YEAR}: ${interest.companyName}`,
    text: `itDAGENE ${process.env.YEAR}: ${interest.companyName} confirmation email`,
    html: html
  });
}

module.exports = mailHandler;
