"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import BackButton from "@/components/BackButton";

import "./change-password.css";

export default function PasswordChangePage() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (newPassword !== confirmPassword) {
            setErrorMessage("Nowe hasła nie są takie same");
            return;
        }

        const response = await apiFetch("/users/me/password", {
            method: "PATCH",
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        });

        if (!response.ok) {
            setErrorMessage("Nie udało się zmienić hasła");
            return;
        }

        await apiFetch("/auth/logout-all", {
            method: "POST",
        });

        localStorage.removeItem("accessToken");
        router.replace("/");
    }

    return (
        <>
        <BackButton />
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
        </>
    );
}