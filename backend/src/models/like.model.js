import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

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

likeSchema.plugin(aggregatePaginate);

export const Like = mongoose.model("Like", likeSchema);