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
