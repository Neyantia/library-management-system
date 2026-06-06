"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import { apiFetch } from "@/lib/api";
import type { BorrowingsItem } from "@/lib/typeTable";

import "./returned-books.css";
import "../library.css";

type BookDetails = {
    id: string;
    title: string;
    coverImageUrl: string;
};

type BookOrderDetailsItem = BorrowingsItem & {
    book: BookDetails;
};

async function getBookOrderDetails() {
    const response = await apiFetch("/borrowings/me/history");

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
    console.log("URL borrowingId:", borrowingId);

    const { data: history = [], isError } = useQuery<BookOrderDetailsItem[]>({
        queryKey: ["returned-books"],
        queryFn: getBookOrderDetails,
        staleTime: 1000 * 60 * 5,
    });

    const borrowing = history.find(
        (item) => item.id === borrowingId
    );



    if (isError) {
        return <p>Nie udało się pobrać historii.</p>;
    }

    return (
        <main className="returned-books-page">

            <div className="order-history">
                <BackButton />

                <h1 className="history-title">
                    HISTORIA WYPOŻYCZEŃ
                </h1>
            </div>

            <div className="container-book">
                 {borrowing && (
                    <div className="book-card"
                        key={borrowing.id}
                    >
                        {borrowing.book?.coverImageUrl && (
                            <img
                                className="book-cover"
                                src={borrowing.book.coverImageUrl}
                                alt={borrowing.book.title}
                                width={180}
                                height={260}
                            />
                        )}

                        <p className="returned-book-title">
                            {borrowing.book?.title || borrowing.bookTitle}
                        </p>

                        <p className="returned-book-status">
                            {borrowing.status}
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
                )}
            </div>
        </main>
    );
}