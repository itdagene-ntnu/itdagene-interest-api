const axios = require('axios');

async function recaptchaHandler(response) {
  secret = process.env.RECAPTCHA_SECRET;
  return axios
    .post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    )
    .then(function(res) {
      return {
        status: res.status,
        data: res.data
      };
    });
}

module.exports = recaptchaHandler;
