"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { AuthorItem, CategoryItem } from "@/lib/typeTable";

import "@/styles/sidebar.css";

type SideBarProps = {
    isSideBarOpen: boolean;
    setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

async function getAuthors() {
    const response = await apiFetch("/authors");

    if (!response.ok) {
        throw new Error("Nie udało się pobrać autorów");
    }

    const data = await response.json();
    return data.items ?? [];
}

async function getCategories() {
  const response = await apiFetch("/categories");

  if (!response.ok) {
    throw new Error("Nie udało się pobrać kategorii");
  }

  const data = await response.json();
  return data.items ?? [];
}

export default function SideBar({
    isSideBarOpen,
    setIsSideBarOpen,
}: SideBarProps) {

    const [authorsOpen, setAuthorsOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: authors = [] } = useQuery<AuthorItem[]>({
        queryKey: ["authors"],
        queryFn: getAuthors,
        staleTime: 1000 * 60 * 5,
    });

    const { data: categories = [] } = useQuery<CategoryItem[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 1000 * 60 * 5,
    });

    const selectedAvailable = searchParams.get("available");


    function setFilter(name: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        router.push(`/books?${params.toString()}`);
    }

    function clearFilters() {
        router.push("/books");
    }

    return (
        <aside className={`sidebar-main ${
        isSideBarOpen ? "open" : "closed"
    }`}>
            <div className="sidebar-top">
                <Link href="/profile" className="profile-btn">
                    <img className="profile-icon"
                        src="/user-profile.svg"
                        alt="Profil użytkownika"
                    />
                </Link>

                <button
                    className="close-sidebar-btn"
                    onClick={() => setIsSideBarOpen(false)}
                >
                    &#10094;
                </button>
            </div>
            <div className="books-sidebar">
                <button className="clear-filters-btn" onClick={clearFilters}>
                    Wyczyść filtry
                </button>
                <Link href="/books">
                    <h2 className="btn-sidebar">KSIĄŻKI</h2>
                </Link>
                <button className="sidebar-title" onClick={() => setAuthorsOpen(!authorsOpen)}>
                    <h3>AUTOR {authorsOpen}</h3>
                </button>

                {authorsOpen && (
                    <ul className="sidebar-list">
                        {authors.map((author) => (
                            <li
                                key={author.id}
                                onClick={() => setFilter("authorId", author.id)}
                            >
                                {author.firstName} {author.lastName}
                            </li>
                        ))}
                    </ul>
                )}

                <button className="sidebar-title" onClick={() => setCategoriesOpen(!categoriesOpen)}>
                    <h3>KATEGORIA {categoriesOpen}</h3>
                </button>

                {categoriesOpen && (
                    <ul className="sidebar-list">
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                onClick={() => setFilter("authorId", category.id)}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                )}

            </div>
            <div className="access-sidebar">
                <h2 className="btn-sidebar">DOSTĘPNOŚĆ</h2>
                
                <label className="switch">
                    <input type="checkbox" 
                        checked={selectedAvailable === "true"}
                        onChange={(event) => setFilter("available", event.target.checked ? "true" : "")}
                    />
                    <span className="slider" />
                    <span className="label-text">
                        <h3>POKAŻ TYLKO DOSTĘPNE</h3>
                    </span>
                </label>
                
                <label className="switch">
                    <input type="checkbox" 
                        checked={selectedAvailable === "false"}
                        onChange={(event) => setFilter("available", event.target.checked ? "false" : "")}
                    />
                    <span className="slider" />
                    <span className="label-text">
                        <h3>POKAŻ TYLKO NIEDOSTĘPNE</h3>
                    </span>
                </label>
            </div>
        </aside>
    )
}