import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const existingTweet = await Tweet.findById(tweetId);

    if(!tweetId) throw new ApiError(404, "Tweet does not exists");

    const isTweetLiked = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req?.user?._id
        }
    )

    let message = "Tweet like toggle successfull";
    if(isTweetLiked) {
        await Like.deleteOne({_id: isTweetLiked._id});
        message = "Tweet unlike successfull"
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req?.user?._id
        })
        message = "Tweet like successfull"
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            message
        )
    )
})

export {
    toggleTweetLike
}