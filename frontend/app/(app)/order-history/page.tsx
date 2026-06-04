import HistoryCard from "@/components/HistoryCard";
import BackButton from "@/components/BackButton";

import "../books/books.css";
import "./order_history.css"


const books = [
    {
        id: 1,
        title: "Demon Slayer",
        image: "/book-cover/demon_slayer.svg",
    },
    {
        id: 2,
        title: "Nie-boska komedia",
        image: "/book-cover/nie-boska_komedia.svg",
    },
    {
        id: 3,
        title: "Bridgertonowie",
        image: "/book-cover/bridgertonowie.svg",
    },
    {
        id: 4,
        title: "Nie pochowani",
        image: "/book-cover/nie_pochowani.svg",
    },
    {
        id: 5,
        title: "Her soul to take",
        image: "/book-cover/her_soul_to_take.svg",
    },
   
];


export default function Books() {
    return (
        <main className="books-page">
            <BackButton />
            <div className="order-history">
                <h1 className="history">HISTORIA WYPOŻYCZEŃ</h1>
            </div>
            
            <div className="container-book">
                {books.map((book) => (
                    <HistoryCard 
                        key={book.id} 
                        title={book.title} 
                        image={book.image} 
                    />
                ))}

            </div>
        </main>
    )
}
