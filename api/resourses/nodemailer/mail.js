var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: true, // use SSL
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.GMAIL_APP_TOKEN,
  }
});



const sendMail = async function (mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(info)
  } catch (error) {
    console.log(error)
  }
}

module.exports = sendMail;