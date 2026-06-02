"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import "./welcome/welcome_page.css";
import LoadingScreen from "@/components/LoadingScreen";

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  function goToPage(path: string) {
    setIsLoading(true);

    setTimeout(() => {
      router.push(path);
    }, 1200);
  }

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <main>
      <div className="moon_image img"/>
      
      <div className="title" style={{margin:"3px auto", textAlign:"center", color:"var(--welcome-dark-purple)"}}>
        <h1 style={{fontSize:"60px", fontWeight:"bold"}}>Witamy w MoonBook!</h1>
      </div>
      <div className="message" style={{textAlign:"center", color:"var(--welcome-light-purple)", margin:"40px"}}>
        <p style={{fontSize:"20px", fontWeight:"medium"}}>Pomogę Ci znaleźć to, czego szukasz... nawet jeśli jest to gdzieś na księżycu &#x1F319;</p>
      </div>
      <div className="button-container flex" style={{alignItems:"center", flexDirection:"column", gap:"25px", marginBottom:"5px"}}>
        
        <button className="admin" 
          onClick={() => goToPage("/admin")}
          style={{color:"var(--white)", fontSize:"20px", backgroundColor:"var(--light-purple)"}}>
          <h3>Dla admina</h3>
        </button>

        <button className="register" 
          onClick={() => goToPage("/register")}
          style={{color:"var(--white)", fontSize:"20px", backgroundColor:"var(--light-purple)"}}>
          <h3>Rejestracja</h3>
        </button>

        <button className="login" 
          onClick={() => goToPage("/login")}
          style={{color:"var(--white)", fontSize:"20px", backgroundColor:"var(--light-purple)"}}>
          <h3>Zaloguj się</h3>
        </button>

      </div>
    </main>
  );
}