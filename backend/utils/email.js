const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

exports.sendInvitationEmail = async (recipientEmail, inviterName, projectName, token) => {
  try {
    const transporter = createTransporter();
    const invitationLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Invitation to collaborate on ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Collaboration Invitation</h2>
          <p>Hello!</p>
          <p>${inviterName} has invited you to collaborate on the project <strong>${projectName}</strong>.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${invitationLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px;">
            Accept Invitation
          </a>
          <p>This invitation will expire in 7 days.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you didn't request this invitation, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send invitation email');
  }
};