"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";

import prisma from "@/lib/prisma";
import Form from "next/form";
import {redirect, useRouter} from "next/navigation";
import { createArtist, artistNameExists } from "@/lib/actions";
import {Input} from "@/components/ui/input";
import {FormEvent, useRef, useState} from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";


export default function CreateArtist() {
    const router = useRouter();

    async function createArtistFE(formData: FormData) {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        if (!name) {
            console.error("Name is required");
            return;
        }

        if (name.length > 255 || description?.length > 2000) {
            console.error("Name must be less than 255 characters and description must be less than 2000 characters");
            return;
        }

        try {
            const artist = await createArtist(name, description);
            router.push(`/artist/${artist.id}`);
        } catch (error) {
            console.error(error);
        }
    }

    async function verifyArtistName(e: FormEvent<HTMLInputElement>) {
        const name = e.currentTarget.value;

        const artistExists = await artistNameExists(name);
        if (artistExists) {
            console.log("Artist with this name already exists");
            setUserAlert({active: true, message: "Artist with this name already exists"});
        } else {
            setUserAlert({active: false, message: ""});
        }
    }

    const [userAlert, setUserAlert] = useState({active: false, message: ""});

    return (
        <div className="flex justify-center">
            <Card className={"w-3/4 content-center"}>
                <CardHeader>
                    <CardTitle>Create new Artist</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form action={createArtistFE}>
                        <div className="mb-4">
                            <Label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Name
                            </Label>
                            <Input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name"
                                placeholder="Name"
                                name={"name"}
                                required={true}
                                onInput={verifyArtistName}
                                maxLength={64}
                            />
                            {
                                userAlert.active && <Alert className="p-2">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        {userAlert.message}
                                    </AlertDescription>
                                </Alert>
                            }
                        </div>
                        <div className="mb-6">
                            <Label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                Biography
                            </Label>
                            <Textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="description"
                                placeholder="Description"
                                maxLength={2000}
                                name={"description"}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                Create
                            </button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
