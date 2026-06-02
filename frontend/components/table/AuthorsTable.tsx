"use client";

import { useState } from "react";
import Image from "next/image";
import type { AuthorItem } from "@/lib/typeTable";
import { handleDelete } from "../handleDelete";

import "@/app/admin/tables/admin.css";

export default function AuthorsTable({ 
    authors 
}: { 
    authors: AuthorItem[] 
}) {

    const [editingId, setEditingId] = useState<string | null>(null);

    const [editFirstName, setEditFirstName] = useState("");

    const [editLastName, setEditLastName] = useState("");

    function startEdit(author: AuthorItem) {
        setEditingId(author.id);

        setEditFirstName(author.firstName);
        setEditLastName(author.lastName);
    }

    async function saveEdit(id: string) {
        const token =
            localStorage.getItem("accessToken");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/authors/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    firstName: editFirstName,
                    lastName: editLastName,
                }),
            }
        );

        if (!response.ok) {
            alert("Błąd edycji autora");
            return;
        }

        alert("Zapisano zmiany");

        setEditingId(null);

        window.location.reload();
    }

    return (
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th> </th>
                </tr>
            </thead>

            <tbody>
                {authors.map((author) => (
                    <tr key={author.id}>
                        <td>
                            {editingId === author.id ? (
                                <input
                                    value={editFirstName}
                                    onChange={(event) =>
                                        setEditFirstName(
                                        event.target.value
                                        )
                                    }
                                />
                            ) : (
                                author.firstName
                            )}
                        </td>

                        <td>
                            {editingId === author.id ? (
                                <input
                                    value={editLastName}
                                    onChange={(event) =>
                                        setEditLastName(
                                        event.target.value
                                        )
                                    }
                                />
                            ) : (
                                author.lastName
                            )}
                        </td>
                        
                        <td className="actions-btn-admin">
                            {editingId === author.id ? (
                                <button
                                    className="save-button"
                                    onClick={() =>
                                        saveEdit(author.id)
                                    }
                                >
                                    Zapisz
                                </button>
                            ) : (
                                <button className="edit-button"
                                    onClick={() => startEdit(author)}
                                >
                                    <Image src="/pen_icon.svg"
                                        alt="Edytuj"
                                        width={20}
                                        height={20} 
                                    />

                                </button>
                            )}

                            <button className="delete-button"
                                onClick={() => handleDelete(author.id, "authors")}
                            >
                                <Image src="/trash_icon.svg"
                                    alt="Usuń"
                                    width={20}
                                    height={20} 
                                />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}