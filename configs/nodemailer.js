const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.APPMAIL_ACCOUNT,
    pass: process.env.APPMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

const saveDates = (host, guest, startDate, endDate, message, guestEmail) => {
  return contentHTML =
  `<body>
    <div>
      <h3>Hello ${host}!</h3>
      <p>We are happy to inform that you are about to know ${guest} who will be your guest from ${startDate} to ${endDate}.</p>
      <p>He/She has a message for you:</p>
      <p>${message}</p>
      <p>You can contact your future guest by email: <a>${guestEmail}</a></p>
    </div>
  </body>`
}

module.exports = {transporter, saveDates}