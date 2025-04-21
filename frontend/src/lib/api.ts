const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = async (path: string, options:RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    console.log('API Response:', res); // Log the response for debugging

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}