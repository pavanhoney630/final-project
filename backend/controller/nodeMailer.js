const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email from .env file
    pass: process.env.EMAIL_PASS, // App password from .env file
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

const sendEmailInvite = async (email, accessType, inviter) => {
    try {
      // Dynamically set the accessType in the URL
      const accessUrl = `http://localhost:3000/profile?email=${encodeURIComponent(email)}&accessType=${encodeURIComponent(accessType)}`;
  
      const mailOptions = {
        from: 'sivalingampavankalyan@gmail.com', // Sender's email
        to: email, // Recipient's email
        subject: `You’ve been invited to join the workspace`, // Invitation subject
        html: `
          <p>Hello, <strong>${email}</strong>,</p>
          <p>You’ve been invited to access the workspace with <strong>${accessType}</strong> access.</p> <!-- Include accessType here -->
          <p><a href="${accessUrl}" target="_blank">Click here to access your workspace with ${accessType} access</a></p> <!-- Include accessType here in the link text -->
          <p>Best regards,<br>Your App Team</p>
        `,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Invite sent:', info.response);
    } catch (error) {
      console.error('Error sending invite:', error);
      throw new Error('Failed to send email invite');
    }
  };
  
const sendFormEmail = async (email, formUrl, inviterEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email
      to: email, // Recipient's email
      subject: 'You Have a New Form to Fill Out', // Subject
      html: `
        <p>Hello, you have been invited to fill out a form.</p>
        <p>Click the link below to access the form:</p>
        <p><a href="${formUrl}" target="_blank">Click here to access the form</a></p>
        <p>Regards,<br>${inviterEmail}</p>
      `, // Email body with dynamic form URL
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Form link sent:', info.response);
  } catch (error) {
    console.error('Error sending form link:', error);
    throw new Error('Failed to send form link');
  }
};

module.exports = { sendEmailInvite, sendFormEmail};
