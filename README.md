# ServiciosApp

Aplicación móvil (Expo / React Native) para administrar **servicios** con autenticación JWT y roles.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Expo SDK 58, React Native 0.88, expo-router, TypeScript |
| Estado local | React Hooks |
| Persistencia | `@react-native-async-storage/async-storage` |
| Backend | Node.js, Express 5, Prisma 7, PostgreSQL, JWT, bcrypt |
| Lint / tipos | ESLint (`eslint-config-expo`), TypeScript estricto |

## Estructura

```
ServiciosApp/
├── src/
│   ├── app/                    # Rutas (Expo Router)
│   │   ├── _layout.tsx         # Stack de navegación
│   │   ├── index.tsx           # Home: lista de servicios (CRUD + modal)
│   │   ├── login.tsx           # Iniciar sesión
│   │   └── registro.tsx        # Crear cuenta
│   ├── services/               # Capa de servicios (JS puro)
│   │   ├── api.js              # Wrapper de fetch (timeout, auth, errores)
│   │   ├── auth.service.js     # registro / login / logout / getUser
│   │   ├── servicios.service.js# CRUD de servicios
│   │   ├── tokenStorage.js     # Persistencia del JWT
│   │   └── config.js           # Resolución de la URL del API
│   ├── components/             # Componentes reutilizables
│   ├── constants/              # Tokens de diseño
│   └── hooks/                  # Hooks de tema
├── .env                        # EXPO_PUBLIC_API_URL
└── app.json
```

## Puesta en marcha

### 1. Dependencias

```bash
npm install
```

### 2. Configurar la URL del backend

El archivo `.env` define la URL base del API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

`src/services/config.js` ajusta la URL según la plataforma:

| Plataforma | URL final |
|---|---|
| Web / iOS simulator | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` (se reemplaza `localhost` automáticamente) |
| Dispositivo físico | IP local de tu PC |

Para un teléfono físico, defines la IP de tu máquina:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
```

### 3. Levantar la app

```bash
npx expo start --web      # Navegador
npx expo start --android  # Emulador Android
npx expo start            # Expo Go (escanear QR)
```

Si Metro se queda sin memoria en Windows:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npx expo start --android -c
```

## Backend

El backend vive en el directorio `Tarea6/` (fuera de este repositorio). Requisitos:

- Node.js con `npm install` en `Tarea6/`
- PostgreSQL configurado en `Tarea6/.env` (`DATABASE_URL`, `JWT_SECRET`)
- Migraciones aplicadas con `npx prisma migrate deploy`

```bash
cd Tarea6
npm run dev      # nodemon src/index.js -> puerto 3000
```

Endpoints disponibles:

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/registro` | — | Crear usuario |
| POST | `/auth/login` | — | Devuelve `{ token }` |
| GET | `/servicios` | — | Lista todos los servicios |
| POST | `/servicios` | Admin | Crear servicio |
| PUT | `/servicios/:id` | Admin | Actualizar servicio |
| DELETE | `/servicios/:id` | Admin | Eliminar servicio |

Las rutas protegidas usan `Authorization: Bearer <token>` y verifican `rol === "admin"`.

## Autenticación

- El login guarda el JWT en `AsyncStorage` bajo la clave `@serviciosapp:token`.
- `getUser()` decodifica el payload del token (sin verificar la firma) para leer `rol`, `nombre` y `email`.
- `src/app/index.tsx` verifica la sesión al montar: sin token válido redirige a `/login`.
- Los botones **Crear**, **Editar** y **Borrar** solo se muestran cuando `rol === "admin"`.

## Scripts

```bash
npx expo start       # servidor de desarrollo
npx expo start --web # versión web
npx expo lint        # ESLint
npx tsc --noEmit     # verificación de tipos
npx expo export --platform web   # build estático
```

## Licencia

MIT
