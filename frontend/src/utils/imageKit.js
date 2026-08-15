import { upload } from "@imagekit/javascript";
import api from "./axiosApi.util";

const uploadToImageKit = async (file, onProgress) => {
    if (!file) {
        throw new Error("No file selected");
    }

    const { data } = await api.get("/imagekit/auth");

    const {
        token,
        signature,
        expire
    } = data.data;

    const response = await upload({
        file,
        fileName: file.name,

        token,
        signature,
        expire,

        publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,

        useUniqueFileName: true,

        onProgress: (event) => {
            if (onProgress && event.total) {
                const progress = Math.round(
                    (event.loaded / event.total) * 100
                );

                onProgress(progress);
            }
        }
    });

    return response;
};

export default uploadToImageKit;