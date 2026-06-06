"use client"
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { BookItem } from "@/lib/typeTable";

import "./main_page.css";
import "../books/books.css";

async function getPopularBooks() {
    const response = await apiFetch("/books");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książek");
    }

    const data = await response.json();
    return data.items ?? [];
}

export default function MainPage() {

    const { data: books = [] } = useQuery<BookItem[]>({
        queryKey: ["popular-books"],
        queryFn: getPopularBooks,
        staleTime: 1000 * 60 * 5,
    });

    // Po liczbie opinii 
    const popularBooks = books
    .slice()
    .sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0))
    .slice(0, 10);

    // Po najwyższej ocenia
    const topBooks = books
        .slice()
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 10);

    // Po roku wydania
    const newestBooks = books
        .slice()
        .sort((a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0))
        .slice(0, 10);

    // Książki z oceną od 4
    const recommendedBooks = books
        .filter((book) => (book.rating ?? 0) >= 4)
        .slice(0, 10);

    // Losowe książki
    const discoverBooks = books
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    return (
        <main className="container-main">
            <div className="reclam"/>

            <div className="container-books-catalog">
                <div className="text">
                    <h1>NAJCZĘŚCIEJ WYBIERANE</h1>
                </div>
                
                <div className="books-grid">
                    {popularBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            coverImageUrl={book.coverImageUrl}
                        />
                    ))}
                </div>
            </div>

            <div className="container-books-catalog">
                <div className="text">
                    <h1>TOP 10</h1>
                </div>
                
                <div className="books-grid">
                    {topBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            coverImageUrl={book.coverImageUrl}
                        />
                    ))}
                </div>
            </div>

            <div className="container-books-catalog">
                <div className="text">
                    <h1>NAJNOWSZE</h1>
                </div>
                
                <div className="books-grid">
                    {newestBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            coverImageUrl={book.coverImageUrl}
                        />
                    ))}
                </div>
            </div>

            <div className="container-books-catalog">
                <div className="text">
                    <h1>POLECANE PRZEZ NAS</h1>
                </div>
                
                <div className="books-grid">
                    {recommendedBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            coverImageUrl={book.coverImageUrl}
                        />
                    ))}
                </div>
            </div>

            <div className="container-books-catalog">
                <div className="text">
                    <h1>ODKRYWAJ</h1>
                </div>
                
                <div className="books-grid">
                    {discoverBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            coverImageUrl={book.coverImageUrl}
                        />
                    ))}
                </div>
            </div>

        </main>
    );
}
