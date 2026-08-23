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
            $project: {
                _id: 0,
                follower: 1,
            }
        }
    ])

    console.log(userFollowers)

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                followers: userFollowers || [],
                totalFollowers: userFollowers?.length || 0
            },
            "User followers fetched successfully"
        )
    )
})

export {
    toggleFollow,
    getUserFollowers
}