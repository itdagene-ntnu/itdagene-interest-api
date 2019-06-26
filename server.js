// Express
const express = require('express');
const bodyParser = require('body-parser');

// Logging
const colors = require('colors');
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
const uuidv1 = require('uuid/v1');

// API security
const helmet = require('helmet');

// Handlers
const interestHandler = require('./interestHandler');
const recaptchaHandler = require('./recaptchaHandler');
const mailHander = require('./mailHandler');
const checkConnection = require('./checkConnection');

const app = express();
const port = 8000;

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Check the connection to the sheet
checkConnection();

// Logg String for printing response body
const bodyString = req => ` {
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
  path: path.join(__dirname, 'log')
});

// Create custom body token
morgan.token('body', function(req, res) {
  return bodyString(req);
});

// Create custom id token
function assignId(req, res, next) {
  req.id = uuidv1();
  next();
}
app.use(assignId);
morgan.token('id', function getId(req) {
  return req.id;
});

// First print short timestamp
app.use(
  morgan(tinyLoggString, {
    immediate: true,
    stream: accessLogStream
  })
);

// Then print long response
app.use(
  morgan(loggString, {
    stream: accessLogStream
  })
);

// POST endpoint. Takes the json from the from as input
app.post('/', async function(req, res) {
  const entry = req.body;
  console.log('Incoming request'.bgYellow);

  // Denne skal sjekke recaptcha, og retunerer et svar
  response = await recaptchaHandler(entry.recaptcha);

  if (response.data.success) {
    console.log('SUCCESS'.bgGreen);
    console.log('reCAPTCHA was correct'.green);
    interestHandler(entry);
    mailHander(entry);

    res.sendStatus(200);
    res.end();
  } else {
    console.log('FAILURE'.bgRed);
    console.log('reCAPTCHA was wrong'.red);

    res.sendStatus(403);
    res.end();
  }
});

app.listen(port, () => {
  console.log('SUCCESS'.bgGreen);
  console.log(`Interestform API is up on port:${port}!`.green);
});
