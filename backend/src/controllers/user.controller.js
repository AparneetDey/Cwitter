import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendResetPassword, sendVerificationCode } from "../utils/Email.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { pipeline } from "stream";

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
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullName, password, location } = req.body;

    if (
        [username, email, fullName, password].some((field) => field?.trim() === "" || !field)
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUsername = await User.findOne({ username })

    if (existedUsername) throw new ApiError(409, "Username already exists");

    const existedUser = await User.findOne({ email })

    if (existedUser) throw new ApiError(409, "User already exists with these mail")

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        location: location || "",
        description: "",
        githubLink: "",
        bookmarks: [],
        avatar: "",
        coverImage: "",
        refreshToken: ""
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id);

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
    const { identity, password } = req.body;

    if ([identity, password].some((field) => field?.trim() === "" || !field)) {
        throw new ApiError(400, "All fields are required");
    }

    let username = "";
    let email = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(identity)) {
        email = identity;
    } else {
        username = identity.toLowerCase();
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+password");

    if (!existedUser) throw new ApiError(404, "User does not exist");

    const isPasswordCorrect = await existedUser.isPasswordCorrect(password)

    if (!isPasswordCorrect) throw new ApiError(401, "Incorrect password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

    const loggedInUser = await User.findById(existedUser._id);

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

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

    try {
        const decode = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);

        const user = await User.findById(decode._id);

        if (!user) throw new ApiError(401, "Invalid refresh token :: User not found");

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id);

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
    const user = await User.findById(req?.user?._id).select("-bookmarks");

    if (!user) throw new ApiError(404, "User not found");

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

const getSearchUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 30 } = req.query;
    const rawQuery = req.query.searchQuery || req.query.query || req.query.q || "";
    const searchQuery = rawQuery.trim();

    if (!searchQuery) {
        return res.status(200).json(
            new ApiResponse(
                200,
                { users: [], totalUsers: 0, page: Number(page), limit: Number(limit), totalPages: 0 },
                "Search query empty"
            )
        );
    }

    // Escape special regex characters to prevent syntax errors
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pipeline = [
        {
            $match: {
                $or: [
                    {
                        fullName: {
                            $regex: escapedQuery,
                            $options: "i"
                        },
                    },
                    {
                        username: {
                            $regex: escapedQuery,
                            $options: "i"
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                isVerified: 1,
                description: 1
            }
        }
    ];

    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "users",
            totalDocs: "totalUsers"
        }
    };

    const users = await User.aggregatePaginate(User.aggregate(pipeline), paginateOptions);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            users,
            "Searched user fetched successfully"
        )
    );
});

const getUserDashboard = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId || userId.trim() === "") throw new ApiError(400, "User id is required");

    const existedUser = await User.findById(userId);

    if(!existedUser) throw new ApiError("User does not exist");

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "following",
                as: "followers"
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "followings"
            }
        },
        {
            $addFields: {
                totalFollowers: {
                    $size: "$followers"
                },
                totalFollowings: {
                    $size: "$followings"
                },
                isFollowing: {
                    $in: [
                        new mongoose.Types.ObjectId(req?.user?._id),
                        "$followers.follower"
                    ]
                }
            }
        },
        {
            $project: {
                followers: 0,
                followings: 0,
                password: 0,
                refreshToken: 0,
                bookmarks: 0
            }
        }
    ])

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0],
            "User dashboard fetched successfully"
        )
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const { avatarUrl } = req.body;

    if (!avatarUrl || avatarUrl.trim() === "") throw new ApiError(400, "Avatar url is required");

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
    const { coverImageUrl } = req.body;

    if (!coverImageUrl || coverImageUrl.trim() === "") throw new ApiError(400, "Coverimage url is required");

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
    const { oldPassword, newPassword } = req.body;

    if ([oldPassword, newPassword].some((field) => field?.trim() === "" || !field)) throw new ApiError(400, "All fields are required");

    const user = await User.findById(req?.user?._id).select("+password");

    if(!user) throw new ApiError(404, "User not found")

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) throw new ApiError(401, "Unauthorized Request");

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

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
    const { username, fullName, email, location, description, githubLink } = req.body;

    if (![username, fullName, email].some(field => field?.trim())) {
        throw new ApiError(400, "Atleast one field (username or fullName or email) is required");
    }

    const user = await User.findById(req?.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    if (username && username.trim() !== "") {
        const existingUser = await User.findOne({
            username: username.toLowerCase(),
            _id: { $ne: req.user._id }
        });

        if (existingUser) throw new ApiError(409, "Username already exists");
        user.username = username.toLowerCase();
    }

    if (email && email.trim() !== "") {
        const existingUser = await User.findOne({
            email: email,
            _id: { $ne: req.user._id }
        });

        if (existingUser) throw new ApiError(409, "email already exists");
        user.email = email;
        user.isVerified = false;
    }

    if (fullName && fullName.trim() !== "") {
        user.fullName = fullName.trim();
    }
    
    if (location && location.trim() !== "") {
        user.location = location.trim();
    }
    
    user.description = description.trim();
    
    if (githubLink && githubLink.trim() !== "") {
        user.githubLink = githubLink.trim();
    }

    await user.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    location: user.location,
                    description: user.description,
                    githubLink: user.githubLink
                },
                "User details updated successfully"
            )
        )
})

const getUserBookmarks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, searchQuery = "", sortType = "asc" } = req.query;

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
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            isVerified: 1
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
                        "$bookmark.retweets"
                    ]
                },
                totalRetweets: {
                    $size: "$bookmark.retweets"
                },
                owner: {
                    $first: "$owner"
                },
                isBookmarked: {
                    $in: [
                        "$bookmark._id",
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
            $sort: {
                "bookmark.createdAt": sortType === "asc" ? 1 : -1
            }
        },
        {
            $project: {
                _id: "$bookmark._id",
                content: "$bookmark.content",
                media: "$bookmark.media",
                reshareTweet: "$bookmark.tweet",
                createdAt: "$bookmark.createdAt",
                owner: {
                    _id: "$owner._id",
                    fullName: "$owner.fullName",
                    username: "$owner.username",
                    avatar: "$owner.avatar",
                    isVerified: "$owner.isVerified"
                },
                isRetweeted: 1,
                totalRetweets: 1,
                isBookmarked: 1,
                totalLikes: 1,
                isLiked: 1,
                totalReach: 1
            }
        }
    ];

    if (searchQuery && searchQuery.trim() !== "") {
        pipeline.push(
            {
                $match: {
                    "owner.fullName": {
                        $regex: searchQuery,
                        $options: "i"
                    }
                }
            }
        )
    }

    const paginateOptions = {
        page,
        limit,
        customLabels: {
            docs: "bookmarks",
            totalDocs: "totalBookmarks"
        }
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

const startUserVerfication = asyncHandler(async (req, res) => {
    const user = await User.findById(req?.user?._id);

    if (!user) throw new ApiError("User does not exist");
    if(user.isVerified) throw new ApiError(400, "User is already verified");

    // const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = crypto.randomInt(100000, 1000000);
    await sendVerificationCode(user.email, user.fullName, verificationCode);

    user.verificationCode = verificationCode;
    await user.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Verification code send successfully"
            )
        )
})

const checkUserVerificationCode = asyncHandler(async (req, res) => {
    const { verificationCode } = req.body;

    if (!verificationCode || verificationCode.trim() === "") throw new ApiError(400, "Verification code is required");

    const user = await User.findById(req?.user?._id).select("+verificationCode");

    if (!user) throw new ApiError(404, "User does not exist");
    
    if (user.verificationCode !== verificationCode) throw new ApiError(401, "Your code is invalid");

    user.isVerified = true;
    user.verificationCode = undefined;

    await user.save({ validateBeforeSave: false });

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isVerified: user.isVerified
                },
                "Verification completed"
            )
        )
})

const forgotPassword = asyncHandler(async (req, res) => {
    const {email} = req.body;

    if(!email || email.trim() === "") throw new ApiError(400, "Email is required");

    const user = await User.findOne({email});

    if(!user) throw new ApiError(401, "No account exists with this email");

    const resetPassword = crypto.randomBytes(12).toString("base64url").slice(0, 16);

    await sendResetPassword(user.email, user.fullName, resetPassword);

    user.password = resetPassword;
    await user.save({validateBeforeSave: true});

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password reset successfully"
        )
    )
})

export {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    getSearchUsers,
    getUserDashboard,
    updateUserAvatar,
    updateUserCoverImage,
    changeUserPassword,
    updateUserDetail,
    getUserBookmarks,
    startUserVerfication,
    checkUserVerificationCode,
    forgotPassword
}