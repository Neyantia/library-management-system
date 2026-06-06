"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import BooksTable from "@/components/table/BooksTable";
import AuthorsTable from "@/components/table/AuthorsTable";
import CategoriesTable from "@/components/table/CategoriesTable";
import UsersTable from "@/components/table/UsersTable";
import NavBar from "@/components/NavBar";
import ProtectedRoute from "@/components/ProtectRoute";
import type {
    BookItem,
    AuthorItem,
    CategoryItem,
    UserItem,
} from "@/lib/typeTable";

import "./admin.css";
import "@/styles/back-button.css";

type AdminTables = BookItem[] | AuthorItem[] | CategoryItem[] | UserItem[];
type Tab = "books" | "authors" | "categories" | "users";

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("books");
    const [data, setData] = useState<AdminTables>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadData = useCallback(async (tab: Tab) => {
        let endpoint = "";

        switch (tab) {
            case "books":
                endpoint = "/books";
                break;
            case "authors":
                endpoint = "/authors";
                break;
            case "categories":
                endpoint = "/categories";
                break;
            case "users":
                endpoint = "/users";
                break;
        }

        const response = await apiFetch(
            `${endpoint}?page=${page}&limit=10`
        );

        if (!response.ok) {
            console.error("Błąd pobierania danych");
            return;
        }

        const result = await response.json();
        setTotalPages(result.meta?.totalPages ?? 1);

        if (tab === "books") {
            const books: BookItem[] = result.items ?? result;

            const booksWithDetails = await Promise.all(
                books.map(async (book) => {
                    const detailsResponse = await apiFetch(`/books/${book.id}`);

                    if (!detailsResponse.ok) {
                        return book;
                    }

                    const detailsData = await detailsResponse.json();
                    return detailsData.item ?? detailsData;
                })
            );

            setData(booksWithDetails);
            return;
        }

        setData(Array.isArray(result) ? result : result.items ?? []);
    }, [page]);

    useEffect(() => {
        loadData(activeTab);
    }, [activeTab, page, loadData]);

    return (
        <ProtectedRoute>
            <NavBar />

            <main className="admin-page">
                <aside className="admin-sidebar">
                    <h3>Panel Administratora</h3>

                    <button onClick={() => setActiveTab("books")}>Książki</button>
                    <button onClick={() => setActiveTab("authors")}>Autorzy</button>
                    <button onClick={() => setActiveTab("categories")}>Kategorie</button>
                    <button onClick={() => setActiveTab("users")}>Użytkownicy</button>
                </aside>

                <section className="admin-content">
                    <h1 className="admin-title">
                        {activeTab === "books" && "Zarządzanie książkami"}
                        {activeTab === "authors" && "Zarządzanie autorami"}
                        {activeTab === "categories" && "Zarządzanie kategoriami"}
                        {activeTab === "users" && "Zarządzanie użytkownikami"}
                    </h1>

                    {activeTab === "books" && (
                        <>
                            <div className="admin-actions">
                                <button
                                    className="create-button"
                                    onClick={() => router.push("/admin/tables/create/books")}
                                >
                                    Dodaj książkę
                                </button>
                            </div>

                            <BooksTable
                                books={data as BookItem[]}
                                loadData={() => loadData("books")}
                            />
                            <div className="pagination" 
                                style={{
                                    display:"flex", 
                                    flexDirection:"row", 
                                    alignContent:"center", 
                                    justifyContent:"center", 
                                    paddingTop:"10px",
                                    paddingBottom:"20px",
                                    color:"var(--dark-purple)"
                                    }}
                                >
                                {page > 1 && (
                                    <button className="back-button" onClick={() => setPage(page - 1)}>
                                        &#10094;
                                    </button>
                                )}

                                <span style={{alignContent:"center", justifyContent:"center", }}>
                                    Strona {Math.max(1, page)}
                                </span>

                                {page < totalPages && (
                                    <button className="back-button" onClick={() => setPage(page + 1)}>
                                        &#10095;
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "authors" && (
                        <>
                            <div className="admin-actions">
                                <button
                                    className="create-button"
                                    onClick={() => router.push("/admin/tables/create/authors")}
                                >
                                    Dodaj autora
                                </button>
                            </div>

                            <AuthorsTable authors={data as AuthorItem[]} />

                            <div className="pagination" 
                                style={{
                                    display:"flex", 
                                    flexDirection:"row", 
                                    alignContent:"center", 
                                    justifyContent:"center", 
                                    paddingTop:"10px",
                                    paddingBottom:"20px",
                                    color:"var(--dark-purple)"
                                    }}
                                >
                                {page > 1 && (
                                    <button className="back-button" onClick={() => setPage(page - 1)}>
                                        &#10094;
                                    </button>
                                )}

                                <span style={{alignContent:"center", justifyContent:"center", }}>
                                    Strona {Math.max(1, page)}
                                </span>

                                {page < totalPages && (
                                    <button className="back-button" onClick={() => setPage(page + 1)}>
                                        &#10095;
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "categories" && (
                        <>
                            <div className="admin-actions">
                                <button
                                    className="create-button"
                                    onClick={() => router.push("/admin/tables/create/categories")}
                                >
                                    Dodaj kategorię
                                </button>
                            </div>

                            <CategoriesTable categories={data as CategoryItem[]} />

                            <div className="pagination" 
                                style={{
                                    display:"flex", 
                                    flexDirection:"row", 
                                    alignContent:"center", 
                                    justifyContent:"center", 
                                    paddingTop:"10px",
                                    paddingBottom:"20px",
                                    color:"var(--dark-purple)"
                                    }}
                                >
                                {page > 1 && (
                                    <button className="back-button" onClick={() => setPage(page - 1)}>
                                        &#10094;
                                    </button>
                                )}

                                <span style={{alignContent:"center", justifyContent:"center", }}>
                                    Strona {Math.max(1, page)}
                                </span>

                                {page < totalPages && (
                                    <button className="back-button" onClick={() => setPage(page + 1)}>
                                        &#10095;
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "users" && (
                        <>
                            <div className="admin-actions">
                                <button
                                    className="create-button"
                                    onClick={() => router.push("/admin/tables/create/users")}
                                >
                                    Dodaj użytkownika
                                </button>
                            </div>

                            <UsersTable
                                users={data as UserItem[]}
                                loadData={() => loadData("users")}
                            />

                            <div className="pagination" 
                                style={{
                                    display:"flex", 
                                    flexDirection:"row", 
                                    alignContent:"center", 
                                    justifyContent:"center", 
                                    paddingTop:"10px",
                                    paddingBottom:"20px",
                                    color:"var(--dark-purple)"
                                    }}
                                >
                                {page > 1 && (
                                    <button className="back-button" onClick={() => setPage(page - 1)}>
                                        &#10094;
                                    </button>
                                )}

                                <span style={{alignContent:"center", justifyContent:"center", }}>
                                    Strona {Math.max(1, page)}
                                </span>

                                {page < totalPages && (
                                    <button className="back-button" onClick={() => setPage(page + 1)}>
                                        &#10095;
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </main>
        </ProtectedRoute>
    );
}