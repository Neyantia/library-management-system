"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setIsChecking(false);
                router.replace("/");
                return;
            }

            const response = await apiFetch("/auth/me");

            if (!response.ok) {
                localStorage.removeItem("accessToken");
                setIsChecking(false);
                router.replace("/");
                return;
            }

            setIsAllowed(true);
            setIsChecking(false);
        }

        checkAuth();
    }, [router]);

    if (isChecking) {
        return <p color="var(--dark-purple)">Sprawdzanie logowania...</p>;
    }

    if (!isAllowed) {
        return null;
    }

    return <>{children}</>;
}