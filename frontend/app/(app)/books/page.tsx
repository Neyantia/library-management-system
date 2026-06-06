"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import BookCard from "@/components/BookCard";
import BackButton from "@/components/BackButton";
import type { BookItem } from "@/lib/typeTable";

import "./books.css";

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
        throw new Error("Nie udało się pobrać książek");
    }

    return response.json();
}

export default function Books() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const available = searchParams.get("available");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery<BooksResponse>({
        queryKey: ["books", page],
        queryFn: () => getBooks(page),
        staleTime: 1000 * 60 * 5,
    });

    const books = data?.items ?? [];
    const totalPages = data?.meta?.totalPages ?? 1;
    console.log(data);

    const filteredBooks = books.filter((book) => {
        const searchMatch =
            !search ||
            book.title.toLowerCase().includes(search) ||
            book.authors?.some((author) =>
                `${author.firstName} ${author.lastName}`
                    .toLowerCase()
                    .includes(search)
            );

        const availableMatch =
            available === "true"
                ? book.availableCopiesCount > 0
                : available === "false"
                ? book.availableCopiesCount <= 0
                : true;

        return searchMatch && availableMatch;
    });

    if (isLoading) {
        return (
            <p
                style={{
                    color: "var(--T-dark-red)",
                    fontSize: "15px",
                    textAlign: "center",
                }}
            >
                Ładowanie książek...
            </p>
        );
    }

    return (
        <main className="books-page">
            <BackButton />

            <div className="container-book">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            coverImageUrl={book.coverImageUrl}
                        />
                    ))
                ) : (
                    <p
                        style={{
                            color: "var(--T-dark-red)",
                            fontSize: "30px",
                            gridColumn: "1 / -1",
                            textAlign: "center",
                        }}
                    >
                        <strong>NIE ZNALEZIONO</strong>
                    </p>
                )}
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
                    paddingBottom:"20px",
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

                    <span style={{alignContent:"center", justifyContent:"center", }}>
                        Strona {Math.max(1, page)}
                    </span>

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
        </main>
    );
}