import Button from "./Button";

type BookCardProps = {
    image: string;
    title: string;
};

export default function BookCard({ image, title }: BookCardProps) {
    return (
        <div className="book-card">
            <img src={image} alt={title} className="book-cover" />

            <div className="book-btn-actions">
                <Button style={{backgroundColor:"var(--light-purple)", fontSize:"14px"}}>DODAJ DO LISTY</Button>
                <Button style={{backgroundColor:"var(--dark-purple)", fontSize:"14px"}}>WYPOŻYCZ</Button>
            </div>
        </div>
    )
}