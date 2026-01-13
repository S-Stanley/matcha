const API_URL = "http://127.0.0.1:5000";

export async function createUser(form) {
    const payload = {
        email: form.email?.trim() || "",
        password: form.password || "",
        username: form.username?.trim() || "",
        firstname: form.firstname?.trim() || "",
        lastname: form.lastname?.trim() || "",
    };

    const response = await fetch("http://127.0.0.1:5000/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload),
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || "Erreur serveur");
    }

    return true;
}
