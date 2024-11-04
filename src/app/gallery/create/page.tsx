"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";0
import { Input } from "@/components/ui/input";
import {useState, memo, useEffect, useRef} from "react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ToastAction } from "@/components/ui/toast"
import {useToast} from "@/hooks/use-toast";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {createGallery, getArtists} from "@/lib/actions";
import {startS3Upload} from "@/lib/s3";
import type { Artist } from "@prisma/client";
import {router} from "next/client";
import {Progress} from "@/components/ui/progress";
import {useRouter} from "next/navigation";

export default function CreateGalleryPage() {
    const [files, setFiles] = useState<File[]>([]);
    const { toast } = useToast();
    const cachedObjectURLs = new Map<string, string>();
    const [artistList, setArtistList] = useState([]);
    const router = useRouter();

    const galleryName = useRef<HTMLInputElement>(null);
    const galleryDescription = useRef<HTMLTextAreaElement>(null);
    const [galleryArtist, setGalleryArtist] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [progressState, setProgressState] = useState({
        uploaded: 0,
        total: 0,
    });

    async function getArtistsList() {
        getArtists().then(artists => {

            // @ts-ignore
            return setArtistList(artists.sort((a, b) => a.name.localeCompare(b.name)));
        });
    }

    function getObjectURL(file: File): string {
        if (cachedObjectURLs.has(file.name)) {
            return cachedObjectURLs.get(file.name)!;
        }

        const objectURL = URL.createObjectURL(file);
        cachedObjectURLs.set(file.name, objectURL);
        return objectURL;
    }

    function bytesToMB(bytes: number): string {
        return (bytes / 1024 / 1024).toFixed(2);
    }

    // @ts-ignore
    const DraggableFile = memo(({ file, index }) => (
        <Draggable key={index} draggableId={file.name} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="relative w-full h-24 border-2 border-black rounded"
                >
                    { !isUploading ? file.type.startsWith('image') ?
                                <img src={getObjectURL(file)} alt={file.name} className="max-w-1/3 h-full aspect-auto" /> :
                                <video src={getObjectURL(file)} playsInline className="pointer-events-none max-w-1/3 h-full aspect-auto" /> : null
                    }

                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white p-1 overflow-ellipsis max-w-full"> {file.name} </div>
                    <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1">Index {index} - {bytesToMB(file.size)} MB </div>
                </div>
            )}
        </Draggable>
    ));

    const autoSortFiles = () => {
        // Sort by numbers if the file name contains numbers
        files.map(file => console.log(file.name));

        if (files.every(file => /^(\d+).\w+/im.test(file.name))) {
            setFiles(files.sort((a, b) => {
                const aNumber = parseInt(a.name.match(/\d+/)![0], 10);
                const bNumber = parseInt(b.name.match(/\d+/)![0], 10);
                return aNumber - bNumber;
            }));
            toast({
                title: "Files sorted",
                description: "Files were sorted by numbers in file names",
            })
            return;
        } else {
            // Sort by file name
            setFiles(files.sort((a, b) => a.name.localeCompare(b.name)));
            toast({
                title: "Files sorted",
                description: "Files were sorted by lexicographic file names",
            })
        }

        // Trigger re-render
        setFiles(files.slice());
    }


    const filesChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        cachedObjectURLs.clear();
        setFiles(Array.from(event.target.files || []));
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const updatedFiles = Array.from(files);
        const [movedFile] = updatedFiles.splice(result.source.index, 1);
        updatedFiles.splice(result.destination.index, 0, movedFile);

        setFiles(updatedFiles);
    };

    const uploadFiles = async () => {
        if (!galleryName.current) {
            toast({
                title: "Error",
                description: "Gallery name is required",
            });
            return;
        }

        const name = galleryName.current.value;
        const description = galleryDescription.current ? galleryDescription.current.value : "";
        const artist = galleryArtist;

        if (!artist) {
            toast({
                title: "Error",
                description: "Artist is required",
            });
            return;
        }

        if (!name) {
            toast({
                title: "Error",
                description: "Gallery name cannot be empty",
            });
            return;
        }

        type UploadedFile = {
            name: string;
            size: number;
            type: string;
            s3Name: string;
            index: number;
        }

        setIsUploading(true);
        setProgressState({
            uploaded: 0,
            total: files.length,
        });
        toast({
            title: "Uploading files started",
            description: "Uploading files to S3, please wait...",
        })

        let uploadedFiles: UploadedFile[] = [];
        const uploadPromises = files.map(async (file, index) => {
            const signedURL = await startS3Upload({
                name: file.name,
                size: file.size,
                type: file.type,
            });

            await fetch(signedURL, {
                method: "PUT",
                body: file,
            });

            uploadedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                s3Name: new URL(signedURL).pathname.split('/').pop()!.toString(),
                index: index,
            });

            setProgressState((prevState) => ({
                uploaded: prevState.uploaded + 1,
                total: files.length,
            }));
        });

        await Promise.all(uploadPromises);

        toast({
            title: "All files uploaded",
            description: "All files were uploaded to S3. Gallery created.",
        });

        let createdGallery = await createGallery(name, description, artist, uploadedFiles);

        await router.push("/gallery/view/" + createdGallery.id);
    }

    useEffect(() => {
        getArtistsList().catch(() => {
            toast({
                title: "Error",
                description: "Failed to load artists",
            });
        });
    }, []);

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="flex justify-center">
            <Card className="w-3/4 content-center">
                <CardHeader>
                    <CardTitle>Create new Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="mb-4">
                            <Label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Name
                            </Label>
                            <Input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name"
                                placeholder="Name"
                                ref={galleryName}
                            />
                        </div>
                        <div className="mb-6">
                            <Label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                Description
                            </Label>
                            <Textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="description"
                                placeholder="Description"
                                ref={galleryDescription}
                            />
                        </div>

                        <div className={"mb-6"}>
                            <Label htmlFor="artist" className="block text-gray-700 text-sm font-bold mb-2">Artist</Label>
                            <Select required onValueChange={setGalleryArtist}>
                                <SelectTrigger className={""}>
                                    <SelectValue placeholder={"Select artist..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {artistList.map((artist: Artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-6 p">
                            <Label htmlFor="fileupload" className="block text-gray-700 text-sm font-bold mb-2">Upload files to gallery</Label>
                            <Input type="file" multiple={true} id="fileupload" accept="image/*,video/*" onChange={filesChanged} />
                            <Button className={"w-full mt-2 bg-blue-500 hover:bg-blue-700"} type={"button"} onClick={autoSortFiles}>Auto-sort gallery</Button>
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="files" direction="vertical" isDropDisabled={isUploading}>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
                                        {files.map((file, index) => (
                                            // @ts-ignore
                                            <DraggableFile key={file.name} file={file} index={index} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {
                            (isUploading) ?
                                <Progress className={"mt-4 "} value={(progressState.uploaded / progressState.total) * 100} max={100} /> : null
                        }

                        <div className="flex items-center justify-between mt-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="button" onClick={uploadFiles}
                                disabled={files.length === 0}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
