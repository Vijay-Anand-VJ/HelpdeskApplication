const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a Transporter (Using Ethereal for testing)
  // In production, you would use Gmail or Outlook here
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });

  // 2. Define Email Options
  const message = {
    from: '"Helpdesk Support" <noreply@helpdesk.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<b>${options.message}</b>`, // Simple HTML version
  };

  // 3. Send Email
  const info = await transporter.sendMail(message);

  console.log("📧 Email Sent: %s", info.messageId);
  console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;