import { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    },
    {
        timestamps: true
    }
)