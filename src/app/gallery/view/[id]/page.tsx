import {getGallery, getS3BaseUrl} from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import {Card} from "@/components/ui/card";
import {Slider} from "@/components/ui/slider";
import {getThumbnail} from "@/lib/imgproxy";

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
    const galleryID = (await params).id;
    const gallery = await getGallery(galleryID);
    const s3base = await getS3BaseUrl();

    if (!gallery) {
        return (
            <div>
                <Alert className={"w-full bg-red-500 text-white"}>
                    <AlertTitle>Gallery not found</AlertTitle>
                    <AlertDescription>Gallery with this id does not exist</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div>
            <Card>
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold">{gallery.name}</h1>
                    <p>{gallery.description}</p>
                </div>
            </Card>
            <Slider className={"w-1/3 text-center"} defaultValue={[6]} max={6} step={1} />

            <h2 className="text-xl font-bold mt-4">Images ({gallery.images.length}):</h2>

            <div className="flex flex-wrap gap-2">
                {gallery.images.map(async (image) => {
                    const thumbnail = await getThumbnail(s3base + image.s3Name, 500);

                    return (<div key={image.id}
                                 className="w-1/6 border rounded-lg justify-center m-auto flex-initial shadow"
                                 style={{minHeight: "200px"}}>
                        <img
                            src={thumbnail}
                            alt={image.filename}
                            className="w-full h-full object-cover"
                            loading={"lazy"}
                        />
                    </div>);
                })}
            </div>
        </div>
    );
}
