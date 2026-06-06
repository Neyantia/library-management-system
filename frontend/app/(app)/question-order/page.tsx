"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/ProtectRoute";

import "@/styles/order.css";

export default function QuestionOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const bookIdsParam = searchParams.get("bookIds");

    const bookIds = bookIdsParam
        ? bookIdsParam.split(",").filter(Boolean)
        : [];

    const { data: books = [], isError } = useQuery<BookItem[]>({
        queryKey: ["question-books", bookIds],
        queryFn: async () => {
            const responses = await Promise.all(
                bookIds.map((id) => apiFetch(`/books/${id}`))
            );

            const booksData = await Promise.all(
                responses.map(async (response) => {
                    if (!response.ok) {
                        throw new Error("Nie udało się pobrać książki");
                    }

                    const data = await response.json();

                    return data.item ?? data;
                })
            );

            return booksData;
        },
        enabled: bookIds.length > 0,
    });

    async function confirmBorrow() {
        try {
            const endpoint =
                bookIds.length === 1
                    ? "/borrowings"
                    : "/borrowings/cart";

            const body =
                bookIds.length === 1
                    ? { bookId: bookIds[0] }
                    : { bookIds };

            const response = await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                router.push(
                    `/book-order-status?message=${encodeURIComponent(
                        data.message || "Nie udało się wypożyczyć książki"
                    )}`
                );
                return;
            }

            router.push(
                `/sucess-order?bookIds=${bookIds.join(",")}`
            );
        } catch {
            router.push(
                `/book-order-status?message=${encodeURIComponent(
                    "Wystąpił błąd"
                )}`
            );
        }
    }

    if (isError) {
        return <p>Nie udało się pobrać książek.</p>;
    }

    if (bookIds.length === 0) {
        return <p>Nie wybrano żadnych książek.</p>;
    }

    return (
        <ProtectedRoute>
        <BackButton />

        <main className="container-order">
            <div className="order-header">
                <h2>Czy na pewno to wszystko?</h2>

                <span>
                    {new Date().toLocaleDateString("pl-PL")}
                </span>
            </div>

            <div className="order-books">
                {books.map((book) => (
                    <div key={book.id} className="order-book-item">
                        <img
                            className="order-book-cover"
                            src={book.coverImageUrl || "/default-cover.png"}
                            alt={book.title}
                        />

                        <p className="order-book-title">
                            {book.title}
                        </p>
                    </div>
                ))}
            </div>

            <div className="order-actions">
                <button
                    className="order-confirm-btn"
                    type="button"
                    onClick={confirmBorrow}
                    style={{backgroundColor: "var(--dark-purple)", fontSize: "16px"}}
                >
                    TAK
                </button>

                <button
                    className="order-cancel-btn"
                    type="button"
                    onClick={() => router.back()}
                    style={{backgroundColor: "var(--grey)", fontSize: "16px"}}
                >
                    ANULUJ
                </button>
            </div>
        </main>
        </ProtectedRoute>
    );
}