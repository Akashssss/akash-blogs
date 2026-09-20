import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    blog_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'blogs',
        index: true
    },
    blog_author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    children: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }],
    commented_by: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'users',
        index: true
    },
    isReply: {
        type: Boolean,
        default: false,
        index: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'comments',
        default: null
    }
}, {
    timestamps: {
        createdAt: 'commentedAt'
    }
});

commentSchema.index({ blog_id: 1, isReply: 1, commentedAt: -1 });

export const Comment = mongoose.models.comments || mongoose.model("comments", commentSchema);
export default Comment;
