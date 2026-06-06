
"use client"

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BookItem } from "@/lib/typeTable";

import "@/styles/order.css";
import "@/styles/return.css";
import ProtectedRoute from "@/components/ProtectRoute";

export default function SucessReturnPage() {
    const searchParams = useSearchParams();
    const bookId = searchParams.get("bookId");

    const { data: book } = useQuery<BookItem>({
        queryKey: ["success-return-book", bookId],
        queryFn: async () => {
            const response = await apiFetch(`/books/${bookId}`);
            return response.json();
        },
        enabled: !!bookId,
    });


    return (
        <ProtectedRoute>
        <main className="container-return" style={{marginTop: "60px"}}>
            <div className="return-header">
                <h1>Dokonano zwrotu</h1>

                <span>
                    {new Date().toLocaleDateString("pl-PL")}
                </span>
            </div>
            
            {book && (
                    <div className="return-books">
                        <div className="return-book-item">
                            <img
                                className="return-book-cover"
                                src={book.coverImageUrl || "/default-cover.png"}
                                alt={book.title}
                            />

                            <p className="return-book-title">
                                {book.title}
                            </p>
                        </div>
                    </div>
                )}
        </main>
        </ProtectedRoute>
    );
}