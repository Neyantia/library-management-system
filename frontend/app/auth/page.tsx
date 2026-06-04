"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import "../images.css";
import "./login.css";

type AuthFormProps = {
    type: "login" | "register"
};

export default function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const isLogin = type ==="login";

    async function handleSubmit(event:React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const endpoint = isLogin
            ? "http://localhost:3000/auth/login"
            : "http://localhost:3000/auth/register";

        const response = await fetch(endpoint, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, password}),
        });

        if (!response.ok) {
            alert(isLogin ? "Błędny e-mail lub hasło" : "Błąd rejestracji");
            return;
        }

        const data = await response.json();

        if (isLogin) {
            localStorage.setItem("accessToken", data.accessToken);
            alert("Zalogowano!");
            router.push("/main");
        } else {
            alert("Zarejestrowano!");
            router.push("/main");
        }
    }
  return (
    <main>
        <div className="moon_image img"/>

        <div className="container-login" style={{display:"block", alignItems:"center", textAlign:"center"}}>
            <form className="login" id="loginForm">
                <form action="/login" method="post">
                    <div className="wrap-input" style={{marginTop:"30px", marginBottom:"30px"}}>
                    <label id="email">
                        <h2>E-mail</h2>
                    </label>
                    <input className="input-form" 
                        type="email" 
                        placeholder="Wpisz swoją nazwę..." 
                        name="email" 
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required/>
                    </div>

                    <div className="wrap-input">
                    <label id="password">
                        <h2>Hasło</h2>
                    </label>
                    <input className="input-form" 
                        type="password" 
                        placeholder="Wpisz swoją nazwę..." 
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required/>
                    </div>

                    <div className="container-login-bnt" style={{marginTop:"60px"}}>
                        <Link href="/main">   
                            <button className="login-bnt" type="submit" style={{fontSize:"20px", backgroundColor:"var(--light-purple)"}}>
                                <h3>Dalej</h3>
                            </button>
                        </Link> 
                    </div>
                    <div className="container-login-bnt" style={{marginTop:"20px"}}>
                        <Link href="/welcome">
                            <button className="back-bnt" type="submit" style={{fontSize:"20px", backgroundColor:"var(--button-grey)"}}>
                                <h3>Wróć</h3>
                            </button>
                        </Link>
                    </div>
                </form>
            </form>
        </div>
    </main>
  );
}