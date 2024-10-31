"use server";

import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

import "./envConfig";
import { createId } from '@paralleldrive/cuid2';

type FileMetadata = {
    name: string;
    type: string;
    size: number;
}

if (!process.env.S3_REGION) {
    throw new Error("S3_REGION is not defined");
}

if (!process.env.S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT is not defined");
}

if (!process.env.S3_ACCESS_KEY) {
    throw new Error("S3_ACCESS_KEY is not defined");
}

if (!process.env.S3_SECRET_KEY) {
    throw new Error("S3_SECRET_KEY is not defined");
}

if (!process.env.S3_BUCKET_NAME) {
    throw new Error("S3_BUCKET_NAME is not defined");
}

const client = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
});
console.log("S3 client created", {
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    }
})

export const startS3Upload = async (file: FileMetadata) => {
    const id = createId();
    // Get file extension
    const extension = file.name.split('.').pop();

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${id}.${extension}`,
    });

    return await getSignedUrl(client, command, {expiresIn: 600});
}
