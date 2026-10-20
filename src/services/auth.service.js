import { request } from "./api";
import { guardarToken, limpiarToken, obtenerToken } from "./tokenStorage";

export async function registrar({ nombre, email, password, rol }) {
    return request("/auth/registro", {
        method: "POST",
        body: { nombre, email, password, rol }
    });
}

export async function login({ email, password }) {
    const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
    })
    if (!data?.token)
        throw new Error("EL servidor no devolvio un token");
    await guardarToken(data.token);
    return data.token;
}
export async function getUser() {
    const token = await obtenerToken();
    if (!token) return null;
    try {
        const base64 = token.split('.')[1];
        const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
    } catch {
        return null;
    }
}
export async function logout() {
    await limpiarToken();
}