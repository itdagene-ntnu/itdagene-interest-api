const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');

async function interestHandler(entryObject) {
  // Access and get info from the document
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheet = info.worksheets[0];

  // Add the new row, add date, remove reCAPTCHA
  // Could just be with a remove and an append, but i think
  // think this gives a better overview over what date is sent
  const parsedRow = {
    dato: new Date().toLocaleString('no', { hour12: false }),
    bedriftsnavn: entryObject.companyName,
    Kontaktperson: entryObject.contactPerson,
    epost: entryObject.contactEmail,
    telefon: entryObject.contactTlf,
    dag: entryObject.day,
    marathon: entryObject.marathon,
    melding: entryObject.message,
    engelsk: entryObject.english
  };

  const addRowAsync = promisify(sheet.addRow);

  // Use promisify to return a promise
  return addRowAsync(parsedRow).then(function(res) {
    return {
      success: true,
      dato: res.dato
    };
  });
}
module.exports = interestHandler;
