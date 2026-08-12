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

export {
    createATweet
}