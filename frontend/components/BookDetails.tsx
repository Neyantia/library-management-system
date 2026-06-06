"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import BackButton from "@/components/BackButton";
import type { BookItem } from "@/lib/typeTable";

import "@/styles/book-details.css";

async function getBook(id: string): Promise<BookItem> {
    const response = await apiFetch(`/books/${id}`);

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książki");
    }

    const data = await response.json();

    return data.item ?? data;
}

export default function BookDetailsPage({ id }: { id: string }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [review, setReview] = useState("");
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState("");

    const { data: book } = useQuery<BookItem>({
        queryKey: ["book", id],
        queryFn: () => getBook(id),
        enabled: !!id,
    });

    async function addReview() {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setMessage("Aby dodać opinię, musisz być zalogowany.");
            return;
        }

        if (!review.trim()) {
            setMessage("Wpisz opinię");
            return;
        }

        const response = await apiFetch(`/books/${id}/reviews`, {
            method: "POST",
            body: JSON.stringify({
                content: review,
                rating,
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                setMessage("Aby dodać opinię, musisz być zalogowany.");
            } else {
                setMessage("Nie udało się dodać opinii");
            }

            return;
        }
        setReview("");
        setRating(5);

        queryClient.invalidateQueries({
            queryKey: ["book", id],
        });

        setMessage("Dodano opinię");
    }

    if (!book) {
        return null;
    }
    const displayRating = book.reviewsCount > 0 ? book.rating ?? 0 : 0;

    return (
        <main className="books-details-page">
            <BackButton />

            <section className="book-details-card">
                <Image
                    className="book-details-cover"
                    src={book.coverImageUrl}
                    alt={book.title}
                    width={180}
                    height={270}
                />

                <h1 className="book-details-title">{book.title}</h1>

                <p className="book-details-author">
                    {book.authors
                        ?.map((author) => `${author.firstName} ${author.lastName}`)
                        .join(", ")}
                </p>

                <div className="book-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <span
                            key={index}
                            className={
                                index < Math.round(displayRating)
                                    ? "star filled"
                                    : "star"
                            }
                        >
                            ★
                        </span>
                    ))}

                    <span className="rating-number">
                        {(displayRating).toFixed(1)}
                    </span>
                </div>
                
                <div className="grid-detail-btn-bk">
                    <div className="book-details-actions">
                            <button className="list-btn"
                                style={{backgroundColor:"var(--light-purple)", fontSize:"18px", color: "var(--white)"}}
                                onClick={() => router.push("/books-list")}    
                            >
                                DODAJ DO LISTY
                            </button>

                            <button className="borrow-btn"
                                style={{backgroundColor:"var(--dark-purple)", fontSize:"20px", color: "var(--white)"}}
                                onClick={() => {
                                    if (book.availableCopiesCount <= 0) {router.push("/message");
                                        return;
                                    }
                                    router.push(`/question-order?bookIds=${id}`);
                                }}    
                            >
                                WYPOŻYCZ
                            </button>
                    </div>
                    
                    <div className="book-info-grid" style={{color:"var(--dark-purple)"}}>
                        <div className="book-info-left">
                            <p>
                                <strong>Gatunek:</strong>{" "}{book.category?.name}
                            </p>
                            <p>
                                <strong>Autor:</strong>{" "}{book.authors
                                    ?.map((author) => `${author.firstName} ${author.lastName}`)
                                    .join(", ")}
                            </p>
                            <p>
                                <strong>Kategoria wiekowa:</strong>{" "}{book.category?.name}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}{book.availableCopiesCount > 0 ? "Dostępna" : "Niedostępna"}
                            </p>
                            
                            <p>
                                <strong>Rok wydania:</strong>{" "}{book.publicationYear}
                            </p>
                            <p>
                                <strong>Język:</strong>{" "}{book.language}
                            </p>
                        </div>
                        <div className="book-info-right">
                            <p>
                                <strong>Liczba kopii książki:</strong>{" "}{book.copiesCount}
                            </p>
                            <p>
                                <strong>Liczba dostępnych kopii:</strong>{" "}{book.availableCopiesCount}
                            </p>
                            <p>
                                <strong>Ilość opinii:</strong>{" "}{book.reviewsCount}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="book-section">
                    <h2 style={{fontSize: "25px"}}>Opis</h2>
                    <p style={{fontSize: "16px"}}>{book.description}</p>
                </div>

                <div className="review-box">
                    <h2 className="reviews-title">Opinie</h2>
                    
                    <button className="add-review-btn"
                        onClick={addReview}
                        style={{backgroundColor:"var(--dark-purple)", fontSize:"20px", color: "var(--white)"}}
                    >
                        Wyślij opinię
                    </button>
                </div>

                <div className="rating-select">
                    <label>Ocena:</label>

                    <select
                        value={rating}
                        onChange={(event) =>
                            setRating(Number(event.target.value))
                        }
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>
                </div>

                <textarea className="reviews-list"
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    placeholder="Napisz swoją opinię..."
                />
                
                {message && <p style={{color:"var(--T-dark-red)",fontSize: "16px", fontWeight:"bold"}}>{message}</p>}

                <div className="reviews-list">
                    {book.reviews?.length ? (
                        book.reviews.map((review, index) => (
                            <div className="review-item" key={`${review.bookId}-${review.createdAt}-${index}`}>
                                <div className="review-user">
                                    <strong>Użytkownik</strong>
                                    <span>
                                        {new Date(review.createdAt).toLocaleDateString("pl-PL")}
                                    </span>
                                    <span>
                                        Ocena:{" "}<strong>{review.rating}</strong>
                                    </span>
                                </div>

                                <p>{review.content}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{backgroundColor:"var(--dark-red)", fontSize:"20px"}}>Brak opinii.</p>
                    )}
                </div>
                                
            </section>
        </main>
    )
}