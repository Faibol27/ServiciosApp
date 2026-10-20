import { request } from "./api";

export async function obtenerServicios() {
    const lista = await request("/servicios");
    return Array.isArray(lista) ? lista : [];
}

export async function crearServicio({ nombre, descripcion, duracion, precio }) {
    const data = await request("/servicios", {
        method: "POST",
        auth: true,
        body: {
            nombre,
            descripcion,
            duracion: Number(duracion),
            precio: Number(precio)
        }
    });
    return data.nuevoServicio;
}
export async function actualizarServicio(id, { nombre, descripcion, duracion, precio }) {
    const data = await request(`/servicios/${id}`, {
        method: 'PUT',
        auth: true,
        body: {
            nombre,
            descripcion,
            duracion: Number(duracion),
            precio: Number(precio),
        },
    });
    return data.servicioActualizado;
}

export async function eliminarServicio(id) {
    const data = await request(`/servicios/${id}`, {
        method: 'DELETE',
        auth: true,
    });
    return data.servicioEliminado;
}