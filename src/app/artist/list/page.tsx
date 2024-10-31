import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import { getArtists } from "@/lib/actions";
import ArtistCard from "@/components/custom/artist-card";
import {Label} from "@/components/ui/label";

export default async function ListArtists() {
    let artists = await getArtists();
    artists.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex justify-center">
            <Card className={"w-3/4 content-center"}>
                <CardHeader>
                    <CardTitle>Artists</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>All registered artists ({artists.length}):</Label>
                    <div className="grid grid-cols-2 gap-4">
                        {artists.map((artist) => (
                            <ArtistCard key={artist.id} artist_id={artist.id} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
