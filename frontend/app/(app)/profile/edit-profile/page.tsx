"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { apiFetch } from "@/lib/api";

import "../profile.css";
import "./edit-profile.css";

export default function EditProfilePage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [bio, setBio] = useState("");

    const [showHistory, setShowHistory] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [showAdultContent, setShowAdultContent] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const response = await apiFetch("/users/me");

            const data = await response.json();

            setFirstName(data.firstName ?? "");
            setBio(data.bio ?? "");
        }

        loadProfile();
    }, []);

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        const response = await apiFetch("/users/me", {
            method: "PATCH",
            body: JSON.stringify({
                firstName,
                bio,
                showHistory,
                showActivity,
                showAdultContent,
            }),
        });
        

        if (!response.ok) {
            alert("Błąd edycji profilu");
            return;
        }

        router.push("/profile");
    }

    return (
        <>
        <BackButton />
        <main className="profile-page edit-profile-page">
            <form onSubmit={saveProfile}>
                <section className="profile-header">
                    <h1>{firstName || "NUNU"}</h1>

                    <div className="avatar loading-moon img"></div>

                    <div className="edit-profile-actions">
                        <button type="button"
                            style={{backgroundColor: "var(--light-purple)", color: "var(--white)", padding: "5px"}}    
                        >
                            WYBIERZ ZDJĘCIE
                        </button>

                        <button type="button"
                            style={{backgroundColor: "var(--light-purple)", color: "var(--white)", padding: "5px"}} 
                        >
                            EDYTUJ NAZWĘ
                        </button>
                    </div>

                    <input
                        className="profile-name-input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Nazwa użytkownika"
                    />
                </section>

                <section className="profile-description">
                    <h2>Opis</h2>

                    <textarea
                        className="profile-bio-input"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Wpisz opis profilu..."
                    />

                    <button type="button" className="edit-description-btn"
                        style={{backgroundColor: "var(--light-purple)", color: "var(--white)", padding: "5px"}} 
                    >
                        EDYTUJ OPIS
                    </button>
                </section>

                <section className="profile-settings">
                    <label>
                        <input type="checkbox" 
                        checked={showHistory}
                        onChange={(event) => setShowHistory(event.target.checked)}
                        />
                        <span className="slider slider-edit" />
                        <span className="label-text">
                            <h3 style={{fontSize: "20px"}}>Pokazuj historię przeglądania</h3>
                        </span>
                    </label>

                    <label>
                        <input type="checkbox" 
                        checked={showActivity}
                        onChange={(event) => setShowActivity(event.target.checked)}
                        />
                        <span className="slider slider-edit" />
                        <span className="label-text">
                            <h3 style={{fontSize: "20px"}}>Pokazuj ostatnią aktywność</h3>
                        </span>
                    </label>

                    <label>
                        <input type="checkbox" 
                        checked={showAdultContent}
                        onChange={(event) => setShowAdultContent(event.target.checked)}
                        />
                        <span className="slider slider-edit" />
                        <span className="label-text">
                            <h3 style={{fontSize: "20px"}}>Pokazuj treści dla dorosłych</h3>
                        </span>
                    </label>
                </section>

                <div className="profile-edit-buttons">
                    <button type="submit">
                        ZAPISZ
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/profile")}
                    >
                        ANULUJ
                    </button>
                </div>
            </form>
        </main>
        </>
    );
}