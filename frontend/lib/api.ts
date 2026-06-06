export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    let token = localStorage.getItem("accessToken");

    let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        }
    );

    if (response.status === 401) {
            const refreshResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (!refreshResponse.ok) {
            localStorage.removeItem("accessToken");

            window.location.href = "/login";

            throw new Error("Session expired");
        }

        const refreshData =
        await refreshResponse.json();

        localStorage.setItem(
            "accessToken",
            refreshData.accessToken
        );

        token = refreshData.accessToken;

        response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...(options.headers || {}),
                },
            }
        );
    }

    return response;
}