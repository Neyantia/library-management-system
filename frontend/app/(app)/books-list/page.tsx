"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";
import BackButton from "@/components/BackButton";

import "./books-list.css";

type BooksResponse = {
    items: BookItem[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

async function getBooks(page: number): Promise<BooksResponse> {
    const response = await apiFetch(`/books?page=${page}&limit=10`);

    if (!response.ok) {
        throw new Error("Nie udało się pobrać listy książek");
    }

    return response.json();
}

export default function BooksListPage() {
    const [page, setPage] = useState(1);
    const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

    const { data, isError, isLoading } = useQuery<BooksResponse>({
        queryKey: ["books-list", page],
        queryFn: () => getBooks(page),
        staleTime: 1000 * 60 * 5,
    });

    const books = data?.items ?? [];
    const totalPages = data?.meta?.totalPages ?? 1;

    function toggleBook(bookId: string) {
        setSelectedBookIds((prev) =>
            prev.includes(bookId)
                ? prev.filter((id) => id !== bookId)
                : [...prev, bookId]
        );
    }

    if (isLoading) {
        return <p>Ładowanie książek...</p>;
    }

    if (isError) {
        return <p>Nie udało się pobrać książek.</p>;
    }

    return (
        <>
            <BackButton />

            <main className="books-list-page">
                <div className="list-content">
                    {books.map((book) => (
                        <div className="book-cover-" key={book.id}>
                            <Image
                                className="book-row-cover"
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
                                            checked={selectedBookIds.includes(
                                                book.id
                                            )}
                                            onChange={() =>
                                                toggleBook(book.id)
                                            }
                                        />
                                        <span className="checkmark"></span>
                                    </label>

                                    <button type="button">KOSZ</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="pagination"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px",
                        paddingTop: "10px",
                        paddingBottom: "20px",
                        color: "var(--dark-purple)",
                    }}
                >
                    {page > 1 && (
                        <button
                            className="back-button"
                            type="button"
                            onClick={() =>
                                setPage((prev) => Math.max(1, prev - 1))
                            }
                        >
                            &#10094;
                        </button>
                    )}

                    <span>Strona {page}</span>

                    {page < totalPages && (
                        <button
                            className="back-button"
                            type="button"
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(totalPages, prev + 1)
                                )
                            }
                        >
                            &#10095;
                        </button>
                    )}
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