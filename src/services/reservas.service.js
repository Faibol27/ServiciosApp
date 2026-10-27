import { request } from './api';

export async function obtenerReservasCliente() {
    const data = await request('/reservas/cliente', { auth: true });
    return Array.isArray(data) ? data : [];
}

export async function crearReserva(servicioId, fecha, hora) {
    return request('/reservas', {
        method: 'POST',
        auth: true,
        body: { servicioId, fecha, hora },
    });
}

export async function cancelarReserva(id) {
    return request(`/reservas/${id}`, {
        method: 'DELETE',
        auth: true,
    });
}

export async function obtenerReservasAdmin() {
    const data = await request('/reservas', { auth: true });
    return Array.isArray(data) ? data : [];
}

export async function completarReserva(id) {
    return request(`/reservas/${id}`, {
        method: 'PUT',
        auth: true,
        body: { estado: 'completada' },
    });
}
