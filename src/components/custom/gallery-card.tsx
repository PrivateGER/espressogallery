import { getS3BaseUrl } from "@/lib/actions";
import ArtistCard from "@/components/custom/artist-card";
import Link from "next/link";

export const GalleryCard = async ({ gallery, link }: {
    link?: boolean;
    gallery: {
        id: string;
        name: string;
        description: string;
        authorId: string;
        images: {
            s3Name: string;
        }[];
    };
}) => {
    let s3BaseUrl = await getS3BaseUrl();

    const cardContent = (
        <div key={gallery.id}
             className="border rounded-lg shadow-lg overflow-hidden flex hover:bg-gray-300 duration-300 hover:border-2 hover:border-black transition ease-in-out ">
            {gallery.images.length > 0 && (
                <img
                    src={s3BaseUrl + gallery.images[0].s3Name}
                    alt={gallery.name}
                    className="object-contain w-1/3 h-auto"
                />
            )}
            <div className="p-4 w-2/3">
                <h2 className="text-xl font-bold">{gallery.name}</h2>
                <p>{gallery.images.length} image{gallery.images.length > 1 ? "s" : ""}</p>
                <ArtistCard artist_id={gallery.authorId} oneline={true} />
                <p className="text-gray-600">{gallery.description}</p>
            </div>
        </div>
    );

    return link ? (
        <Link href={"/gallery/view/" + gallery.id}>
            {cardContent}
        </Link>
    ) : (
        cardContent
    );
}
