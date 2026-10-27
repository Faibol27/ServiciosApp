import { Platform } from "react-native";
import Constants from 'expo-constants';

const DEFAULT_PORT = 3000;

export function obtenerUrlBaseApi() {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) {
        let url = envUrl.replace(/\/+$/, "");
        if (Platform.OS === "android" && url.includes("localhost")) {
            url = url.replace("localhost", "10.0.2.2");
        }
        return url;
    }

    if (Platform.OS === "android")
        return `http://10.0.2.2:${DEFAULT_PORT}`;

    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const host = hostUri.split(":")[0];
        if (host && host !== "localhost")
            return `http://${host}:${DEFAULT_PORT}`;
    }
    return `http://localhost:${DEFAULT_PORT}`;
}
export const API_URL = obtenerUrlBaseApi();
export const TIMEOUT_MS = 10000;