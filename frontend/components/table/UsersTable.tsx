"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { UserItem } from "@/lib/typeTable";

import "@/app/admin/tables/admin.css";

export default function UsersTable({
    users,
    loadData,
}: {
    users: UserItem[];
    loadData: () => void;
}) {
    async function changeStatus(id: string, status: string) {
        const token = localStorage.getItem("accessToken");

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        loadData();
    }

    const router = useRouter();

    function handleEdit(id: string) {
        router.push(`/admin/tables/create/users/${id}`);
    }

    return (
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
                                onClick={() =>
                                    changeStatus(user.id, user.isActive ? "BLOCKED" : "ACTIVE")
                                }
                                >
                                {user.isActive ? "Zablokuj" : "Odblokuj"}
                            </button>
                            
                            <button className="edit-button"
                                onClick={() => handleEdit(user.id)}
                            >
                                <Image src="/pen_icon.svg"
                                    alt="Edytuj"
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