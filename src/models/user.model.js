import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            lowercase: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String //Url from cloudinary
        },
        coverImage: {
            type: String //Url from coverImage
        },
        bookMarks: [
            {
                type: Schema.Types.ObjectId,
                ref: "Tweet"
            }
        ]
    },
    {
        timestamps: true
    }
)



const User = mongoose.model("User", userSchema);