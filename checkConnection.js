const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');

async function checkConnection() {
  let connected;
  // Try to access the sheet
  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    const sheet = info.worksheets[0];
    console.log('SUCCESS'.bgGreen);
    console.log(`Access to sheet [${sheet.title}] was granted`.green);
    connected = true;
  } catch (e) {
    console.log('ERROR'.bgRed);
    console.log(`Access to sheet was not granted with ${e}`.red);
    connected = false;
  }

  return connected;
}
module.exports = checkConnection;
