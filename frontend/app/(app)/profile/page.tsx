"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/ProtectRoute";
import type { ReviewsItem } from "@/lib/typeTable";

import "./profile.css";
import "@/styles/loading_page.css";

type UserProfile = {
    email: string;
    firstName: string;
    lastName: string;
};

type LastReadBook = {
    id: string;
    bookId: string;
    book?: {
        id: string;
        title: string;
        coverImageUrl?: string;
    };
};

type BookWithReviews = {
    id: string;
    title: string;
    coverImageUrl?: string;
    reviews?: ReviewsItem[];
};

async function getLastReadBooks(): Promise<LastReadBook[]> {
    const response = await apiFetch("/borrowings/me/history");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać książek");
    }

    const data = await response.json();
    const borrowings = data.items ?? [];

    return Promise.all(
        borrowings.slice(0, 5).map(async (item: LastReadBook) => {
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

async function getBooksWithReviews(
    borrowings: LastReadBook[]
): Promise<BookWithReviews[]> {
    const uniqueBookIds = Array.from(
        new Set(
            borrowings
                .map((item) => item.book?.id)
                .filter(Boolean)
        )
    ) as string[];

    const responses = await Promise.all(
        uniqueBookIds.map((bookId) => apiFetch(`/books/${bookId}`))
    );

    const books = await Promise.all(
        responses.map(async (response) => {
            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            return data.item ?? data;
        })
    );

    return books.filter((book): book is BookWithReviews => book !== null);
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const router = useRouter();

    const { data: lastReadBooks = [] } = useQuery<LastReadBook[]>({
        queryKey: ["last-read-books"],
        queryFn: getLastReadBooks,
    });

    const { data: reviewedBooks = [] } = useQuery<BookWithReviews[]>({
        queryKey: ["reviewed-books", lastReadBooks],
        queryFn: () => getBooksWithReviews(lastReadBooks),
        enabled: lastReadBooks.length > 0,
    });

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        router.replace("/");
    }

    useEffect(() => {
        async function loadProfile() {
            const response = await apiFetch("/users/me");

            if (!response.ok) {
                router.push("/");
                return;
            }

            const data = await response.json();
            setUser(data);
        }

        loadProfile();
    }, [router]);

    return (
        <ProtectedRoute>
            <main className="profile-page">
                <BackButton />

                <div className="profile-buttons">
                    <button
                        onClick={logout}
                        style={{
                            backgroundColor: "var(--dark-purple)",
                            fontSize: "16px",
                            color: "var(--white)",
                        }}
                    >
                        Wyloguj
                    </button>

                    <button
                        onClick={() => router.push("/profile/change-password")}
                        style={{
                            backgroundColor: "var(--lilac)",
                            fontSize: "16px",
                            color: "var(--white)",
                        }}
                    >
                        Zmień hasło
                    </button>

                    <button
                        onClick={() => router.push("/profile/edit-profile")}
                        style={{
                            backgroundColor: "var(--light-purple)",
                            fontSize: "16px",
                            color: "var(--white)",
                        }}
                    >
                        EDYTUJ PROFIL
                    </button>
                </div>

                <section
                    className="profile-header"
                    style={{ color: "var(--dark-purple)" }}
                >
                    <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>
                        {user?.firstName || "Użytkownik"} {user?.lastName}
                    </h1>

                    <p style={{ fontSize: "16px" }}>{user?.email}</p>

                    <div className="avatar loading-moon img"></div>
                </section>

                <section className="profile-description">
                    <h2
                        style={{
                            color: "var(--dark-purple)",
                            fontSize: "25px",
                        }}
                    >
                        Opis
                    </h2>

                    <p style={{ color: "var(--dark-purple)" }}>
                        Tu możesz dodać opis użytkownika.
                    </p>
                </section>

                <div>
                    <button
                        className="library-button"
                        onClick={() => router.push("/library")}
                        style={{
                            backgroundColor: "var(--dark-purple)",
                            fontSize: "16px",
                            color: "var(--white)",
                        }}
                    >
                        Twoja biblioteka
                    </button>

                    <section>
                        <h2>Ostatnio czytane</h2>

                        <div className="profile-books">
                            {lastReadBooks.slice(0, 5).map((item) =>
                                item.book?.coverImageUrl ? (
                                    <img className="profile-book-cover"
                                        key={item.id}
                                        src={item.book.coverImageUrl}
                                        alt={item.book.title}
                                    />
                                ) : null
                            )}
                        </div>
                    </section>
                </div>

                <section>
                    <h2>Twoja aktywność</h2>

                    <div className="profile-reviews">
                        {reviewedBooks.flatMap((book) =>
                            (book.reviews ?? []).map((review) => (
                                <div
                                    className="profile-review"
                                    key={review.id}
                                >
                                    <strong>
                                        {book.title} • {review.rating}/5
                                    </strong>

                                    <p>{review.content}</p>

                                    <small>
                                        {new Date(
                                            review.createdAt
                                        ).toLocaleDateString("pl-PL")}
                                    </small>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </ProtectedRoute>
    );
}