import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = "@serviciosapp:token";

export async function guardarToken(token) {
    await AsyncStorage.setItem(STORAGE_KEY, token ?? "");
}

export async function obtenerToken() {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    return token || null;
}

export async function limpiarToken() {
    await AsyncStorage.removeItem(STORAGE_KEY)
}
export { STORAGE_KEY };