"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import type { BorrowingsItem } from "@/lib/typeTable";

import "./library.css";

type BookDetails = {
    id: string;
    coverImageUrl: string;
};

type BorrowingWithBook = Omit<BorrowingsItem, "book"> & {
    book: BookDetails;
};

async function getBookDetails(bookId: string): Promise<BookDetails> {
    const response = await apiFetch(`/books/${bookId}`);

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książki");
    }

    const data = await response.json();
    return data.item ?? data;
}

async function getCurrentBorrowings(): Promise<BorrowingWithBook[]> {
    const response = await apiFetch("/borrowings/me/current");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać aktualnych wypożyczeń");
    }

    const data = await response.json();

    const borrowings: BorrowingsItem[] = data.items ?? [];
    

    return Promise.all(
        borrowings.map(async (item) => {
            const book = await getBookDetails(item.bookId);

            return {
                ...item,
                book,
            };
        })
    );
}

export default function LibraryPage() {
    const router = useRouter();

    const { data: borrowings = [], isError } = useQuery<BorrowingWithBook[]>({
        queryKey: ["borrowings-current"],
        queryFn: getCurrentBorrowings,
        staleTime: 1000 * 60 * 5,
    });

    if (isError) {
        return <p>Nie udało się pobrać aktualnych wypożyczeń.</p>;
    }
    
    return (
        <main className="books-page">

            <div className="order-history">
                <BackButton />
                <h1 className="history-title">AKTUALNE WYPOŻYCZENIA</h1>
                
                <button
                    className="history-button"
                    onClick={() => router.push("/library/returned-books")}
                >
                    HISTORIA 
                </button>
            </div>
            
            <div className="container-book-7">
                {borrowings.map((item) => (
                    <div className="book-card" key={item.id}>
                        {item.book.coverImageUrl && (
                        <Image className="bk-cover"
                            src={item.book.coverImageUrl}
                            alt={item.bookTitle}
                            width={180}
                            height={260}
                            onClick={() =>
                                router.push(`/book-order-details?borrowingId=${item.id}`)
                            }
                            style={{ cursor: "pointer" }}
                        />
                        )}

                        <div className="book-btn-actions-col">
                            <button className="book-btn-orders"
                                style={{ backgroundColor: "var(--dark-purple)", color: "var(--white)" }}
                            >
                                Czytaj dalej
                            </button>

                            <button
                                className="book-btn-orders"
                                style={{ backgroundColor: "var(--btn-red)", color: "var(--white)" }}
                                onClick={() => router.push(`/question-return?borrowingId=${item.id}&bookId=${item.bookId}`)}
                            >
                                Zwróć
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
