# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Delegated: React Native with Expo and TypeScript. This was chosen for a single Android/iOS codebase, offline use, and gradual access to native capabilities.

## Users

The primary user is the developer who owns this project. They use the app throughout the day to decide what matters next, capture information quickly, and keep their technical life in view.

## Product Purpose

This is a personal, mobile-first command center for everyday planning and a developer's technical ecosystem. Success means it is the first place the owner checks during the day.

## Positioning

The product combines a daily focus view with lightweight personal technical inventory and curated technology news, instead of treating those contexts as separate apps.

## Operating Context

The app is used in short, frequent sessions on a phone: checking the day, capturing a task or note, reading selected news, and checking projects, devices, or upcoming renewals.

## Capabilities and Constraints

- Initial scope: tasks, daily priorities, notes, habits, reminders, RSS news, and manual inventories for projects, software, hardware, and renewals.
- Data model: server-first. An Express API with PostgreSQL stores each user's data behind an email/password account. An on-device cache for offline reading is planned (phase 1); full local-first sync is deferred.
- Android and iOS are targets. Android is the first practical test target.
- Deferred: secrets storage, permanent computer telemetry, server administration, finance, and social features.

## Evidence on Hand

No existing product assets, production data, or visual identity are available. Dashboard values come from real data; features that don't work yet are hidden rather than shown as placeholders.

## Product Principles

1. Make the next useful action obvious.
2. Capture information faster than opening a separate app.
3. Stay readable without a connection and keep personal data understandable.
4. Treat technical information as practical life context, not enterprise administration.
