"use strict";
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

let transporter = nodemailer.createTransport({
  service: "sparkpost",
  auth: {
    user: "SMTP_Injection",
    pass: "37d02f2f3f745d8dd4e6dd89582e446a6833f310"
  }
});

exports.TEMPLATES = {
  SIGNUP_CREDENTIALS: () => {
    return {
      from: '"Shsteels" <mail@shsteels.com>',
      subject: "Verify your email Now!",
      html: path.join(__dirname, "../../public/mail/verify_code.ejs"),
      logo: process.env.HOST + "/logo.png"
    };
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
      text: "New Request", // plain text body
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
