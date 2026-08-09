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
        const user = User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    console.log("register");
    
    const {username, email, fullName, password} = req.body;
    console.log(req.body);

    if(
        [username, email, fullName, password].some((field) => field?.trim() === "" || !field)
    ) {
        throw new ApiError(400, "All fields are required");
    }
    console.log("2");

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    console.log("2.5");
    console.log(existedUser)
    if(existedUser) throw new ApiError(409, "User already exists");
    console.log("3");

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
    console.log("3");


    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    console.log("4");

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
            "User registered successfully"
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
    getCurrentUser
}