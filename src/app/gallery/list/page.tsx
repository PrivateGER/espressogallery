import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {getGalleriesWithImages, getS3BaseUrl} from "@/lib/actions";
import {GalleryCard} from "@/components/custom/gallery-card";

export default async function GalleryList() {
    let galleries = await getGalleriesWithImages();
    let s3BaseUrl = await getS3BaseUrl();

    return (
        <div className="flex justify-center">
            <Card className={"w-3/4 content-center"}>
                <CardHeader>
                    <CardTitle>Galleries</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>All galleries ({galleries.length}):</Label>
                    <div className="grid grid-cols-2 gap-4">
                        {galleries.map((gallery) => (
                            <GalleryCard key={gallery.id} gallery={gallery} link />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
