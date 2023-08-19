const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        receiver: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        content: {
            type: String,
            maxlength: [100, 'Nội dung thông báo không được vượt quá 100 kí tự'],
            required: [true, 'Nội dung thông báo là bắt buộc'],
        },
        isSeen: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
