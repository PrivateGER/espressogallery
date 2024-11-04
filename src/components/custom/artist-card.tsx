import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getArtist, getS3BaseUrl} from "@/lib/actions";
import Link from "next/link";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {describe} from "node:test";

export default async function ArtistCard({ artist_id, oneline }: Readonly<{ artist_id: string, oneline?:  boolean }>) {
    let artist = await getArtist(artist_id);

    function abbreviateBio(bio: string) {
        if (bio.length > 50) {
            return bio.substring(0, 50) + "...";
        }
        return bio;
    }

    return (
        (artist != null) ?
            <Link href={"/artist/view" + artist.id}>
                <Card className={"hover:bg-gray-300 transition ease-in-out bg-background duration-300 hover:border-2 hover:border-black"}>
                    <CardHeader>
                        <CardTitle className={"text-pretty"}>{artist.name}</CardTitle>
                    </CardHeader>
                    {
                        !oneline && artist.bio ? <CardContent><p>{abbreviateBio(artist.bio)}</p></CardContent> : null
                    }
                </Card>
            </Link> : <Alert className={"bg-red-500 text-white"}>
            <AlertTitle>Artist not found</AlertTitle>
            <AlertDescription>Artist with id {artist_id} not found</AlertDescription>
        </Alert>
    )
}
