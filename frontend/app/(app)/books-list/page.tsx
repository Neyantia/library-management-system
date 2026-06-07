"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";
import BackButton from "@/components/BackButton";

import "./books-list.css";

async function getBook(id: string): Promise<BookItem> {
    const response = await apiFetch(`/books/${id}`);

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książki");
    }

    const data = await response.json();
    return data.item ?? data;
}

export default function BooksListPage() {
    const [bookIds, setBookIds] = useState<string[]>([]);
    const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

    useEffect(() => {
        const savedIds = JSON.parse(
            localStorage.getItem("bookCart") || "[]"
        );

        setBookIds(savedIds);
    }, []);

    const { data: books = [], isError, isLoading } = useQuery<BookItem[]>({
        queryKey: ["books-list-cart", bookIds],
        queryFn: async () => {
            return Promise.all(bookIds.map((id) => getBook(id)));
        },
        enabled: bookIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });

    function toggleBook(bookId: string) {
        setSelectedBookIds((prev) =>
            prev.includes(bookId)
                ? prev.filter((id) => id !== bookId)
                : [...prev, bookId]
        );
    }

    function removeFromCart(bookId: string) {
        const newIds = bookIds.filter((id) => id !== bookId);

        setBookIds(newIds);
        setSelectedBookIds((prev) => prev.filter((id) => id !== bookId));
        localStorage.setItem("bookCart", JSON.stringify(newIds));
    }

    if (isLoading) {
        return <p>Ładowanie książek...</p>;
    }

    if (isError) {
        return <p>Nie udało się pobrać książek.</p>;
    }

    if (bookIds.length === 0) {
        return (
            <>
                <BackButton />
                <main className="books-list-page">
                    <p>Lista jest pusta.</p>
                </main>
            </>
        );
    }

    return (
        <>
            <BackButton />

            <main className="books-list-page">
                <div className="list-content">
                    <div className="books-cover-list">
                        {books.map((book) => (
                            <div className="book-row" key={book.id}>
                                <Image
                                    className="book-row-cover"
                                    src={book.coverImageUrl || "/default-cover.png"}
                                    alt={book.title}
                                    width={160}
                                    height={190}
                                />

                                <div className="book-row-content">
                                    <h3>{book.title}</h3>

                                    <p>
                                        {book.authors
                                            ?.map(
                                                (author) =>
                                                    `${author.firstName} ${author.lastName}`
                                            )
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

                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(book.id)}
                                    >
                                        KOSZ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="borrow-btn-container">
                    {selectedBookIds.length > 0 ? (
                        <Link
                            href={`/question-order?bookIds=${selectedBookIds.join(
                                ","
                            )}`}
                        >
                            <button className="borrow-btn">WYPOŻYCZ</button>
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