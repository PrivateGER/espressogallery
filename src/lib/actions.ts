"use server";

import prisma from "@/lib/prisma";

export const getS3BaseUrl = async () => {
    return process.env.S3_BASE_URL;
}

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
        },
        include: {
            galleries: true
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

export const getGalleries = async () => {
    return prisma.gallery.findMany();
}

export const getGalleriesWithImages = async () => {
    return prisma.gallery.findMany({
        include: {
            images: {
                orderBy: {
                    galleryIndexNumber: "asc"
                }
            }
        }
    });
}

export const getGallery = async (id: string) => {
    return prisma.gallery.findUnique({
        where: {
            id
        },
        include: {
            images: {
                orderBy: {
                    galleryIndexNumber: "asc"
                }
            },
            author: true
        }
    });

}
