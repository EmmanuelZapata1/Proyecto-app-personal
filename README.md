# Nexo

Aplicación personal, creada con Expo y React Native, para organizar el día y mantener a la vista proyectos, noticias y recursos técnicos.

## Qué funciona hoy

Los datos viven en un servidor propio (Express + PostgreSQL) y cada persona entra con su correo y contraseña.

- **Hoy**: crear tareas con etiqueta (Personal, Proyecto, Tech), marcarlas como hechas y ver el progreso del día.
- **Organizar**: hábitos que se reinician cada día (según la fecha del celular) y notas libres.
- **Noticias**: lectura de RSS (Lobsters, Hacker News, The Verge) a través del servidor, con pull-to-refresh.
- **Tech**: registro de proyectos, equipos, software y servicios, con fecha de renovación opcional.
- **Perfil**: correo de la cuenta y cierre de sesión.

## Arquitectura

```
App Expo (Android, iOS, web)  ──HTTP + JWT──▶  server/ (Express)  ──▶  PostgreSQL
```

- La app guarda el token de sesión en `expo-secure-store` (Android/iOS) o `localStorage` (web).
- Próximo paso (Fase 1): caché en el dispositivo para leer sin conexión. Ver [issue #9](https://github.com/EmmanuelZapata1/Proyecto-app-personal/issues/9).

## Ejecutar en local

Necesitas Node 22 y Docker.

```bash
# 1. Base de datos y servidor
docker compose up db api        # API en http://localhost:8080

# 2. App
npm install
npm run web                     # o npm run android
```

La app usa `EXPO_PUBLIC_API_URL` para encontrar el servidor (por defecto `http://localhost:8080`). En un celular físico pon la IP de tu computador, por ejemplo `EXPO_PUBLIC_API_URL=http://192.168.1.20:8080 npm run android`.

Para correr el servidor sin Docker, copia `server/.env.example` a `server/.env`, ajusta `DATABASE_URL` y ejecuta `npm install && npm run dev` dentro de `server/`.

## Verificar

```bash
npm run typecheck
npm run lint
npm run format:check            # npm run format para corregir
cd server && npm run typecheck
```

GitHub Actions corre estas mismas validaciones en cada PR.

## Estructura

- `app/` — pantallas (expo-router): acceso, puerta de sesión y las cinco pestañas en `app/(tabs)/`
- `components/` — piezas de interfaz reutilizables
- `contexts/` — sesión y estado por dominio (tareas, hábitos, notas, noticias, inventario)
- `lib/api.ts` — cliente HTTP y token de sesión
- `lib/storage.ts` — almacenamiento seguro del token
- `server/` — API Express, esquema SQL y rutas por dominio
- `docker-compose.yml`, `render.yaml` — entorno local y despliegue en Render

## Cómo trabajamos

El plan vive en los [issues de GitHub](https://github.com/EmmanuelZapata1/Proyecto-app-personal/issues), agrupado por fases (#1 a #13).

1. Elige un issue y crea una rama desde `main`: `git switch -c fix/nombre-corto`.
2. Haz commits pequeños. En el mensaje o en el PR escribe `Closes #N` para cerrar el issue al fusionar.
3. Abre un PR hacia `main`; espera a que CI esté en verde y revisa el diff.
4. Fusiona y actualiza tu copia: `git switch main && git pull`.

## Contexto

El alcance y las decisiones de producto están en [PRODUCT.md](PRODUCT.md).
