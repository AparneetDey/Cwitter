import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Follow } from "../models/follow.model.js";

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

export {
    toggleFollow
}