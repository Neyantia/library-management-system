"use client";

import { useEffect, useState } from "react";
import type { AuthorItem, CategoryItem } from "@/lib/typeTable";
import "@/app/admin/tables/create/create-admin-form.css";

type FormType = "book" | "author" | "category" | "user";

type Props = {
    type: FormType;
};

export default function CreateAdminForm({ type }: Props) {
    const [message, setMessage] = useState("");
    const [authors, setAuthors] = useState<AuthorItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        isbn: "",
        language: "",
        publicationYear: "",
        copiesCount: "",
        coverImageUrl: "",
        authorId: "",
        categoryId: "",

        firstName: "",
        lastName: "",

        name: "",
        description: "",

        email: "",
        password: "",
    });

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

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
                console.error("Błąd pobierania autorów lub kategorii");
                return;
            }

            const authorsData = await authorsResponse.json();
            const categoriesData = await categoriesResponse.json();

            setAuthors(authorsData.items ?? authorsData);
            setCategories(categoriesData.items ?? categoriesData);
        }

        loadSelectData();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const token = localStorage.getItem("accessToken");

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
                coverImageUrl: formData.coverImageUrl,
                categoryId: formData.categoryId,
                authorIds: [formData.authorId],
                copiesCount: Number(formData.copiesCount),
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

        const isValidImage =
            /\.(jpg|jpeg|png|webp|gif)$/i.test(formData.coverImageUrl);

        if (!isValidImage) {
            setMessage("Podaj bezpośredni link do obrazka");
            return;
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
            const error = await response.text();
            console.log("Błąd dodawania:", error);
            setMessage("Błąd dodawania");
            return;
        }

        setMessage("Dodano poprawnie");
    }

    return (
        
        <form className="create-form" onSubmit={handleSubmit}>
            <h3
                style={{
                    color: "var(--dark-purple)",
                    fontSize: "20px",
                    textAlign: "center",
                }}
            >
                <strong>Dodaj pozycję</strong>
            </h3>

            {type === "book" && (
                <>
                    <input
                        name="title"
                        placeholder="Tytuł książki"
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <input
                        name="subtitle"
                        placeholder="Podtytuł"
                        value={formData.subtitle}
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

                    <select
                        name="authorId"
                        value={formData.authorId}
                        onChange={handleChange}
                    >
                        <option value="">Wybierz autora</option>

                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.firstName} {author.lastName}
                            </option>
                        ))}
                    </select>

                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                    >
                        <option value="">Wybierz kategorię</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

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

            <>
        {message && <p style={{color:"var(--T-dark-red)", fontSize:"20px"}}>
            <strong>{message}</strong>
        </p>}
            <button type="submit">Dodaj</button>
        </>
        </form>
       
    );
}