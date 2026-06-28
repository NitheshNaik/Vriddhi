const nodemailer = require('nodemailer');

// ── Transporter ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Shared brand style block ───────────────────────────────────────────────
const brandStyle = `
  font-family: 'Inter', Arial, sans-serif;
  background: #fbf9f9;
  margin: 0; padding: 0;
`;

const cardStyle = `
  background: #ffffff;
  border-radius: 12px;
  padding: 40px 36px;
  max-width: 480px;
  margin: 40px auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const headerStyle = `
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0ede9;
`;

const titleStyle = `
  font-size: 20px; font-weight: 700;
  color: #1b1c1c; margin: 0;
`;

const subtitleStyle = `
  font-size: 13px; color: #5f5e5e; margin: 4px 0 0;
`;

const otpBoxStyle = `
  background: linear-gradient(135deg, #fff5f0, #fff8f4);
  border: 2px solid #ffb693;
  border-radius: 12px;
  text-align: center;
  padding: 24px 20px;
  margin: 24px 0;
`;

const otpCodeStyle = `
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 12px;
  color: #a04100;
  font-family: 'Courier New', monospace;
  line-height: 1;
`;

const noteStyle = `
  font-size: 13px;
  color: #8e7164;
  text-align: center;
  margin: 16px 0 0;
`;

const footerStyle = `
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f0ede9;
  font-size: 12px;
  color: #9e9e9e;
  text-align: center;
`;

const btnStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #a04100, #ff6b00);
  color: #ffffff !important;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  margin: 24px 0 8px;
`;

// ── OTP Email ──────────────────────────────────────────────────────────────
async function sendOtpEmail(to, otp) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${brandStyle}">
  <div style="${cardStyle}">
    <div style="${headerStyle}">
      <div style="${titleStyle}">Vriddhi</div>
      <div style="${subtitleStyle}">Smart Business Ledger</div>
    </div>

    <h2 style="font-size:22px;font-weight:700;color:#1b1c1c;margin:0 0 8px;">Verify your email</h2>
    <p style="font-size:15px;color:#5f5e5e;margin:0 0 4px;">Use the code below to complete your account registration.</p>

    <div style="${otpBoxStyle}">
      <div style="font-size:12px;font-weight:600;color:#8e7164;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Your Verification Code</div>
      <div style="${otpCodeStyle}">${otp}</div>
    </div>

    <p style="${noteStyle}">⏱️ This code expires in <strong>10 minutes</strong>.<br>If you didn't request this, you can safely ignore this email.</p>

    <div style="${footerStyle}">
      Vriddhi Security Verification Team<br>
      This is an automated message — please do not reply.
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Vriddhi" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your Vriddhi verification code`,
    html,
  });
}

// ── Reset Password Email ───────────────────────────────────────────────────
async function sendResetEmail(to, resetLink) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${brandStyle}">
  <div style="${cardStyle}">
    <div style="${headerStyle}">
      <div style="${titleStyle}">Vriddhi</div>
      <div style="${subtitleStyle}">Smart Business Ledger</div>
    </div>

    <h2 style="font-size:22px;font-weight:700;color:#1b1c1c;margin:0 0 8px;">Reset your password</h2>
    <p style="font-size:15px;color:#5f5e5e;margin:0;">We received a request to reset the password for your Vriddhi account. Click the button below to choose a new password.</p>

    <div style="text-align:center;margin:8px 0;">
      <a href="${resetLink}" style="${btnStyle}">Reset My Password</a>
      <div style="font-size:12px;color:#9e9e9e;margin-top:6px;">This link expires in <strong>15 minutes</strong>.</div>
    </div>

    <p style="font-size:13px;color:#9e9e9e;margin-top:16px;">If you didn't request a password reset, please ignore this email. Your account is safe.</p>

    <div style="${footerStyle}">
      Vriddhi Security Verification Team<br>
      This is an automated message — please do not reply.
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Vriddhi" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your Vriddhi password',
    html,
  });
}

module.exports = { sendOtpEmail, sendResetEmail };