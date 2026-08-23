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

    if(!userId || userId.trim() === "") throw new ApiError(400, "User Id is required");

    const userFollowers = await Follow.aggregate([
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
                            description: 1
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
                    followerId: "$follower._id"
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
                                        ],
                                        $eq: [
                                            "$following",
                                            "$followerId"
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
                isFollowing: 1
            }
        }
    ])

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                followers: userFollowers || []
            },
            "User followers fetched successfully"
        )
    )
})

export {
    toggleFollow,
    getUserFollowers
}