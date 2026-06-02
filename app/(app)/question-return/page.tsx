"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";
import BackButton from "@/components/BackButton";

import "@/styles/order.css";
import "@/styles/return.css";

export default function QuestionReturnPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const bookId = searchParams.get("bookId");
    const borrowingId = searchParams.get("borrowingId");

    const { data: book, isError } = useQuery<BookItem>({
        queryKey: ["return-book", bookId],
        queryFn: async () => {
            const response = await apiFetch(`/books/${bookId}`);

            if (!response.ok) {
                throw new Error("Nie udało się pobrać książki");
            }

            const data = await response.json();

            return data.item ?? data;
        },
        enabled: !!bookId,
    });

    async function handleReturn() {
        if (!borrowingId) {
            alert("Brak ID wypożyczenia");
            return;
        }

        const response = await apiFetch(
            `/borrowings/${borrowingId}/return`,
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            const data = await response.json();

            alert(data.message || "Nie udało się zwrócić książki");
            return;
        }

        router.push(`/sucess-return?bookId=${bookId}`);
    }

    if (isError) {
        return <p>Nie udało się pobrać książki.</p>;
    }

    return (
        <>
        <BackButton />

        <main className="container-return">
            <div className="return-header">
                <h1>ZWROT</h1>
                <h2>Czy na pewno chcesz oddać?</h2>

                <span>
                    {new Date().toLocaleDateString("pl-PL")}
                </span>
            </div>

            {book && (
                <div className="return-books">
                    <div className="return-book-item">
                        <img
                            className="return-book-cover"
                            src={book.coverImageUrl}
                            alt={book.title}
                        />

                        <p className="return-book-title">
                            {book.title}
                        </p>
                    </div>
                </div>
            )}

            <div className="order-actions">
                <button
                    className="order-confirm-btn"
                    type="button"
                    onClick={handleReturn}
                    style={{
                        backgroundColor: "var(--dark-purple)",
                        fontSize: "16px",
                    }}
                >
                    TAK
                </button>

                <button
                    className="order-cancel-btn"
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        backgroundColor: "var(--grey)",
                        fontSize: "16px",
                    }}
                >
                    ANULUJ
                </button>
            </div>
        </main>
        </>
    );
}