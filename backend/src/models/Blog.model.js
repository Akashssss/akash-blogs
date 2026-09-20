import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema({
    blog_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    banner: {
        type: String,
        default: ""
    },
    banner_public_id: {
        type: String,
        default: ""
    },
    des: {
        type: String,
        maxlength: 250,
        trim: true
    },
    content: {
        type: Schema.Types.Mixed,
        default: []
    },
    tags: {
        type: [String],
        index: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users',
        index: true
    },
    read_time: {
        words: { type: Number, default: 0 },
        minutes: { type: Number, default: 1 }
    },
    activity: {
        total_likes: { type: Number, default: 0 },
        total_comments: { type: Number, default: 0 },
        total_reads: { type: Number, default: 0 },
        total_parent_comments: { type: Number, default: 0 },
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }],
    draft: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: {
        createdAt: 'publishedAt',
        updatedAt: 'updatedAt'
    }
});

// High performance compound indexes for fast feed queries
blogSchema.index({ draft: 1, publishedAt: -1 });
blogSchema.index({ tags: 1, draft: 1, publishedAt: -1 });
blogSchema.index({ author: 1, draft: 1, publishedAt: -1 });
blogSchema.index({ "activity.total_reads": -1, "activity.total_likes": -1, publishedAt: -1 });
blogSchema.index({ title: 'text', des: 'text' });

export const Blog = mongoose.models.blogs || mongoose.model("blogs", blogSchema);
export default Blog;
