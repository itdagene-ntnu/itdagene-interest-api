// Express
const express = require('express');
const bodyParser = require('body-parser');

// Logging
const morgan = require('morgan');
const uuidv1 = require('uuid/v1');

// API security
const helmet = require('helmet');

// Handlers
const interestHandler = require('./interestHandler');
const recaptchaHandler = require('./recaptchaHandler');
const mailHander = require('./mailHandler');
const checkConnection = require('./checkConnection');

// Log strings
const logging = require('./loggStrings');

const app = express();
const port = 8000;

// Sentry
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DNS });

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

// Create custom body token
morgan.token('body', function(req, res) {
  return logging.bodyString(req);
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
  morgan(logging.tinyLoggString, {
    immediate: true,
    stream: logging.accessLogStream
  })
);

// Then print long response
app.use(
  morgan(logging.loggString, {
    stream: logging.accessLogStream
  })
);

// POST endpoint. Takes the json from the from as input
app.post('/api', async function(req, res) {
  const entry = req.body;
  console.log(
    '\n\nIncoming request at',
    new Date().toLocaleString('no', { hour12: false })
  );
  console.log(entry);

  const recaptchaResponse = await recaptchaHandler(entry.recaptcha);
  if (recaptchaResponse.data.success) {
    console.log('SUCCESS');
    console.log('reCAPTCHA was correct');

    const interestResponse = await interestHandler(entry);
    if (interestResponse.success) {
      console.log('SUCCESS');
      console.log(`Interest was logged at ${interestResponse.dato}`);

      const mailResponse = await mailHander(entry);
      if (mailResponse) {
        console.log('SUCCESS');
        console.log(`Mail with id ${mailResponse.messageId} was sent`);
        console.log(mailResponse);

        res.sendStatus(200);
        res.end();
      } else {
        console.log('FAILURE');
        console.log('Mail was not sent');
        Sentry.captureException('Mail was not sent');
        res.sendStatus(500);
        res.end();
      }
    } else {
      console.log('FAILURE');
      console.log('Interest was not logged');
      Sentry.captureException('Interest was not logged');
      res.sendStatus(500);
      res.end();
    }
  } else {
    console.log('FAILURE');
    console.log('reCAPTCHA was wrong');
    Sentry.captureException('reCAPTCHA was wrong');
    res.sendStatus(500);
    res.end();
  }
});

const server = app.listen(port, async () => {
  console.log('SUCCESS');
  console.log(`Interestform API is up on port:${port}`);

  // Check the connection to the sheet
  const connection = await checkConnection();
  if (!connection) {
    server.close();
  }
});
