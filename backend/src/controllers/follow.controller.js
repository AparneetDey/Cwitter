import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Follow } from "../models/follow.model";

const toggleFollow = asyncHandler(async (req, res) => {
    const {followerId} = req.params;

    if(!followerId || followerId?.trim() === "") throw new ApiError(400, "Follower id is required");

    const isUserFollowing = await Follow.find({
        follower: req?.user?._id,
        following: followerId
    })

    if(isUserFollowing > 0) {
        await Follow.deleteOne({follower: req?.user?._id, following: followerId})
    }

    // Need to complete
})