const { 
    User, 
    Project, 
    Task, 
    Role, 
    sequelize, 
    syncModels 
} = require('./postgres_models'); // Corrected import

const { 
    Comment, 
    Notification 
} = require('./mongodb_models'); // Make sure this path is correct

module.exports = {
    // PostgreSQL Models
    User,
    Project,
    Task,
    Role,
    sequelize,
    syncModels,

    // MongoDB Models
    Comment,
    Notification
};
