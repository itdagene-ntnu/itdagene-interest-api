const { GoogleSpreadsheet } = require('google-spreadsheet');

const creds = require('./client_secret.json');

// Use dotenv to get variables from .env
const dotenv = require('dotenv');
dotenv.config();

async function interestHandler(entryObject) {
  // Access and get info from the document
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  // Add the new row, add date, remove reCAPTCHA
  // Could just be with a remove and an append, but i think
  // think this gives a better overview over what date is sent
  const parsedRow = {
    Dato: new Date().toLocaleString('no', { hour12: false }),
    BedriftsNavn: entryObject.companyName,
    Kontaktperson: entryObject.contactPerson,
    Epost: entryObject.contactEmail,
    Telefon: entryObject.contactTlf,
    Dag: entryObject.day,
    Maraton: entryObject.marathon,
    Melding: entryObject.message,
    Engelsk: entryObject.english,
  };

  // Returns true if the row is added with no problem,
  // and returns false if the google throws an error
  return sheet
    .addRow(parsedRow)
    .then((row) => {
      return {
        success: true,
        dato: row.dato,
      };
    })
    .catch((error) => {
      return {
        success: false,
        error: error,
      };
    });
}
module.exports = interestHandler;
