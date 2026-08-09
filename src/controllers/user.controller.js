import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

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
        bookMarks: [],
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
                accessToken
            },
            "User registered successfully"
        )
    )
})

const loginUser = asyncHandler(async (req, res) => {
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
                accessToken
            },
            "User logged in successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Fetched Current User"
        )
    )
})

export {
    registerUser,
    loginUser,
    getCurrentUser,
}