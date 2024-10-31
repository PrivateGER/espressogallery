"use server";

import prisma from "@/lib/prisma";
import {redirect} from "next/navigation";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const createArtist = async (name: string, description: string) => {

    if (!name) {
        throw new Error("Name is required");
    }

    if (name.length > 255 || description?.length > 2000) {
        throw new Error("Name must be less than 255 characters and description must be less than 2000 characters");
    }

    const artist = await prisma.artist.create({
        data: {
            name,
            bio: description
        }
    });

    return {
        id: artist.id,
    }
}

export const artistNameExists = async (name: string) => {

    const artist = await prisma.artist.findUnique({
        where: {
            name
        }
    });

    return !!artist;
}

export const getArtists = async () => {
    return prisma.artist.findMany();
}

export const getArtist = async (id: string) => {
    return prisma.artist.findUnique({
        where: {
            id
        }
    });
}

type FileMetadata = {
    name: string;
    s3Name: string;
    type: string;
    size: number;

}
export const createGallery = async (name: string, description: string, artistId: string, files: FileMetadata[]) => {
    if (!name) {
        throw new Error("Name is required");
    }

    if (name.length > 255 || description?.length > 2000) {
        throw new Error("Name must be less than 255 characters and description must be less than 2000 characters");
    }

    if (!artistId) {
        throw new Error("Artist id is required");
    }

    const gallery = await prisma.gallery.create({
        data: {
            name,
            description,
            authorId: artistId,
            images: {
                create: files.map((file, index) => ({
                    filename: file.name,
                    s3Name: file.s3Name,
                    galleryIndexNumber: index,
                    type: file.type,
                    size: file.size,

                }))
            }
        }
    });



    return gallery;
}

