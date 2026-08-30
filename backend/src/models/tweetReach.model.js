import mongoose, { Schema } from "mongoose";

const tweetReachSchema = new Schema(
    {
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
            required: true
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// One user can only contribute once to the reach of a tweet
tweetReachSchema.index(
    { tweet: 1, user: 1 },
    { unique: true }
);

export const TweetReach = mongoose.model("TweetReach", tweetReachSchema);