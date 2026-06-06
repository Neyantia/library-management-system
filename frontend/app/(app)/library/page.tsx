"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import type { BorrowingsItem } from "@/lib/typeTable";
import ProtectedRoute from "@/components/ProtectRoute";

import "./library.css";

type BookDetails = {
    id: string;
    coverImageUrl: string;
};

type BorrowingWithBook = Omit<BorrowingsItem, "book"> & {
    book: BookDetails;
};

type BorrowingsResponse = {
    items: BorrowingsItem[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

async function getBookDetails(bookId: string): Promise<BookDetails> {
    const response = await apiFetch(`/books/${bookId}`);

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książki");
    }

    const data = await response.json();
    return data.item ?? data;
}

async function getCurrentBorrowings(
    page: number
): Promise<{
    items: BorrowingWithBook[];
    totalPages: number;
}> {
    const response = await apiFetch(
        `/borrowings/me/current?page=${page}&limit=14`
    );

    if (!response.ok) {
        throw new Error("Nie udało się pobrać aktualnych wypożyczeń");
    }

    const data: BorrowingsResponse = await response.json();
    const borrowings: BorrowingsItem[] = data.items ?? [];

    const items = await Promise.all(
        borrowings.map(async (item) => {
            const book = await getBookDetails(item.bookId);

            return {
                ...item,
                book,
            };
        })
    );

    return {
        items,
        totalPages: data.meta?.totalPages ?? 1,
    };
}

export default function LibraryPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const { data, isError, isLoading } = useQuery({
        queryKey: ["borrowings-current", page],
        queryFn: () => getCurrentBorrowings(page),
        staleTime: 1000 * 60 * 5,
    });

    const borrowings = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    if (isLoading) {
        return <p>Ładowanie wypożyczeń...</p>;
    }

    if (isError) {
        return <p>Nie udało się pobrać aktualnych wypożyczeń.</p>;
    }

    return (
        <ProtectedRoute>
            <main className="books-page">
                <div className="order-history">
                    <BackButton />
                    <h1 className="history-title">
                        AKTUALNE WYPOŻYCZENIA
                    </h1>

                    <button
                        className="history-button"
                        onClick={() =>
                            router.push("/library/returned-books")
                        }
                    >
                        HISTORIA
                    </button>
                </div>

                <div className="container-book-7">
                    {borrowings.map((item) => (
                        <div className="book-card" key={item.id}>
                            {item.book.coverImageUrl && (
                                <Image
                                    className="bk-cover"
                                    src={item.book.coverImageUrl}
                                    alt={item.bookTitle}
                                    width={180}
                                    height={260}
                                    onClick={() =>
                                        router.push(
                                            `/book-order-details?borrowingId=${item.id}`
                                        )
                                    }
                                    style={{ cursor: "pointer" }}
                                />
                            )}

                            <div className="book-btn-actions-col">
                                <button
                                    className="book-btn-orders"
                                    style={{
                                        backgroundColor:
                                            "var(--dark-purple)",
                                        color: "var(--white)",
                                    }}
                                >
                                    Czytaj dalej
                                </button>

                                <button
                                    className="book-btn-orders"
                                    style={{
                                        backgroundColor: "var(--btn-red)",
                                        color: "var(--white)",
                                    }}
                                    onClick={() =>
                                        router.push(
                                            `/question-return?borrowingId=${item.id}&bookId=${item.bookId}`
                                        )
                                    }
                                >
                                    Zwróć
                                </button>
                            </div>
                        </div>
                    ))}
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
            </main>
        </ProtectedRoute>
    );
}