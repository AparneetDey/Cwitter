import { Schema } from "mongoose";

const mediaSchema = new Schema(
    {
        url: {
            type: String,
            require: true
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
            require: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    },
    {
        timestamps: true
    }
)