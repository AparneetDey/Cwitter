import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";


dotenv.config(
    {
        path: "./.env"
    }
)

connectDB()
.then(
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is listening on PORT ${process.env.PORT || 8000}`);
    })
)
.catch(
    (e) => {
        console.log("MONGODB CONNECTION FAILED :: ",e)
    }
)