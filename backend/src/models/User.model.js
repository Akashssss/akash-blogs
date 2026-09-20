import mongoose, { Schema } from "mongoose";

let profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
let profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

const userSchema = new Schema({
    personal_info: {
        fullname: {
            type: String,
            lowercase: true,
            required: true,
            minlength: [3, 'Fullname must be at least 3 letters long'],
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
        },
        username: {
            type: String,
            minlength: [3, 'Username must be at least 3 letters long'],
            unique: true,
            trim: true,
            index: true
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio should not exceed 200 characters'],
            default: "",
        },
        profile_img: {
            type: String,
            default: () => {
                const collection = profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)];
                const seed = profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)];
                return `https://api.dicebear.com/6.x/${collection}/svg?seed=${seed}`;
            }
        },
    },
    role: {
        type: String,
        enum: ['user', 'author', 'editor', 'admin'],
        default: 'author'
    },
    social_links: {
        youtube: { type: String, default: "" },
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        github: { type: String, default: "" },
        website: { type: String, default: "" },
    },
    account_info: {
        total_posts: { type: Number, default: 0 },
        total_reads: { type: Number, default: 0 },
    },
    google_auth: {
        type: Boolean,
        default: false
    },
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: 'blogs',
        default: []
    }],
    bookmarks: [{
        type: Schema.Types.ObjectId,
        ref: 'blogs',
        default: []
    }]
}, {
    timestamps: {
        createdAt: 'joinedAt'
    }
});

export const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;
