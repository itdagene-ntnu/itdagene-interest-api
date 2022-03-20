const rfs = require('rotating-file-stream');
const path = require('path');

// Logg String for printing response body
const bodyString = (req) => ` {
  CompanyName: ${req.body.companyName}
  ContactPerson: ${req.body.contactPerson}
  ContactEmail: ${req.body.contactEmail}
  ContactTlf: ${req.body.contactTlf}
  Day: ${req.body.day}
  Marathon: ${req.body.marathon}
  Message: ${req.body.message}
}`;

// Logg-String for printing immediate request
const tinyLoggString = `
============:date[web]===========
> Request
ID:\t:id
Addr\t::remote-addr
User\t:remote-user
Method\t:method
`;

// Logg-String for printing full response
const loggString = `
> Response
ID:\t:id
Date\t:date[web]
Addr\t::remote-addr
User\t:remote-user
Method\t:method
Url\t":url"
Ref\t":referrer HTTP/:http-version"
Status\t:status
Time\t:response-time ms
Body\t:body
====================================================
`;

// Create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log'),
});

module.exports.bodyString = bodyString;
module.exports.tinyLoggString = tinyLoggString;
module.exports.loggString = loggString;
module.exports.accessLogStream = accessLogStream;
