const axios = require('axios');

// Use dotenv to get variables from .env
const dotenv = require('dotenv');
dotenv.config();

async function recaptchaHandler(response) {
  const secret = process.env.RECAPTCHA_SECRET;

  // Returns an axios promise
  return axios
    .post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      }
    )
    .then(function (res) {
      return {
        status: res.status,
        data: res.data,
      };
    });
}

module.exports = recaptchaHandler;
