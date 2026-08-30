import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Tweet } from "../models/tweet.model";
import { TweetReach } from "../models/tweetReach.model";

const recordTweetReach = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const existingTweet = await Tweet.findById(tweetId);

    if(!existingTweet) throw new ApiError(404, "Tweet does not exist");

    await TweetReach.updateOne(
        {
            tweet: tweetId,
            user: req?.user?._id
        },
        {
            $setOnInsert: {
                tweet: existingTweet._id,
                user: req?.user?._id
            }
        },
        {
            upsert: true
        }
    )

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet reach recorded successfully"
        )
    )
})

export {
    recordTweetReach
}