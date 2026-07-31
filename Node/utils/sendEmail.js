const nodemailer = require("nodemailer");

// Gmail transport using the app credentials already in .env
// (APP_MAIL = the gmail address, APP_PASSWORD = a Gmail app password).
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.APP_MAIL,
        pass: process.env.APP_PASSWORD,
    },
});

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"Moment" <${process.env.APP_MAIL}>`,
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;
