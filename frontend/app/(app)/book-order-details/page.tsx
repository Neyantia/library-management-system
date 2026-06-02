"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { apiFetch } from "@/lib/api";
import type { BorrowingsItem, BookItem } from "@/lib/typeTable";

import "./book-order-details.css";

type BookOrderDetailsItem = BorrowingsItem & {
    book?: BookItem;
};

async function getBookOrderDetails() {
    const response = await apiFetch("/borrowings/me/current");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać historii");
    }

    const data = await response.json();

    const history = data.items ?? [];

    return Promise.all(
        history.map(async (item: BorrowingsItem) => {
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
}

export default function BookOrderDetailsPage() {
    const router = useRouter();

    const searchParams = useSearchParams();

    const borrowingId = searchParams.get("borrowingId");

    const { data: history = [], isLoading, isError } = useQuery<BookOrderDetailsItem[]>({
        queryKey: ["book-order-details"],
        queryFn: getBookOrderDetails,
        staleTime: 1000 * 60 * 5,
    });

    const borrowing = history.find(
        (item) => item.id === borrowingId
    );

    if (isError) {
        return <p>Nie udało się pobrać historii.</p>;
    }
    if (isLoading) {
        return <p>Ładowanie...</p>;
    }
    if (!borrowingId) {
        return <p>Brak ID wypożyczenia.</p>;
    }

    if (!borrowing) {
        return <p>Nie znaleziono wypożyczenia.</p>;
    }

    return (
        <main className="returned-books-page">

            <BackButton />

            <div className="container-statuss-book">
                 {borrowing && (
                    <div className="book-card-details"
                        key={borrowing.id}
                    >
                        {borrowing.book?.coverImageUrl && (
                            <Image
                                className="book-cover-details"
                                src={borrowing.book.coverImageUrl}
                                alt={borrowing.book.title}
                                width={180}
                                height={260}
                            />
                        )}
                        <div className="info-details-book">
                            <p className="returned-book-title">
                                {borrowing.book?.title || borrowing.bookTitle}
                            </p>

                            <p
                                className={`returned-book-status ${
                                    borrowing.status === "ACTIVE"
                                        ? "status-active"
                                        : borrowing.status === "RETURNED"
                                        ? "status-returned"
                                        : "status-late"
                                }`}
                            >
                                {borrowing.status === "ACTIVE"
                                    ? "AKTYWNA"
                                    : borrowing.status === "RETURNED"
                                    ? "ZWRÓCONA"
                                    : "PO TERMINIE"}
                            </p>

                            <p className="returned-book-date">
                                DATA WYPOŻYCZENIA:{" "}
                                {new Date(borrowing.borrowedAt).toLocaleDateString("pl-PL")}
                            </p>

                            <p className="returned-book-date">
                                DATA ODDANIA:{" "}
                                {borrowing.returnedAt
                                    ? new Date(borrowing.returnedAt).toLocaleDateString("pl-PL")
                                    : "—"}
                            </p>

                            <button className="returned-book-btn"
                                onClick={() =>
                                    router.push(`/order-status?bookId=${borrowing.bookId}`)
                                }
                            >
                                Dodaj opinie
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}