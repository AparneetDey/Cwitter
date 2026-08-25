import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Follow } from "../models/follow.model.js";
import mongoose from "mongoose";

const toggleFollow = asyncHandler(async (req, res) => {
    const {followingId} = req.params;

    if(!followingId || followingId?.trim() === "") throw new ApiError(400, "Follower id is required");

    const isUserFollowing = await Follow.find({
        follower: req?.user?._id,
        following: followingId
    })

    let message = "Follow toggle successfull"
    if(isUserFollowing.length > 0) {
        await Follow.deleteOne({follower: req?.user?._id, following: followingId})
        message = "User unfollow successfull";
    } else {
        await Follow.create({follower: req?.user?._id, following: followingId})
        message = "User follow successfull";
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

const getUserFollowers = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId || userId.trim() === "") throw new ApiError(400, "User id is required");

    const {page = 1, limit = 30} = req.query;

    const pipeline = [
        {
            $match: {
                following: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "follower",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            description: 1,
                            isVerified: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$follower"
        },
        {
            $lookup: {
                from: "follows",
                let: {
                    targetUserId: "$follower._id"
                },
                as: "followingBack",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$follower",
                                            new mongoose.Types.ObjectId(req?.user?._id)
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$following",
                                            "$$targetUserId"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                isFollowing: {
                    $gt: [
                        {$size: "$followingBack"},
                        0
                    ]
                }
            }
        },
        {
            $project: {
                _id: "$follower._id",
                username: "$follower.username",
                fullName: "$follower.fullName",
                avatar: "$follower.avatar",
                description: "$follower.description",
                isVerified: "$follower.isVerified",
                isFollowing: 1
            }
        }
    ]

    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "followers",
            totalDocs: "totalFollowers"
        }
    }

    const followers = await Follow.aggregatePaginate(Follow.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            followers,
            "User followers fetched successfully"
        )
    )
})

const getUserFollowings = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId || userId.trim() === "") throw new ApiError(400, "User id is required");

    const {page = 1, limit = 30} = req.query;

    const pipeline = [
        {
            $match: {
                follower: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "following",
                foreignField: "_id",
                as: "following",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            description: 1,
                            isVerified: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$following"
        },
        {
            $lookup: {
                from: "follows",
                let: {
                    targetUserId: "$following._id"
                },
                as: "followingBack",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$follower",
                                            new mongoose.Types.ObjectId(req?.user?._id)
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$following",
                                            "$$targetUserId"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                isFollowing: {
                    $gt: [
                        {$size: "$followingBack"},
                        0
                    ]
                }
            }
        },
        {
            $project: {
                _id: "$following._id",
                username: "$following.username",
                fullName: "$following.fullName",
                avatar: "$following.avatar",
                description: "$following.description",
                isVerified: "$following.isVerified",
                isFollowing: 1
            }
        }
    ]

    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "followings",
            totalDocs: "totalFollowings"
        }
    }

    const followings = await Follow.aggregatePaginate(Follow.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            followings,
            "User followings fetched successfully"
        )
    )
})

export {
    toggleFollow,
    getUserFollowers,
    getUserFollowings
}