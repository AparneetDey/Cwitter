import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
    process.env.DEV_ORIGIN
]

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
)

app.use(express.json({limit: "16kb"}));
app.use(urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Router imports
import healthcheckRouter from "./routes/healthcheck.route.js";
import imagekitRouter from "./routes/imagekit.route.js";
import userRouter from "./routes/user.route.js";
import tweetRouter from "./routes/tweet.route.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/imagekit", imagekitRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);

export { app }