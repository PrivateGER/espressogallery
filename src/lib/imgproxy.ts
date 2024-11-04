"use server";

import { generateImageUrl } from "@imgproxy/imgproxy-node";

const key = process.env.IMGPROXY_KEY;
const salt = process.env.IMGPROXY_SALT;
const endpoint = process.env.IMGPROXY_ENDPOINT;

if (!key || !salt || !endpoint) {
    throw new Error("IMGPROXY_KEY, IMGPROXY_SALT, and IMGPROXY_ENDPOINT must be set in the environment");
}

export const getThumbnail = async (url: string, width: number = 200) => {
    if (width < 0 || width > 3000) {
        throw new Error("Width must be between 0 and 3000");
    }

    return generateImageUrl({
        url,
        key,
        salt,
        endpoint,
        options: {
            resizing_type: "auto",
            width: width,
            gravity: {
                type: "sm",
            },
        }
    });
}

