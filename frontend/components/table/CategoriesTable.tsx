"use client";

import { useState } from "react";
import Image from "next/image";
import type { CategoryItem } from "@/lib/typeTable";
import { handleDelete } from "../handleDelete";

import "@/app/admin/tables/admin.css";

export default function CategoriesTable({
    categories,
}: {
    categories: CategoryItem[];
}) {
    
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    function startEdit(category: CategoryItem) {
        setEditingId(category.id);

        setEditName(category.name);
        setEditDescription(category.description);
    }

    async function saveEdit(id: string) {
        const token =
            localStorage.getItem("accessToken");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                }),
            }
        );

        if (!response.ok) {
            alert("Błąd edycji kategorii");
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
                    <th>Nazwa kategorii</th>
                    <th>Opis</th>
                    <th> </th>
                </tr>
            </thead>

            <tbody>
                {categories.map((category) => (
                    <tr key={category.id}>
                        <td>
                            {editingId === category.id ? (
                                <input
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(
                                        event.target.value
                                        )
                                    }
                                />
                            ) : (
                                category.name
                            )}
                        </td>

                        <td>
                            {editingId === category.id ? (
                                <input
                                    value={editDescription}
                                    onChange={(event) =>
                                        setEditDescription(
                                        event.target.value
                                        )
                                    }
                                />
                            ) : (
                                category.description
                            )}
                        </td>
                        
                        <td className="actions-btn-admin">
                            {editingId === category.id ? (
                                <button
                                    className="save-button"
                                    onClick={() =>
                                        saveEdit(category.id)
                                    }
                                >
                                    Zapisz
                                </button>
                            ) : (
                                <button className="edit-button"
                                    onClick={() => startEdit(category)}
                                >
                                    <Image src="/pen_icon.svg"
                                        alt="Edytuj"
                                        width={20}
                                        height={20} 
                                    />

                                </button>
                            )}

                            <button className="delete-button"
                                onClick={() => handleDelete(category.id, "categories")}
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