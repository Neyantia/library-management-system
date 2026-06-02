"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";
import BackButton from "@/components/BackButton";

import "./books-list.css";

async function getBooks() {
    const response = await apiFetch("/books");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać listy książek");
    }

    const data = await response.json();
    return data.items ?? [];
}

export default function BooksListPage() {
    const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
    const {
        data: books = [], isError, } = useQuery<BookItem[]>({
        queryKey: ["books"],
        queryFn: getBooks,
        staleTime: 1000 * 60 * 5,
    });

    function toggleBook(bookId: string) {
        setSelectedBookIds((prev) =>
        prev.includes(bookId)
            ? prev.filter((id) => id !== bookId)
            : [...prev, bookId]
        );
    }

    if (isError) return <p>Nie udało się pobrać książek.</p>;
    
    return (
        <>
        <BackButton />
        <main className="books-list-page">
            <div className="list-content">
                {books.map((book) => (
                    <div className="book-cover-container" key={book.id}>
                        <Image className="book-row-cover"
                            src={book.coverImageUrl || "/default-cover.png"}
                            alt={book.title}
                            width={160}
                            height={190}
                        />
                    </div>
                ))}
            
                <div className="books-cover-list">
                    {books.map((book) => (
                        <div className="book-row" key={book.id}>
                            <div className="book-row-content">
                                <h3>{book.title}</h3>
                                <p>{book.description}</p>
                                <p>
                                    {book.authors
                                    ?.map((author) => `${author.firstName} ${author.lastName}`)
                                    .join(", ")}
                                </p>
                                <p>{book.category?.name}</p>
                            </div>
                                
                            <div className="book-row-actions">
                                <label className="custom-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedBookIds.includes(book.id)}
                                        onChange={() => toggleBook(book.id)}
                                    />
                                    <span className="checkmark"></span>
                                </label>
                                <button>KOSZ</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="borrow-btn-container">
                {selectedBookIds.length > 0 ? (
                    <Link href={`/question-order?bookIds=${selectedBookIds.join(",")}`}>
                        <button className="borrow-btn">
                            WYPOŻYCZ
                        </button>
                    </Link>
                ) : (
                    <button className="borrow-btn" disabled>
                        WYPOŻYCZ
                    </button>
                )}
            </div>
            
        </main>
        </>
    );
}