"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

import "./login.css";
import "@/styles/loading_page.css";

type AuthFormProps = {
    type: "login" | "register" | "admin";
};

type AuthFormData = {
    email: string;
    password: string;
}

export default function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);

    const isRegister = type === "register";
    const isAdmin = type === "admin";

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<AuthFormData>();

    async function onSubmit(formData: AuthFormData) {

        const endpoint = isRegister ? "/auth/register" : "/auth/login";

        const response = await apiFetch(endpoint, {
            method: "POST", 
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {

            if (isRegister) {
                setError("root", {
                    message: 
                    data.details?.[0] ==="password is not strong enough"
                    ? "Hasło jest za słabe"
                    : "Błąd rejestracji",
                });
            } else {
                const backendMessage = data.message || data.details?.[0] || "";

                setError("root", {
                    message:
                        backendMessage.includes("User not found") ||
                        backendMessage.includes("user not found") ||
                        backendMessage.includes("not found")
                        ? "Konto nie istnieje, zarejestruj się"
                        : "Błędny e-mail lub hasło",
                    });
                }
                       
            return;
        }

        localStorage.setItem("accessToken", data.accessToken);

        if (isAdmin) {
            const meResponse = await apiFetch("/auth/me");
        
            const me = await meResponse.json();

            if (!meResponse.ok || me.role !== "ADMIN") {
                localStorage.removeItem("accessToken");

                setError("root", {
                    message: "To konto nie ma uprawnień administratora"
                });
                return;
            }
            setShowLoadingScreen(true);
            setTimeout(() => router.push("/admin/tables"), 1000);
            return;
        }
        setShowLoadingScreen(true);
        setTimeout(() => router.push("/main"), 1000);
    }

    if (showLoadingScreen) {
        return <LoadingScreen />;
    }

    return (
        <main>
            <div className="moon_image img"/>

            <div className="container-login" 
                style={{display:"block", alignItems:"center", textAlign:"center"}}
            >
                <form className="login" id="loginForm" onSubmit={handleSubmit(onSubmit)}>
                        <div className="wrap-input" style={{marginTop:"30px", marginBottom:"30px"}}>
                            <label htmlFor="email">
                                <h2>E-mail</h2>
                            </label>
                            <input className="input-form" 
                                id="email" 
                                type="email"
                                placeholder="Wpisz swoją nazwę..." 
                                {...register("email", {
                                    required: "E-mail jest wymagany",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Wpisz poprawny adres e-mail",
                                    },
                                })}
                            />

                            {errors.email && (
                                <p className="error-message">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="wrap-input">
                            <label htmlFor="password">
                                <h2>Hasło</h2>
                            </label>
                            <input className="input-form" 
                                id="password" 
                                type="password"
                                placeholder="Wpisz swoją nazwę..." 
                                {...register("password", {
                                    required: "Hasło jest wymagane",
                                    minLength: isRegister
                                    ? {
                                        value: 8,
                                        message: "Hasło musi mieć minimum 8 znaków",
                                    }
                                    : undefined,
                                })}
                            />

                            <div className="error-container">
                                {errors.password && (
                                    <p className="error-message">
                                        {errors.password.message}
                                    </p>
                                )}

                                {errors.root && (
                                    <p className="error-message">
                                        {errors.root.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="container-login-bnt" style={{marginTop:"20px"}}>
                            <button 
                                className="login-bnt" 
                                type="submit"
                                disabled={isSubmitting}
                                style={{color:"var(--white)", fontSize:"20px", fontWeight:"bold", backgroundColor:"var(--light-purple)"}}
                            >
                                <h3>{isSubmitting ? "Sprawdzanie..." : "Dalej"}</h3>
                            </button>
                        </div>
                        
                        <div className="container-login-bnt" style={{marginTop:"20px"}}>
                            <Link href="/">
                                <button 
                                    className="back-bnt" 
                                    type="button" 
                                    style={{color:"var(--white)", fontSize:"20px", fontWeight:"bold", backgroundColor:"var(--button-grey)"}}
                                >
                                    <h3>Wróć</h3>
                                </button>
                            </Link>
                        </div>
                </form>
            </div>
        </main>
    );
}