import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const createATweet = asyncHandler(async (req, res) => {
    const {content, media = []} = req.body;

    if(!content || content?.trim() === "") throw new ApiError(400, "Content is required");

    const createdTweet = await Tweet.create({
        content,
        media,
        owner: req?.user?._id,
        retweets: []
    })

    if(!createdTweet) throw new ApiError(500, "Something went wrong while creating tweet");

    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            createdTweet,
            "Tweet created successfully"
        )
    )
})

const deleteATweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId?.trim() === "") throw new ApiError(400, "Tweet Id is required");

    const storedTweet = await Tweet.findById(tweetId);

    if(!storedTweet) throw new ApiError(404, "Tweet does not exist");

    if(!storedTweet.isOwner(req?.user?._id)) throw new ApiError(401, "Unauthorized Action");

    const tweetDeleteResponse = await Tweet.deleteOne({_id: tweetId});

    if(!tweetDeleteResponse.acknowledged) throw new ApiError(500, "Something went wrong while deleting tweet");

    await User.updateMany(
        { bookmarks: tweetId },
        {
            $pull: {
                bookmarks: tweetId
            }
        }
    );

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

const editATweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId?.trim() === "") throw new ApiError(400, "Tweet Id is required");

    const {content, media = []} = req.body;

    if(!content || content?.trim() === "") throw new ApiError(400, "Content is required");

    const storedTweet = await Tweet.findById(tweetId);

    if(!storedTweet) throw new ApiError(404, "Tweet does not exist");
    if(!storedTweet.isOwner(req?.user?._id)) throw new ApiError(401, "Unauthorized Action");

    storedTweet.content = content;
    storedTweet.media = media;

    await storedTweet.save();

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            storedTweet,
            "Tweet edited successfully"
        )
    )
})

const getATweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId?.trim() === "") throw new ApiError(400, "Tweet Id is required");

    const tweet = await Tweet.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tweetId)
            }
        },
        {
            $addFields: {
                isRetweeted: {
                    $in: [
                        req?.user?._id,
                        "$retweets"
                    ]
                },
                totalRetweets: {
                    $size: "$retweets"
                }
            }
        },
        {
            $project: {
                retweets: 0
            }
        }
    ]);

    if(!tweet) throw new ApiError(404, "Tweet does not exist");

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet[0],
            "Tweet fetched successfully"
        )
    )
})

const addTweetToUserBookmark = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) throw new ApiError(404, "Tweet does not exist");

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        $push: {
            bookmarks: tweetId
        }
    });

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                bookmarked: tweetId
            },
            "Tweet bookmarked successfully"
        )
    )
})

const toggleRetweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId?.trim() === "") throw new ApiError(400, "Tweet id is required");

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) throw new ApiError(404, "Tweet does not exist");

    if(tweet.retweets.some(userId => userId.equals(req?.user?._id))) {
        await Tweet.findByIdAndUpdate(tweet._id, {
            $pull: {
                retweets: req?.user?._id
            }
        })
    } else {
        await Tweet.findByIdAndUpdate(tweetId, {
                $addToSet: {
                    retweets: req?.user?._id
                }
        })
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Retweet toggle successfull"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId || userId?.trim() === "") throw new ApiError(400, "User id is required");

    const {page = 1, limit = 10} = req.query;

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                isRetweeted: {
                    $in: [
                        req?.user?._id,
                        "$retweets"
                    ]
                },
                totalRetweets: {
                    $size: "$retweets"
                }
            }
        },
        {
            $project: {
                retweets: 0
            }
        }
    ]

    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "tweets",
            totalDocs: "totalTweets"
        }
    }

    const userTweets = await Tweet.aggregatePaginate(Tweet.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userTweets,
            "User tweets fetched successfully"
        )
    )
})

export {
    createATweet,
    deleteATweet,
    editATweet,
    getATweet,
    addTweetToUserBookmark,
    toggleRetweet,
    getUserTweets
}