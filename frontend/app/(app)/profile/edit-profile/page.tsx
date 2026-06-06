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
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [message, setMessage] = useState("");
    const [showNameEdit, setShowNameEdit] = useState(false);

    const [showHistory, setShowHistory] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [showAdultContent, setShowAdultContent] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const response = await apiFetch("/users/me");

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setFirstName(data.firstName ?? "");
            setLastName(data.lastName ?? "");
            setEmail(data.email ?? "");

            const savedBio = localStorage.getItem("profileBio");
            setBio(savedBio ?? "");
            }
        loadProfile();
    }, []);

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        localStorage.setItem("profileBio", bio);
        
        const response = await apiFetch("/users/me", {
            method: "PATCH",
            body: JSON.stringify({
                firstName,
                lastName,
            }),
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.log("Błąd edycji profilu:", error);
            return;
        }
        
        setMessage("Dane profilu zostały zmienione.");

        router.push("/profile");
    }

    return (
        <>
        <BackButton />
        <main className="profile-page edit-profile-page">
            <form onSubmit={saveProfile}>
                <section className="profile-header">
                    <h1>{firstName || "Użytkownik"} {lastName}</h1>
                    <h2>{email}</h2>

                    <div className="avatar loading-moon img"></div>

                    <div className="edit-profile-actions">
                        <button type="button"
                            style={{backgroundColor: "var(--light-purple)", color: "var(--white)", padding: "5px"}} 
                        >
                            WYBIERZ ZDJĘCIE
                        </button>   
                    

                        <button type="button"
                            style={{backgroundColor: "var(--light-purple)", color: "var(--white)", padding: "5px"}} 
                            onClick={() => setShowNameEdit((prev) => !prev)}
                        >
                            {showNameEdit ? "UKRYJ EDYCJĘ" : "EDYTUJ NAZWĘ"}
                        </button>
                    </div>

                    {showNameEdit && (
                        <>
                            <input className="profile-name-input"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Nazwa użytkownika"
                            />
                            <input className="profile-name-input"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Nazwisko użytkownika"
                            />
                        </>
                    )}
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
                {message && <p>{message}</p>}
            </form>
        </main>
        </>
    );
}