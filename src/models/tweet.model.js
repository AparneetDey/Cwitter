import mongoose, { Schema } from "mongoose";
import aggregatePaginate  from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        media: [
            {
                type: String, // url from imageKit
            }
        ],
        tweet : {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        }
    }
)

tweetSchema.plugin(aggregatePaginate);

tweetSchema.methods.isOwner = function (userId) {
    return this.owner.equals(userId)
}

export const Tweet = mongoose.model("Tweet", tweetSchema);