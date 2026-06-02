import BookDetails from "@/components/BookDetails";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function BookDetailsPage({ params }: Props) {
    const { id } = await params;
    return <BookDetails id={id} />;
}