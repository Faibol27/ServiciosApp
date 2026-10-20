import { API_URL, TIMEOUT_MS } from './config';
import { obtenerToken } from './tokenStorage';

export class ApiError extends Error {
    constructor(message, status = 0, data = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export async function request(path, { method = "GET", body, auth = false } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const token = auth ? await obtenerToken() : null;
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` })
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        })
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const message = data?.Error ?? data?.error ?? `Error ${response.status}`;
            throw new ApiError(message, response.status, data);
        }
        return data
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error?.name === "AbortError")
            throw new ApiError("El servidor tardo demasiado en responder", 0, null);
        throw new ApiError("No se pudo conectar con el servidor", 0, null);
    } finally {
        clearTimeout(timer);
    }
}