// Express
const express = require('express');
const bodyParser = require('body-parser');

// API security
const helmet = require('helmet');

// Handlers
const interestHandler = require('./interestHandler');
const recaptchaHandler = require('./recaptchaHandler');
const mailHander = require('./mailHandler');
const checkConnection = require('./checkConnection');

const Sentry = require('@sentry/node');

const app = express();
const port = 8000;

// Use dotenv to get variables from .env
const dotenv = require('dotenv');
dotenv.config();

// Only run sentry errors in production
if (process.env.NODE_ENV === 'production') {
  console.log(`===Running in ${process.env.NODE_ENV} mode===`);
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

// Low key security
app.use(
  helmet({
    referrerPolicy: true,
    featurePolicy: {
      features: {
        vibrate: ["'none'"],
      },
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  // Only allow requests from itdagene in production
  const origin = process.env.NODE_ENV === 'production' ? '*.itdagene.no' : '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Feature-policy');
  next();
});

// Logging
const logging = require('./loggStrings');
const morgan = require('morgan');
const uuidv1 = require('uuid/v1');
// Creates custom body based on a string template
// Assigns a cistom id using uuidv1
// Use logg templates to logg both initail request
// and full response
morgan.token('body', function (req, res) {
  return logging.bodyString(req);
});
function assignId(req, res, next) {
  req.id = uuidv1();
  next();
}
app.use(assignId);
morgan.token('id', function getId(req) {
  return req.id;
});
app.use(
  morgan(logging.tinyLoggString, {
    immediate: true,
    stream: logging.accessLogStream,
  })
);
app.use(
  morgan(logging.loggString, {
    stream: logging.accessLogStream,
  })
);

// POST endpoint. Takes the json from the from as input
app.post('/api', async function (req, res) {
  const entry = req.body;
  const time = new Date().toLocaleString('no', { hour12: false });
  console.log(time, '\n\nIncoming request at');
  console.log(time, entry);

  Sentry.captureException('Ting og tang');
  const recaptchaResponse = await recaptchaHandler(entry.recaptcha);
  if (recaptchaResponse.data.success) {
    console.log(time, 'SUCCESS');
    console.log(time, 'reCAPTCHA was correct');

    const interestResponse = await interestHandler(entry);
    if (interestResponse.success) {
      console.log(time, 'SUCCESS');
      console.log(time, `Interest was logged at ${interestResponse.dato}`);

      const mailResponse = await mailHander(entry);
      if (mailResponse) {
        console.log(time, 'SUCCESS');
        console.log(time, `Mail with id ${mailResponse.messageId} was sent`);
        console.log(time, mailResponse);

        res.sendStatus(200);
        res.end();
      } else {
        console.error(time, 'FAILURE');
        console.error(time, 'Mail was not sent');
        Sentry.captureException('Mail was not sent');
        res.sendStatus(500);
        res.end();
      }
    } else {
      console.error(time, 'FAILURE');
      console.error(time, 'Interest was not logged');
      Sentry.captureException('Interest was not logged');
      res.sendStatus(500);
      res.end();
    }
  } else {
    console.error(time, 'FAILURE');
    console.error(time, 'reCAPTCHA was wrong');
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
