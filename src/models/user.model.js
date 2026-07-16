import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

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



export const User = mongoose.model("User", userSchema);

userSchema.pre("Save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect(async function(password) {
    return await bcrypt.compare(password, this.password)
})