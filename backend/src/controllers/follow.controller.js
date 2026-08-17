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

    if(isUserFollowing > 0) {
        await Follow.deleteOne({follower: req?.user?._id, following: followingId})
    } else {
        await Follow.create({follower: req?.user?._id, following: followingId})
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Follow toggle successfull"
        )
    )
})

export {
    toggleFollow
}