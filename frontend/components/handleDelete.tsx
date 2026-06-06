export async function handleDelete(
    id: string,
    type: "books" | "authors" | "categories",
    setMessage: (message: string) => void,
    loadData: () => void
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
        setMessage("Błąd usuwania");
        return;
    }

    setMessage("Usunięto");

    await loadData(); // odświeża tabelę
}