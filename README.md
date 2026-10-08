# Nexo

Aplicación móvil personal, creada con Expo y React Native, para organizar el día y mantener a la vista proyectos, noticias y recursos técnicos.

## Qué funciona hoy

Todo se guarda localmente en SQLite. No hay cuenta ni servidor.

- **Hoy**: crear tareas con etiqueta (Personal, Proyecto, Tech), marcarlas como hechas y ver el progreso del día.
- **Organizar**: hábitos que se reinician cada día, y notas libres. Se pueden eliminar desde su fila.
- **Noticias**: lectura real de RSS (Lobsters, Hacker News, The Verge) con pull-to-refresh y apertura en el navegador.
- **Tech**: registro de proyectos, equipos, software y servicios, con fecha de renovación opcional. Los vencimientos más próximos aparecen arriba.
- **Perfil**: preferencias visuales. La exportación de datos y la sincronización siguen en pendiente.

## Ejecutar

```bash
npm install
npm run android
```

También puedes iniciar el servidor con `npm start` y abrirlo desde Expo Go durante la exploración inicial.

## Verificar

```bash
npm run typecheck
```

## Estructura

- `app/(tabs)/` — las cinco pantallas
- `components/` — piezas de interfaz reutilizables
- `contexts/` — estado y persistencia por dominio (tareas, hábitos, notas, noticias, inventario)
- `lib/database.ts` — conexión y esquema SQLite
- `lib/news.ts` — cliente y parser RSS

## Contexto

El alcance y las decisiones de producto están en [PRODUCT.md](PRODUCT.md).
