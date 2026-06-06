"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { apiFetch } from "@/lib/api";
import type { BorrowingsItem } from "@/lib/typeTable";

import "./returned-books.css";
import "../library.css";

type ReturnedBookItem = BorrowingsItem & {
    book?: {
        id: string;
        title: string;
        coverImageUrl?: string;
        availableCopiesCount?: number;
    };
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

async function getReturnedBooks(
    page: number
): Promise<{
    items: ReturnedBookItem[];
    totalPages: number;
}> {
    const response = await apiFetch(
        `/borrowings/me/history?page=${page}&limit=14`
    );

    if (!response.ok) {
        throw new Error("Nie udało się pobrać historii");
    }

    const data: BorrowingsResponse = await response.json();
    const history: BorrowingsItem[] = data.items ?? [];

    const returnedHistory = history.filter(
        (item) => item.status === "RETURNED"
    );

    const items = await Promise.all(
        returnedHistory.map(async (item) => {
            const bookResponse = await apiFetch(`/books/${item.bookId}`);

            if (!bookResponse.ok) {
                return item;
            }

            const bookData = await bookResponse.json();

            return {
                ...item,
                book: bookData.item ?? bookData,
            };
        })
    );

    return {
        items,
        totalPages: data.meta?.totalPages ?? 1,
    };
}

export default function ReturnedBooksPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const { data, isError, isLoading } = useQuery({
        queryKey: ["returned-books", page],
        queryFn: () => getReturnedBooks(page),
        staleTime: 1000 * 60 * 5,
    });

    const returnedBooks = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    if (isLoading) {
        return <p>Ładowanie historii...</p>;
    }

    if (isError) {
        return <p>Nie udało się pobrać historii.</p>;
    }

    return (
        <main className="returned-books-page">
            <div className="order-history">
                <BackButton />

                <h1 className="history-title his-title">
                    HISTORIA WYPOŻYCZEŃ
                </h1>
            </div>

            <div className="container-book-7">
                {returnedBooks.map((item) => (
                    <div className="book-card" key={item.id}>
                        {item.book?.coverImageUrl && (
                            <Image
                                className="bk-cover"
                                src={item.book.coverImageUrl}
                                alt={item.book.title}
                                width={120}
                                height={130}
                            />
                        )}

                        <button
                            className="returned-book-btn"
                            onClick={() => {
                                if (
                                    item.book?.availableCopiesCount !==
                                        undefined &&
                                    item.book.availableCopiesCount <= 0
                                ) {
                                    router.push("/book-order-status");
                                    return;
                                }

                                router.push(
                                    `/question-order?bookIds=${item.bookId}`
                                );
                            }}
                        >
                            Wypożycz ponownie
                        </button>
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
    );
}