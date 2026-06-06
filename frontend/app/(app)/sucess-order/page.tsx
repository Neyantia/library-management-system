"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";
import ProtectedRoute from "@/components/ProtectRoute";

import "@/styles/order.css";

export default function SuccessOrderPage() {
    const searchParams = useSearchParams();
    const bookIdsParam = searchParams.get("bookIds");

    const bookIds = bookIdsParam
        ? bookIdsParam.split(",").filter(Boolean)
        : [];

    const { data: books = [] } = useQuery<BookItem[]>({
        queryKey: ["success-books", bookIds],
        queryFn: async () => {
            const responses = await Promise.all(
                bookIds.map((id) => apiFetch(`/books/${id}`))
            );

            const data = await Promise.all(
                responses.map((response) => response.json())
            );

            return data.map((item) => item.item ?? item);
        },
        enabled: bookIds.length > 0,
    });

    return (
        <ProtectedRoute>
        <main className="container-order">
            <div className="order-header">
                <h2>Sukces!</h2>

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
        </main>
        </ProtectedRoute>
    );
}