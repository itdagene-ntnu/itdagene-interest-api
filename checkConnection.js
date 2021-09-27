const { GoogleSpreadsheet } = require('google-spreadsheet');

const creds = require('./client_secret.json');

// Use dotenv to get variables from .env
const dotenv = require('dotenv');
dotenv.config();

async function checkConnection() {
  let connected;
  // Try to access the sheet
  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    console.log('SUCCESS');
    console.log(`Access to sheet [${sheet.title}] was granted`);
    connected = true;
  } catch (e) {
    console.log('ERROR');
    console.log(`Access to sheet was not granted with ${e}`);
    connected = false;
  }

  return connected;
}
module.exports = checkConnection;
