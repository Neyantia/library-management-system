export async function handleDelete(
    id: string,
    type: "books" | "authors" | "categories"
) {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${type}/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        alert("Błąd usuwania");
        return;
    }

    alert("Usunięto");

    window.location.reload();
}