"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./Button";
import type { BookItem } from "@/lib/typeTable";

type BookCardProps = BookItem;

export default function BookCard({
    id,
    title,
    coverImageUrl,
    availableCopiesCount,
}: BookCardProps) {
    const router = useRouter();

    return (
        <div className="book-card" style={{zIndex: "300"}}>
            <Link href={`/books/${id}`} className="nav-link">
                <img className="book-cover"
                    src={coverImageUrl}
                    alt={title}
                />
            </Link>

            <div className="book-btn-actions">
                <Button
                    style={{backgroundColor: "var(--light-purple)", fontSize: "12px"}}
                    onClick={() => {
                        const savedIds = JSON.parse(
                            localStorage.getItem("bookCart") || "[]"
                        );

                        if (!savedIds.includes(id)) {
                            savedIds.push(id);
                        }

                        localStorage.setItem("bookCart", JSON.stringify(savedIds));

                        router.push("/books-list");
                    }}
                >
                    DODAJ DO LISTY
                </Button>


                <Button
                    style={{backgroundColor: "var(--dark-purple)", fontSize: "12px"}}
                    onClick={() => {
                        if (availableCopiesCount <= 0) {router.push("/book-order-status");
                            return;
                        }
                        router.push(`/question-order?bookIds=${id}`);
                    }}
                >
                    WYPOŻYCZ
                </Button>
            </div>
        </div>
    );
}