"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.replace("/login");
                return;
            }

            const response = await apiFetch("/auth/me");

            if (!response.ok) {
                localStorage.removeItem("accessToken");
                router.replace("/login");
                return;
            }

            setIsAllowed(true);
        }

        checkAuth();
    }, [router]);

    if (!isAllowed) { 
        return null;
    }

    return <>{children}</>;
}