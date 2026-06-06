"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { BookItem, AuthorItem, CategoryItem } from "@/lib/typeTable";
import { handleDelete } from "../handleDelete";

import "@/app/admin/tables/create/create-admin-form.css";
import "@/app/admin/tables/admin.css";

type BooksTableProps = {
    books: BookItem[];
    loadData?: () => void | Promise<void>;
};

export default function BooksTable({ books, loadData }: BooksTableProps) {
    const [message, setMessage] = useState("");
    const [authorsList, setAuthorsList] = useState<AuthorItem[]>([]);
    const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editAuthorsId, setEditAuthorsId] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editISBN, setEditISBN] = useState("");
    const [editPublicationYear, setEditPublicationYear] = useState("");
    const [editCopiesCount, setEditCopiesCount] = useState("");
    const [editAvailableCopiesCount, setEditAvailableCopiesCount] = useState("");

    useEffect(() => {
    async function loadSelectData() {
        const token = localStorage.getItem("accessToken");

        const authorsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/authors`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const categoriesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!authorsResponse.ok || !categoriesResponse.ok) {
            console.error("Błąd pobierania");
            return;
        }

        const authorsData = await authorsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setAuthorsList(Array.isArray(authorsData) ? authorsData : authorsData.items ?? []);
        setCategoriesList(Array.isArray(categoriesData) ? categoriesData : categoriesData.items ?? []);
    }

    loadSelectData();
}, []);

    function startEdit(book: BookItem) {
        setEditingId(book.id);
        setEditTitle(book.title);
        setEditAuthorsId(book.authors?.[0]?.id ?? "");
        setEditCategoryId(book.category?.id ?? "");
        setEditISBN(book.isbn);
        setEditPublicationYear(String(book.publicationYear));
        setEditCopiesCount(String(book.copiesCount));
        setEditAvailableCopiesCount(String(book.availableCopiesCount));
    }

    function cancelEdit() {
        setEditingId(null);
    }

async function saveEdit(id: string) {
    const token = localStorage.getItem("accessToken");

    const bookResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: editTitle,
                authorIds: editAuthorsId ? [editAuthorsId] : [],
                categoryId: editCategoryId,
                isbn: editISBN,
                publicationYear: Number(editPublicationYear),
            }),
        }
    );

    if (!bookResponse.ok) {
        console.log("BOOK ERROR:", await bookResponse.text());
        setMessage("Błąd edycji książki");
        return;
    }

    if (editCopiesCount) {
                    console.log("WYSYŁAM COPIES:", Number(editCopiesCount));
        const copiesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/books/${id}/copies`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    copies: Number(editCopiesCount),
                }),
            }
        );

        if (!copiesResponse.ok) {
            console.log("COPIES ERROR:", await copiesResponse.text());
            setMessage("Błąd edycji książki");
            return;
        }
    }
    setMessage("Zapisano zmiany");
    setEditingId(null);

    if (loadData) {
        await loadData();
    }

}

    return (
        <>
        {message && <p style={{color:"var(--T-dark-red)", fontSize:"20px"}}>
            <strong>{message}</strong>
        </p>}
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Tytuł</th>
                    <th>Autorzy</th>
                    <th>Kategoria</th>
                    <th>ISBN</th>
                    <th>Rok</th>
                    <th>Egzemplarze</th>
                    <th>Dostępne</th>
                    <th> </th>
                </tr>
            </thead>

            <tbody>
                {books.map((book) => (
                    <tr key={book.id}>
                        <td>
                            {editingId === book.id ? (
                                <input className="table-edit-input"
                                    value={editTitle}
                                    onChange={(event) => setEditTitle(event.target.value)}
                                />
                            ) : (
                                book.title
                            )}
                        </td>

                        <td>
                            {editingId === book.id ? (
                                <select className="table-edit-input"
                                    value={editAuthorsId}
                                    onChange={(event) => setEditAuthorsId(event.target.value)}
                                >
                                {authorsList.map((author) => (
                                    <option
                                        key={author.id}
                                        value={author.id}
                                    >
                                        {author.firstName} {author.lastName}
                                    </option>
                                ))}
                                </select>
                            ) : (
                                book.authors
                                ?.map(
                                    (author) => `${author.firstName} ${author.lastName}`
                                )
                                .join(", ")
                            )}
                        </td>
                        
                        <td>
                            {editingId === book.id ? (
                                <select className="table-edit-input"
                                value={editCategoryId}
                                onChange={(event) =>
                                    setEditCategoryId(event.target.value)
                                }
                                >
                                {categoriesList.map((category) => (
                                    <option
                                    key={category.id}
                                    value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                                </select>
                            ) : (
                                book.category?.name
                            )}
                        </td>
                        
                        <td>
                            {editingId === book.id ? (
                                <input className="table-edit-input"
                                    value={editISBN}
                                    onChange={(event) => setEditISBN(event.target.value)}
                                />
                            ) : (
                                book.isbn
                            )}
                        </td>

                        <td>
                            {editingId === book.id ? (
                                <input className="table-edit-input"
                                    value={editPublicationYear}
                                    onChange={(event) => setEditPublicationYear(event.target.value)}
                                />
                            ) : (
                                book.publicationYear
                            )}
                        </td>

                        <td>
                            {editingId === book.id ? (
                                <input
                                    className="table-edit-input"
                                    value={editCopiesCount}
                                    onChange={(event) => setEditCopiesCount(event.target.value)}
                                    placeholder="Liczba kopii"
                                    type="number"
                                />
                            ) : (
                                book.copiesCount
                            )}
                        </td>

                        <td>
                            {book.availableCopiesCount}
                        </td>

                        <td className="actions-btn-admin">
                            {editingId === book.id ? (
                            <>
                                <button
                                    className="save-button"
                                    type="button"
                                    onClick={() => saveEdit(book.id)}
                                >
                                    Zapisz
                                </button>
                                <button
                                    className="cancel-button"
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                >
                                    Anuluj
                                </button>
                            </>
                            ) : (
                                <>
                                <button className="edit-button"
                                    type="button"
                                    onClick={() => startEdit(book)}
                                >
                                    <Image src="/pen_icon.svg"
                                        alt="Edytuj"
                                        width={20}
                                        height={20} 
                                    />

                                </button>
                
                            <button className="delete-button"
                                type="button"
                                onClick={() => handleDelete(
                                    book.id, 
                                    "books", 
                                    setMessage, 
                                    async () => {
                                        if (loadData) {
                                            await loadData();
                                        }
                                })}
                            >
                                <Image src="/trash_icon.svg"
                                    alt="Usuń"
                                    width={20}
                                    height={20} 
                                />
                            </button>
                            </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        </>
    );
}