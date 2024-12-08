const mongoose = require('mongoose');

// Comments Schema
const CommentSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.UUID,
        ref: 'Task',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.UUID,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'comments'
});

// Notifications Schema
const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.UUID,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Task Update', 'Role Change', 'New Comment'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'notifications'
});

// Create Models
const Comment = mongoose.model('Comment', CommentSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// Validation Middleware Example for Comments
CommentSchema.pre('save', function(next) {
    // Example validation
    if (this.comment.length > 500) {
        next(new Error('Comment cannot exceed 500 characters'));
    }
    next();
});

// Static method for creating notifications
NotificationSchema.statics.createNotification = async function(userId, type, message) {
    try {
        const notification = new this({
            user_id: userId,
            type,
            message
        });
        return await notification.save();
    } catch (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
    }
};

module.exports = {
    Comment,
    Notification
};