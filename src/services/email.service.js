const transporter = require("../config/mail");

const sendUserPasswordEmail = async ({ username, email, password }) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Your account has been created",
    html: `
      <h2>Hello ${username},</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><strong>Role:</strong> user</p>
      <p>Please login and change your password after first login.</p>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendUserPasswordEmail,
};