import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const existingTweet = await Tweet.findById(tweetId);

    if (!existingTweet) throw new ApiError(404, "Tweet does not exist");

    const isTweetLiked = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req?.user?._id
        }
    )

    let message = "Tweet like toggle successfull";
    if (isTweetLiked) {
        await Like.deleteOne({ _id: isTweetLiked._id });
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

const getUserLikedTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || userId.trim() === "") throw new ApiError(400, "User id is required");

    const existingUser = await User.findById(userId);

    if (!existingUser) throw new ApiError(404, "User does not exist");

    const {page = 1, limit = 15} = req.query;

    const pipeline = [
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                tweet: {
                    $exists: true,
                    $type: "objectId"
                }
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "likedTweets",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                        isVerified: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "tweet",
                            as: "tweetLikes",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 0,
                                        likedBy: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "tweetreaches",
                            localField: "_id",
                            foreignField: "tweet",
                            as: "reachData"
                        }
                    },
                    {
                        $addFields: {
                            likes: {
                                $map: {
                                    input: "$tweetLikes",
                                    as: "like",
                                    in: "$$like.likedBy"
                                }
                            }
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
                            },
                            owner: {
                                $first: "$owner"
                            },
                            isBookmarked: {
                                $in: [
                                    "$_id",
                                    req?.user?.bookmarks
                                ]
                            },
                            totalLikes: {
                                $size: "$likes"
                            },
                            isLiked: {
                                $in: [
                                    req?.user?._id,
                                    "$likes"
                                ]
                            },
                            totalReach: {
                                $size: "$reachData"
                            }
                        }
                    },
                    {
                        $project: {
                            retweets: 0,
                            tweetLikes: 0,
                            likes: 0,
                            reachData: 0
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likedTweets: {
                    $first: "$likedTweets"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                likedTweets: 1
            }
        },
        {
            $replaceRoot: {
                newRoot: "$likedTweets"
            }
        }
    ];

    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "likedTweets",
            totalDocs: "totalLikedTweets"
        }
    }

    const likedTweets = await Like.aggregatePaginate(Like.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedTweets,
            "Liked tweets fetched successfully"
        )
    )
})

export {
    toggleTweetLike,
    getUserLikedTweets
}