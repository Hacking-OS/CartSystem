const nodemailer = require("nodemailer");
const config = require("../config");

const isEmailEnabled = config.email.enabled;

const transportOptions = {
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: config.email.rejectUnauthorized,
  },
};

if (config.email.host) {
  transportOptions.host = config.email.host;
} else {
  transportOptions.service = config.email.service;
}

const transporter = isEmailEnabled ? nodemailer.createTransport(transportOptions) : null;

const sendMail = async (options) => {
  if (!isEmailEnabled || !transporter) {
    return {
      skipped: true,
      message: "Email delivery disabled for this demo build.",
      options,
    };
  }

  const mailOptions = {
    from: options.from || config.email.from || config.email.user,
    ...options,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendMail,
  isEmailEnabled: () => isEmailEnabled,
};

