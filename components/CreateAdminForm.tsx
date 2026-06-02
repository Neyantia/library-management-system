"use client";

import { useState } from "react";
import "@/app/admin/tables/create/create-admin-form.css";

type FormType = "book" | "author" | "category" | "user";

type Props = {
    type: FormType;
};

export default function CreateAdminForm({
    type,
}: Props) {
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        isbn: "",
        language: "",
        publicationYear: "",
        copiesCount: "",
        availableCopiesCount: "",
        coverImageUrl: "",

        firstName: "",
        lastName: "",

        name: "",
        description: "",

        email: "",
        password: "",
    });

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token =
        localStorage.getItem("accessToken");

        const endpoint =
        type === "book"
            ? "/books"
            : type === "author"
            ? "/authors"
            : type === "category"
            ? "/categories"
            : "/users";

        let body = {};

        if (type === "book") {
            body = {
                title: formData.title,
                subtitle: formData.subtitle,
                isbn: formData.isbn,
                language: formData.language,
                publicationYear: Number(formData.publicationYear),
                description: formData.description,
                copiesCount: Number(formData.copiesCount),
                availableCopiesCount: Number(
                    formData.availableCopiesCount
                ),
                coverImageUrl: formData.coverImageUrl,
            };
        }

        if (type === "author") {
            body = {
                firstName: formData.firstName,
                lastName: formData.lastName,
            };
        }

        if (type === "category") {
            body = {
                name: formData.name,
                description: formData.description,
            };
        }

        if (type === "user") {
            body = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            };
        }

        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            alert("Błąd dodawania");
            return;
        }

        alert("Dodano poprawnie");
    }

    return (
        <form className="create-form" onSubmit={handleSubmit}>
            <h3>Dodaj pozycję</h3>
        {type === "book" && (
            <>
            <input
                name="title"
                placeholder="Tytuł książki"
                value={formData.title}
                onChange={handleChange}
            />

            <input
                name="isbn"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={handleChange}
            />

            <input
                name="publicationYear"
                placeholder="Rok wydania"
                value={formData.publicationYear}
                onChange={handleChange}
            />
            <input
                name="subtitle"
                placeholder="Podtytuł"
                value={formData.subtitle}
                onChange={handleChange}
            />

            <input
                name="language"
                placeholder="Język"
                value={formData.language}
                onChange={handleChange}
            />

            <input
                name="description"
                placeholder="Opis"
                value={formData.description}
                onChange={handleChange}
            />

            <input
                name="copiesCount"
                placeholder="Liczba kopii"
                value={formData.copiesCount}
                onChange={handleChange}
            />

            <input
                name="availableCopiesCount"
                placeholder="Dostępne kopie"
                value={formData.availableCopiesCount}
                onChange={handleChange}
            />

            <input
                name="coverImageUrl"
                placeholder="URL okładki"
                value={formData.coverImageUrl}
                onChange={handleChange}
            />
            </>
        )}

        {type === "author" && (
            <>
            <input
                name="firstName"
                placeholder="Imię"
                value={formData.firstName}
                onChange={handleChange}
            />

            <input
                name="lastName"
                placeholder="Nazwisko"
                value={formData.lastName}
                onChange={handleChange}
            />
            </>
        )}

        {type === "category" && (
            <>
            <input
                name="name"
                placeholder="Nazwa kategorii"
                value={formData.name}
                onChange={handleChange}
            />

            <input
                name="description"
                placeholder="Opis"
                value={formData.description}
                onChange={handleChange}
            />
            </>
        )}

        {type === "user" && (
            <>
            <input
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
            />

            <input
                name="password"
                placeholder="Hasło"
                value={formData.password}
                onChange={handleChange}
            />

            <input
                name="firstName"
                placeholder="Imię"
                value={formData.firstName}
                onChange={handleChange}
            />

            <input
                name="lastName"
                placeholder="Nazwisko"
                value={formData.lastName}
                onChange={handleChange}
            />
            </>
        )}

        <button type="submit">
            Dodaj
        </button>
        </form>
    );
}