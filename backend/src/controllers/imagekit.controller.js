import ImageKit from "@imagekit/nodejs";
import {ApiResponse} from "../utils/ApiResponse.js"

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const getImageKitAuth = (req, res) => {
    const authenticationParameters = imagekit.helper.getAuthenticationParameters();

    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            authenticationParameters,
            "Imagekit auth parameters fetched successfully"
        )
    );
};

export { getImageKitAuth };