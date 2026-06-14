import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send the purchased account credentials to the buyer.
 *
 * @param {object} params
 * @param {string} params.to           Buyer's email address
 * @param {string} params.productName  Human-readable product name
 * @param {string} params.credentials  Decrypted credential string (e.g. "email:password")
 * @param {string} params.orderId      UUID of the order for reference
 */
export async function sendOrderConfirmation({ to, productName, credentials, orderId }) {
  const [credEmail, credPassword] = credentials.split(':');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Order is Ready</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6fa; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff;
                 border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
    .header { background: linear-gradient(135deg, #4f6ef7, #2d42cc);
              padding: 36px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #555; line-height: 1.6; margin: 0 0 16px; }
    .cred-box { background: #f0f4ff; border: 1px solid #c7d4ff;
                border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .cred-box .label { font-size: 11px; text-transform: uppercase;
                       letter-spacing: .8px; color: #7a8ccc; margin-bottom: 4px; }
    .cred-box .value { font-size: 16px; font-weight: 700; color: #1a2870; word-break: break-all; }
    .footer { background: #f4f6fa; padding: 20px 32px; text-align: center;
              font-size: 12px; color: #aaa; }
    .order-id { font-size: 11px; color: #bbb; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Order is Ready!</h1>
    </div>
    <div class="body">
      <p>Thank you for your purchase. Here are your account credentials for <strong>${productName}</strong>:</p>

      <div class="cred-box">
        <div class="label">Email / Username</div>
        <div class="value">${credEmail || credentials}</div>
      </div>

      ${credPassword ? `
      <div class="cred-box">
        <div class="label">Password</div>
        <div class="value">${credPassword}</div>
      </div>
      ` : ''}

      <p>Please change the password after your first login and <strong>do not share</strong> these credentials with anyone.</p>
      <p>If you have any issues, reply to this email and our support team will assist you.</p>
    </div>
    <div class="footer">
      Digital Product Store &nbsp;·&nbsp; Automated delivery
      <div class="order-id">Order ID: ${orderId}</div>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `✅ Your ${productName} credentials are here!`,
    html,
  });
}
