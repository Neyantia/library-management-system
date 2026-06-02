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

    return (
        <main className="container-main">
            <div className="reclam"/>

            <div className="container-books-catalog">
                <div className="text">
                    <h1>NAJCZĘŚCIEJ WYBIERANE</h1>
                </div>
                
                <div className="books-grid">
                    {books.slice(0, 5).map((book) => (
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
                    {books.slice(0, 5).map((book) => (
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
                    {books.slice(0, 5).map((book) => (
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
                    {books.slice(0, 5).map((book) => (
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
                    {books.slice(0, 5).map((book) => (
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
