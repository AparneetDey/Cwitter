import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Media } from "../models/media.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const addAMedia = asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url) throw new ApiError(400, "Media URL is required");

    const { tweetId } = req.params;

    if (!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const media = await Media.create({
        url,
        tweet: tweetId,
        owner: req?.user?._id
    });

    // Add the media URL to the Tweet document's media array without duplicates
    await Tweet.findByIdAndUpdate(tweetId, {
        $addToSet: { media: media.url }
    });

    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            media,
            "Tweet media created successfully"
        )
    );
});

const deleteAMedia = asyncHandler(async (req, res) => {
    const { mediaId } = req.params;

    if (!mediaId || mediaId.trim() === "") throw new ApiError(400, "Media id is required");

    let existedMedia = null;
    if (mongoose.Types.ObjectId.isValid(mediaId)) {
        existedMedia = await Media.findById(mediaId);
    }

    if (!existedMedia) {
        const decodedUrl = decodeURIComponent(mediaId);
        existedMedia = await Media.findOne({ url: decodedUrl });
    }

    if (!existedMedia) throw new ApiError(404, "Media not found");

    if (!existedMedia.isOwner(req?.user?._id)) throw new ApiError(409, "Unauthorized action");

    const deletedResponse = await Media.deleteOne({ _id: existedMedia._id });

    if (!deletedResponse.acknowledged) throw new ApiError(500, "Something went wrong while deleting the media");

    // Pull the media URL from the associated Tweet
    await Tweet.findByIdAndUpdate(existedMedia.tweet, {
        $pull: { media: existedMedia.url }
    });

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Media deleted successfully"
        )
    );
});

const getUserMedia = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId || userId.trim() === "") throw new ApiError(400, "User id is required");

    const {page = 1, limit = 15} = req.query;

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                _id: 0,
                url: 1
            }
        }
    ]
    
    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "medias",
            totalDocs: "totalMedias"
        }
    }

    const media = await Media.aggregatePaginate(Media.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                ...media,
                medias: media.medias.map(item => item.url)
            },
            "User media fetched successfully"
        )
    )
})

export {
    addAMedia,
    deleteAMedia,
    getUserMedia
};