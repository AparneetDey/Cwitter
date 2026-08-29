import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { deleteTweetMedia } from "./media.controller.js";
import { Media } from "../models/media.model.js";

const createATweet = asyncHandler(async (req, res) => {
    const {content, media = []} = req.body;

    if(!content || content?.trim() === "") throw new ApiError(400, "Content is required");

    const mediaList = Array.isArray(media) ? media : [];

    const createdTweet = await Tweet.create({
        content,
        media: mediaList,
        owner: req?.user?._id,
        retweets: []
    });

    if(!createdTweet) throw new ApiError(500, "Something went wrong while creating tweet");

    // Automatically create Media document entries in DB if media URLs are attached
    // if (mediaList.length > 0) {
    //     for (const url of mediaList) {
    //         if (url && typeof url === 'string') {
    //             try {
    //                 await Media.create({
    //                     url,
    //                     tweet: createdTweet._id,
    //                     owner: req?.user?._id
    //                 });
    //             } catch (mErr) {
    //                 console.warn("Failed to create Media entry:", mErr);
    //             }
    //         }
    //     }
    // }

    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            createdTweet,
            "Tweet created successfully"
        )
    );
});

const deleteATweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId?.trim() === "") throw new ApiError(400, "Tweet Id is required");

    const storedTweet = await Tweet.findById(tweetId);

    if(!storedTweet) throw new ApiError(404, "Tweet does not exist");

    if(!storedTweet.isOwner(req?.user?._id)) throw new ApiError(401, "Unauthorized Action");

    await Media.deleteMany({ tweet: tweetId });

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
                }
            }
        },
        {
            $project: {
                retweets: 0,
            }
        }
    ]);

    if(tweet.length === 0) throw new ApiError(404, "Tweet does not exist");

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

const toggleTweetToUserBookmark = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!tweetId || tweetId.trim() === "") throw new ApiError(400, "Tweet id is required");

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) throw new ApiError(404, "Tweet does not exist");

    const user = await User.findById(req?.user?._id);

    const isBookmarked = user.bookmarks.some((b) => String(b) === String(tweet._id));
    let message = "";

    if (isBookmarked) {
        user.bookmarks.pull(tweet._id);
        message = "Removed from Bookmarks";
    } else {
        user.bookmarks.push(tweet._id);
        message = "Added to Bookmarks";
    }

    await user.save({ validateBeforeSave: false });

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                bookmarked: tweetId
            },
            message
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
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
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
                retweets: 0,
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

const getUserFeed = asyncHandler(async (req, res) => {
    const {page = 1, limit = 15} = req.query;

    const pipeline = [
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
                            bookmarks: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalRetweets: {
                    $size: "$retweets"
                },
                isRetweeted: {
                    $in: [
                        req?.user?._id,
                        "$retweets"
                    ]
                },
                owner: {
                    $first: "$owner"
                },
                isBookmarked: {
                    $in: [
                        "$_id",
                        req?.user?.bookmarks
                    ]
                }
            }
        },
        {
            $sort: {
                createdAt: -1,
                totalRetweets: -1
            }
        },
        {
            $project: {
                retweets: 0,
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

    const feed = await Tweet.aggregatePaginate(Tweet.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            feed,
            "For you feed fetched successfully"
        )
    )
})

const getUserFollowingFeed = asyncHandler(async (req, res) => {
    const {page = 1, limit = 15} = req.query;

    const followings = await Follow.distinct(
        "following",
        {
            follower: req.user._id
        }
    );

    const pipeline = [
        {
            $match: {
                $or: [
                    {
                        owner: {
                            $in: followings
                        }
                    },
                    {
                        retweets: {
                            $in: followings
                        }
                    }
                ]
            }
        },
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
                            bookmarks: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalRetweets: {
                    $size: "$retweets"
                },
                isRetweeted: {
                    $in: [
                        req?.user?._id,
                        "$retweets"
                    ]
                },
                owner: {
                    $first: "$owner"
                },
                isBookmarked: {
                    $in: [
                        "$_id",
                        req?.user?.bookmarks
                    ]
                }
            }
        },
        {
            $sort: {
                createdAt: -1,
                totalRetweets: -1
            }
        },
        {
            $project: {
                retweets: 0,
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

    const feed = await Tweet.aggregatePaginate(Tweet.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            feed,
            "For you feed fetched successfully"
        )
    )
})

export {
    createATweet,
    deleteATweet,
    editATweet,
    getATweet,
    toggleTweetToUserBookmark,
    toggleRetweet,
    getUserTweets,
    getUserFeed,
    getUserFollowingFeed
}