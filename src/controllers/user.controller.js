import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 24 * 60 * 60 * 1000
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    
    const {username, email, fullName, password} = req.body;

    if(
        [username, email, fullName, password].some((field) => field?.trim() === "" || !field)
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) throw new ApiError(409, "User already exists");

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        bookmarks: [],
        avatar: "",
        coverImage: "",
        refreshToken: ""
    })

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            201,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User registered successfully"
        )
    )
})

const logInUser = asyncHandler(async (req, res) => {
    const {identity, password} = req.body;

    if([identity, password].some((field) => field?.trim() === "" || !field)) {
        throw new ApiError(400, "All fields are required");
    }

    let username = "";
    let email = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(emailRegex.test(identity)) {
        email = identity;
    } else {
        username = identity.toLowerCase();
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!existedUser) throw new ApiError(404, "User does not exist");

    if(!existedUser.isPasswordCorrect(password)) throw new ApiError(401, "Incorrect password");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(existedUser._id);

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");

    res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req?.user?._id, {
        $set: {
            refreshToken: ""
        }
    }, {
        new: true
    })

    res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
        new ApiResponse(
            200,
            {},
            "User log out successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken || "";

    if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

    try {
        const decode = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);

        const user = await User.findById(decode._id);

        if(!user) throw new ApiError(401, "Invalid refresh token :: User not found");

        if(user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                201,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while refreshing access token");
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req?.user?._id).select("-password -refreshToken -bookmarks");

    if(!user) throw new ApiError(404, "User not found");

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Fetched current user successfully"
        )
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const {avatarUrl} = req.body;

    if(!avatarUrl || avatarUrl.trim() === "") throw new ApiError(400, "Avatar url is required");

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        $set: {
            avatar: avatarUrl
        }
    }, {
        new: true
    })

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                avatar: user.avatar
            },
            "Avatar updated successfully"
        )
    )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const {coverImageUrl} = req.body;

    if(!coverImageUrl || coverImageUrl.trim() === "") throw new ApiError(400, "Coverimage url is required");

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        $set: {
            coverImage: coverImageUrl
        }
    }, {
        new: true
    })

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                coverImage: user.coverImage
            },
            "coverImage updated successfully"
        )
    )
})

const changeUserPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    if([oldPassword, newPassword].some((field) => field?.trim() === "" || !field)) throw new ApiError(400, "All fields are required");

    const user = await User.findById(req?.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) throw new ApiError(401, "Unauthorized Request");

    user.password = newPassword;
    await user.save({validateBeforeSave: true});

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const updateUserDetail = asyncHandler(async (req, res) => {
    const {username, fullName} = req.body;

    if((!username || username?.trim() === "") && (!fullName || fullName?.trim() === "")) {
        throw new ApiError(400, "Atleast one field (username or fullName) is required");
    }

    const user = await User.findById(req?.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    if(username && username.trim() !== "") {
        const lowerUsername = username.trim().toLowerCase();
        if(lowerUsername !== user.username) {
            const existedUser = await User.findOne({ username: lowerUsername });
            if(existedUser) throw new ApiError(409, "Username already exists");
            user.username = lowerUsername;
        }
    }

    if(fullName && fullName.trim() !== "") {
        user.fullName = fullName.trim();
    }

    await user.save({validateBeforeSave: false});

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                username: user.username,
                fullName: user.fullName
            },
            "User details updated successfully"
        )
    )
})

const getUserBookmarks = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, searchQuery = "", sortType = "asc"} = req.query;

    const pipeline = [
        {
            $match: {
                _id: req.user._id
            }
        },
        {
            $unwind: "$bookmarks"
        },
        {
            $lookup: {
                from: "tweets",
                localField: "bookmarks",
                foreignField: "_id",
                as: "bookmark"
            }
        },
        {
            $unwind: "$bookmark"
        },
        {
            $lookup: {
                from: "users",
                localField: "bookmark.owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: "$bookmark._id",
                content: "$bookmark.content",
                createdAt: "$bookmark.createdAt",
                owner: {
                    _id: "$owner._id",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                }
            }
        }
    ];

    const paginateOptions = {
        page,
        limit
    }

    const bookmarks = await User.aggregatePaginate(User.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            bookmarks,
            "Bookmarks fetched successfully"
        )
    )
})

export {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
    changeUserPassword,
    updateUserDetail,
    getUserBookmarks
}