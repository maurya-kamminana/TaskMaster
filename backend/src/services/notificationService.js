const { Notification } = require('../models');
const { consumeNotificationFromKafka } = require('../utils/kafka');

const handleUserAdded = async (message) => {
    const { projectId, userId } = message;
    await Notification.create({
      user_id: userId,
      type: 'project_user_added',
      message: `You have been added to project ${projectId}`
    });
};

const handleUserRemoved = async (message) => {
    const { projectId, userId } = message;
    await Notification.create({
      user_id: userId,
      type: 'project_user_removed',
      message: `You have been removed from project ${projectId}`
    });
};

const start = async () => {
    const callbackMap = {
        'project.user.added': handleUserAdded,
        'project.user.removed': handleUserRemoved
    };
    await consumeNotificationFromKafka(Object.keys(callbackMap), callbackMap);
}

module.exports = { start };