import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    type: {
        type: String,
        enum: ["like", "comment", "reply"],
        required: true
    },
    blog: {
        type: Schema.Types.ObjectId,
        ref: 'blogs',
        index: true
    },
    notification_for: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users',
        index: true
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'comments'
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: 'comments'
    },
    replied_on_comment: {
        type: Schema.Types.ObjectId,
        ref: 'comments'
    },
    seen: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

notificationSchema.index({ notification_for: 1, seen: 1, createdAt: -1 });

export const Notification = mongoose.models.notifications || mongoose.model("notifications", notificationSchema);
export default Notification;
