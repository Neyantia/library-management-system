"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import "./admin.css";
import BooksTable from "@/components/table/BooksTable";
import AuthorsTable from "@/components/table/AuthorsTable";
import CategoriesTable from "@/components/table/CategoriesTable";
import UsersTable from "@/components/table/UsersTable";
import NavBar from "@/components/NavBar";
import type { 
    BookItem, 
    AuthorItem, 
    CategoryItem, 
    UserItem 
} from "@/lib/typeTable";

type AdminTables = BookItem[] | AuthorItem[] | CategoryItem[] | UserItem[];

type Tab = "books" | "authors" | "categories" | "users";

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("books");
    const [data, setData] = useState<AdminTables>([]);

    async function loadData(tab: Tab) {
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
        const token = localStorage.getItem("accessToken");
        console.log("TOKEN:", token);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) {
            console.error("Błąd pobierania danych");
            return;
        }
        const result = await response.json();
        console.log("TAB:", tab);
        console.log("ENDPOINT:", endpoint);
        console.log("RESULT:", result);
        console.log("ITEMS:", result.items);

        if (Array.isArray(result)) {
            setData(result);
        } else {
            setData(result.items ?? []);
        }
    }

    useEffect(() => {
        loadData(activeTab);
    }, [activeTab]);

        
    return (
        <>
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
                <h1 className="admin-title">{activeTab === "books" && "Zarządzanie książkami"}
                    {activeTab === "authors" && "Zarządzanie autorami"}
                    {activeTab === "categories" && "Zarządzanie kategoriami"}
                    {activeTab === "users" && "Zarządzanie użytkownikami"}
                </h1>

                {activeTab === "books" && (
                    <>
                        <div className="admin-actions">
                            <button className="create-button"
                                onClick={() => router.push("/admin/tables/create/books")}
                            >
                                Dodaj książkę
                            </button>
                        </div>
    
                        <BooksTable books={data as BookItem[]} />
                    </>
                )}
                {activeTab === "authors" && (
                    <>
                        <div className="admin-actions">
                            <button className="create-button"
                                onClick={() => router.push("/admin/tables/create/authors")}
                            >
                                Dodaj autora
                            </button>
                        </div>
    
                        <AuthorsTable authors={data as AuthorItem[]} />
                    </>
                )}
                {activeTab === "categories" && (
                    <>
                        <div className="admin-actions">
                            <button className="create-button"
                                onClick={() => router.push("/admin/tables/create/categories")}
                            >
                                Dodaj kategorię
                            </button>
                        </div>
    
                        <CategoriesTable categories={data as CategoryItem[]} />
                    </>
                )}
                
                {activeTab === "users" && (
                    <>
                        <div className="admin-actions">
                            <button className="create-button"
                                onClick={() => router.push("/admin/tables/create/users")}
                            >
                                Dodaj użytkownika
                            </button>
                        </div>
    
                        <UsersTable users={data as UserItem[]} loadData={() => loadData("users")} />
                    </>
                )}
            </section>

        </main>
        </>
    )
}