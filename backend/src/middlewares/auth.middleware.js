import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyToken = asyncHandler(async (req, res, next) => {
    if((!req?.cookies || !req?.cookies?.accessToken) && !req.header("Authorization")) throw new ApiError(401, "Unauthorized Request");

    try {
        const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");

        if(!token) throw new ApiError(401, "Unauthorized Request");

        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

        const user = await User.findById(decode._id).select("-password -refreshToken");

        if(!user) throw new ApiError(401, "Invalid Access token :: Token may be expired");

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while verifying token");
    }
})

const verifyUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req?.user?._id);

    if(!user) throw new ApiError(404, "User does not exist");

    if(!user.isVerified) throw new ApiError(401, "User email is not verified");

    next();
})

export {verifyToken, verifyUser}