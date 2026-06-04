"use client"

import { useRouter } from "next/navigation";
import "../../globals.css";
import "./back-button.css";

export default function BackButton() {
    const router = useRouter();

    return (
        <button className="back-button" 
            onClick={() => router.back()}>
            &#10094;
        </button>
        
    );
}