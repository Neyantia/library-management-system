"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import "@/styles/borrow-message.css";
import { BorrowingsItem } from "@/lib/typeTable";

type BorrowMessageProps = {
    borrowing: BorrowingsItem;
};

export default function BorrowMessage({
    borrowing,
}: BorrowMessageProps) {
    const router = useRouter();

    const status = borrowing.status;

    const statusText = {
        active: "AKTYWNA",
        returned: "ZWRÓCONA",
        overdue: "PO TERMINIE",
    };
    const statusLabel = statusText[status as keyof typeof statusText] ?? status;

    return (
        <main className="borrow-message">
            <section className="borrow-content">
                <Image
                    src={borrowing.book.coverImageUrl}
                    alt={borrowing.book.title}
                    width={115}
                    height={180}
                    className="borrow-cover"
                />

                <div className="borrow-info">
                    <h2>{borrowing.book.title}</h2>

                    <span className={`borrow-status ${status}`}>
                        {statusLabel}
                    </span>

                    <p>
                        DATA WYPOŻYCZENIA:{" "}
                        {new Date(borrowing.borrowedAt).toLocaleDateString("pl-PL")}
                    </p>
                    <p>
                        DATA ODDANIA:{" "}
                        {borrowing.returnedAt
                            ? new Date(borrowing.returnedAt).toLocaleDateString("pl-PL")
                            : "_____"}
                    </p>

                    <button className="opinion-button" type="button">
                        Dodaj opinię
                    </button>
                </div>
            </section>
        </main>
    );
}