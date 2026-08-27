import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Media } from "../models/media.model.js";
import { Tweet } from "../models/tweet.model.js";

const addAMedia = asyncHandler(async (req, res) => {
    const {url} = req.body;

    if(!url) throw new ApiError(400, "Media URL is required");

    const {tweetId} = req.params;

    if(!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const media = await Media.create({
        url,
        tweet: tweetId,
        owner: req?.user?._id
    })

    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            media,
            "Tweet media created successfully"
        )
    )
})

const deleteAMedia = asyncHandler(async (req, res) => {
    const {mediaId} = req.params;

    if(!mediaId || mediaId.trim() === "") throw new ApiError(400, "Media id is required");

    const existedMedia = await Media.findById(mediaId);

    if(!existedMedia) throw new ApiError(404, "Media not found");

    if(!existedMedia.isOwner(req?.user?._id)) throw new ApiError(409, "Unauthorized action");

    const deletedResponse = await Media.deleteOne({_id: mediaId});

    if(!deletedResponse.acknowledged) throw new ApiError(500, "Something went wrong while deleting the media");

    await Tweet.updateMany(
        { tweet: tweetId },
        {
            $pull: {
                media: mediaId
            }
        }
    );

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Media deleted successfully"
        )
    )
})

const deleteTweetMedia = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const existedTweet = await Tweet.findById(tweetId);

    if(!existedTweet.isOwner(req?.user?._id)) throw new ApiError(409, "Unauthorized request");

    const deletedResponse = await Media.deleteMany({tweet: tweetId});

    if(!deletedResponse.acknowledged) throw new ApiError(500, "Something went wrong while deleting tweet media");

    res
    .status(200)
    .json(
        200,
        {},
        "Tweet media deleted successfully"
    )
})

export {
    addAMedia,
    deleteAMedia,
    deleteTweetMedia
}