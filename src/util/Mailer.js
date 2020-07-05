"use strict";
const nodemailer = require("nodemailer");
const ejs = require("ejs");

let transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_AUTH_USER,
    pass: process.env.MAIL_AUTH_PASSWORD
  }
});

exports.TEMPLATES = {
  SIGNUP_CREDENTIALS: {
    from: process.env.MAIL_FROM,
    subject: "Verify your email Now!",
    html: "../../public/mail/verify_code.ejs",
    logo: process.env.HOST + "/logo.png"
  }
};

exports.sendMail = (to, data, template) => {
  let templateData = {
    code: data.code,
    subject: template.subject,
    logo: template.logo
  };

  ejs.renderFile(template.html, templateData, (err, html) => {
    if (err) console.log("error in ejs file render " + err);
    let mailOptions = {
      from: template.from,
      to: to,
      subject: template.subject,
      html: html
    };

    transporter
      .sendMail(mailOptions)
      .then(function (info) {
        console.log("Email sent: " + info.response);
      })
      .catch(err => console.log(err));
  });
};
