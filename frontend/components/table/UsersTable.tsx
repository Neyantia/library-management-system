"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { UserItem } from "@/lib/typeTable";

import "@/app/admin/tables/admin.css";

export default function UsersTable({
    users,
    loadData,
}: {
    users: UserItem[];
    loadData: () => void | Promise<void>;
}) {

    const router = useRouter();
    const [message, setMessage] = useState("");
    
    async function changeStatus(id: string, isActive: boolean) {    
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isActive: !isActive,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.log("Błąd zmiany statusu:", error);
            setMessage("Błąd zmiany statusu");
            return;
        }
        setMessage("Zapisano zmiany");
        await loadData();
    }


    function handleEdit(id: string) {
        router.push(`/admin/tables/create/users/${id}`);
    }

    return (
        <>
        {message && <p style={{color:"var(--T-dark-red)", fontSize:"20px"}}>
            <strong>{message}</strong>
        </p>}
        <table className="admin-table">
            <thead>
                <tr>
                    <th>E-mail</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Rola</th>
                    <th>Status</th>
                    <th> </th>
                </tr>
            </thead>

            <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.role}</td>
                        <td>{user.isActive ? "Aktywny" : "Nieaktywny"}</td>
                        
                        <td className="actions-btn-admin">
                            <button
                                className="block-button"
                                onClick={() => changeStatus(user.id, user.isActive)}
                                >
                                {user.isActive ? "Zablokuj" : "Odblokuj"}
                            </button>
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        </>
    );
}