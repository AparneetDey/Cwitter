import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

const createATweet = asyncHandler(async (req, res) => {
    const {content, media = []} = req.body;

    if(!content || content?.trim() === "") throw new ApiError(400, "Content is required");

    const tweet = await Tweet.create({
        content,
        media,
        owner: req?.user?._id
    })

    if(!tweet) throw new ApiError(500, "Something went wrong while creating tweet");

    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    )
})

const deleteATweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId && tweetId?.trim() === "") throw new ApiError(400, "Tweet Id is required");

    const storedTweet = await Tweet.findById(tweetId);

    if(!storedTweet) throw new ApiError(404, "Tweet does not exist");

    console.log(storedTweet.isOwner(req?.user?._id))
    if(!storedTweet.isOwner(req?.user?._id)) throw new ApiError(401, "Unauthorized Action");

    const tweetDeleteResponse = await Tweet.deleteOne({_id: tweetId});

    if(!tweetDeleteResponse.acknowledged) throw new ApiError(500, "Something went wrong while deleting tweet");

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

export {
    createATweet,
    deleteATweet
}