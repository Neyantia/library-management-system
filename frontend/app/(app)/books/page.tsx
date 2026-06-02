"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import BookCard from "@/components/BookCard";
import BackButton from "@/components/BackButton";
import type { BookItem } from "@/lib/typeTable";

import "./books.css";

async function getBooks() {
    const response = await apiFetch("/books");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książek");
    }

    const data = await response.json();
    return data.items ?? [];
}

export default function Books() {

    const { data: books = [] } = useQuery<BookItem[]>({
        queryKey: ["books"],
        queryFn: getBooks,
        staleTime: 1000 * 60 * 5,
    });

    return (
        <main className="books-page">
            <BackButton />

            <div className="container-book">
                {books.map((book) => (
                    <BookCard 
                        key={book.id}
                        id={book.id}
                        title={book.title} 
                        coverImageUrl={book.coverImageUrl} 
                    />
                ))}

            </div>
        </main>
    )
}

