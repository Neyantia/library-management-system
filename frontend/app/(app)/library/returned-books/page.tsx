"use client";

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


async function getReturnedBooks(): Promise<ReturnedBookItem[]> {
    const response = await apiFetch("/borrowings/me/history");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać historii");
    }

    const data = await response.json();
    const history: BorrowingsItem[] = data.items ?? [];
    
    const returnedHistory = history.filter((item) => item.status === "RETURNED");

    return Promise.all(
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
}

export default function ReturnedBooksPage() {
    const router = useRouter();

    const { data: returnedBooks = [], isError } = useQuery<ReturnedBookItem[]>({
            queryKey: ["returned-books"],
            queryFn: getReturnedBooks,
            staleTime: 1000 * 60 * 5,
        });

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
                    <div className="book-card"
                        key={item.id}
                    >
                        {item.book?.coverImageUrl && (
                            <Image
                                className="bk-cover"
                                src={item.book.coverImageUrl}
                                alt={item.book.title}
                                width={120}
                                height={130}
                            />
                        )}

                        <button className="returned-book-btn"
                            onClick={() => {
                                if (item.book?.availableCopiesCount !== undefined &&
                                    item.book.availableCopiesCount <= 0
                                ) {router.push("/book-order-status");
                                    return;
                                }
                                router.push(`/question-order?bookIds=${item.bookId}`);
                            }}
                        >
                            Wypożycz ponownie
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );
}