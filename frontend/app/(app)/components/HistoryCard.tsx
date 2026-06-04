import Button from "./Button";

type HistoryCardProps = {
    image: string;
    title: string;
};

export default function HistoryCard({ image, title }: HistoryCardProps) {
    return (
        <div className="book-card">
            <img src={image} alt={title} className="book-cover" />

            <div className="book-btn-actions">
                <Button style={{backgroundColor:"var(--dark-purple)", fontSize:"14px"}}>Czytaj dalej</Button>
                <Button style={{backgroundColor:"var(--btn-red)", fontSize:"14px"}}>Zwróć</Button>
            </div>
        </div>
    )
}