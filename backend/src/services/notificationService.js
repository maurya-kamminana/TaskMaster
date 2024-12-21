const { User, Project, Notification } = require('../models');
const { consumeNotificationFromKafka } = require('../utils/kafka');
const nodemailer = require("nodemailer");

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.log('Error sending email:', error);
  }
};

const handleUserAdded = async (message) => {
    const { projectId, userId } = message;
    // await Notification.create({
    //   user_id: userId,
    //   type: 'project_user_added',
    //   message: `You have been added to project ${projectId}`
    // });

    // Send an email to the user
    const user = await User.findByPk(userId);
    const project = await Project.findByPk(projectId);
    const email = user.email;
    const subject = 'Added to a project';
    const text = `Hi ${user.username}, \nYou have been added to project ${project.name}`;
    sendEmail(email, subject, text);
};

const handleUserRemoved = async (message) => {
    const { projectId, userId } = message;
    // await Notification.create({
    //   user_id: userId,
    //   type: 'project_user_removed',
    //   message: `You have been removed from project ${projectId}`
    // });

    // Send an email to the user
    const user = await User.findByPk(userId);
    const project = await Project.findByPk(projectId);
    const email = user.email;
    const subject = 'Removed from a project';
    const text = `Hi ${user.username}, \nYou have been removed from project ${project.name}`;
    sendEmail(email, subject, text);
};

const start = async () => {

    const callbackMap = {
        'project.user.added': handleUserAdded,
        'project.user.removed': handleUserRemoved
    };
    await consumeNotificationFromKafka(Object.keys(callbackMap), callbackMap);
}

module.exports = { start };