"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./password.css";

export default function PasswordChangePage() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
        setErrorMessage("Nowe hasła nie są takie same");
        return;
        }

        const token = localStorage.getItem("accessToken");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/me/password`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        }
        );

        if (!response.ok) {
            setErrorMessage("Nie udało się zmienić hasła");
            return;
        }

        router.push("/profile");
    }

    return (
        <main className="container-password">
        <form className="password-change" onSubmit={handleSubmit}>
            <div>
            <label>
                <h2>Wpisz stare hasło:</h2>
            </label>
            <input
                className="input-form"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
            />
            </div>

            <div>
            <label>
                <h2>Wpisz nowe hasło:</h2>
            </label>
            <input
                className="input-form"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
            />
            </div>

            <div>
            <label>
                <h2>Potwierdź nowe hasło:</h2>
            </label>
            <input
                className="input-form"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
            />
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="container-login-bnt">
            <button className="login-bnt" type="submit">
                <h3>Zapisz</h3>
            </button>
            </div>
        </form>
        </main>
    );
}