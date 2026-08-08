import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

userSchema.methods.generateAccessToken(async function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME
        }
    )
})

userSchema.methods.generateRefreshToken(async function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME
        }
    )
})