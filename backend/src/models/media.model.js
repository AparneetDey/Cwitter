import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

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

mediaSchema.methods.isOwner = function(userId) {
    return this.owner.equals(userId);
}

mediaSchema.plugin(aggregatePaginate)

export const Media = mongoose.model("Media", mediaSchema);