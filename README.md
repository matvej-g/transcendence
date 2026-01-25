# Transcendence

## Contents

1. [Project Overview](#1-project-overview)
2. [Contributors](#2-contributors)
3. [Project Structure](#3-project-structure)
   - [Mandatory Part](#31-mandatory-part)
   - [Modules](#32-modules)
4. [How to run](#4-how-to-run)

---

## 1. Project overview
**ft_transcendence** is the final team project of the 42 School Common Core. The goal of the project is to design and build a full-stack web application centered around a real-time multiplayer Pong game.  

The project consists of a mandatory part that every team must implement, as well as a modular part where teams can choose additional features to develop. A minimum of seven major modules is required to complete the project, with two minor modules counting as one major module.

---

## 2. Contributors
| Name      | Responsibilities |
|-----------|------------------|
| **[maustel](https://github.com/maustel)** | Frontend (mandatory), Tailwind CSS (minor) |
| **[dhuss](https://github.com/dhuss42)** | Backend PHP (mandatory), Docker infrastructure (mandatory), Database (minor) |
| **[isemin](https://github.com/textualbois)** | User Management (major), Live Chat (major), Multi-language support (minor) |
| **[mgering](https://github.com/matvej-g)** | Gameplay (mandatory), Remote Players (major), Server-Side Rendering (minor) |
| **[merdal](https://github.com/Mert5558)** | Two-Factor Authentication (major), Remote Authentication (major) |

---

## 3. Project Structure

3.1 [Mandatory Part](#31-mandatory-part)  
3.1.1 [Docker](#311-docker)  
3.1.2 [Frontend](#312-frontend)  
3.1.3 [Backend](#313-backend)  
3.1.4 [Game](#314-game)  

3.2 [Modules](#32-modules)  
3.2.1 [Tailwind CSS (minor)](#321-tailwind-css-minor)  
3.2.2 [Database (minor)](#322-database-minor)  
3.2.3 [User Management (major)](#323-user-management-major)  
3.2.4 [Live Chat (major)](#324-live-chat-major)  
3.2.5 [Multi-language Support (minor)](#325-multi-language-support-minor)  
3.2.6 [Remote Players (major)](#326-remote-players-major)  
3.2.7 [Server-Side Rendering (minor)](#327-server-side-rendering-minor)  
3.2.8 [Two-Factor Authentication (major)](#328-two-factor-authentication-major)  
3.2.9 [Remote Authentication (major)](#329-remote-authentication-major)

### 3.1 Mandatory Part

#### 3.1.1 Docker
<!-- Docker infrastructure overview -->

#### 3.1.2 Frontend
<!-- Frontend architecture and technologies -->

#### 3.1.3 Backend
<!-- Backend architecture and responsibilities -->

#### 3.1.4 Game
<!-- Pong gameplay implementation -->

---

### 3.2 Modules

#### 3.2.1 Tailwind CSS (minor)
<!-- Tailwind CSS integration -->

#### 3.2.2 Database (minor)
<!-- Database usage and structure -->

#### 3.2.3 User Management (major)
<!-- User accounts, profiles, and persistence -->

#### 3.2.4 Live Chat (major)
<!-- Real-time chat system -->

#### 3.2.5 Multi-language Support (minor)
<!-- Internationalization support -->

#### 3.2.6 Remote Players (major)
<!-- Online multiplayer implementation -->

#### 3.2.7 Server-Side Rendering (minor)
<!-- SSR integration -->

#### 3.2.8 Two-Factor Authentication (major)
<!-- 2FA implementation -->

#### 3.2.9 Remote Authentication (major)
<!-- OAuth / external authentication -->

---

## 4. How to run

Clone and create the project
```
git clone https://github.com/matvej-g/transcendence.git transcendence
cd transcendence
make up
```

access Website with:
```
https://localhost:8443/
```

### Add Test Users
Add Test users to database with
```
docker compose exec php-backend php tools/seed_users.php
```

View login credentials with
```
grep -im 1 "password" backend/tools/seed_users.php
```

## Makefile (local development)

This repository includes a `Makefile` to simplify common Docker Compose tasks during development.

Important targets:

- `make up` — start services in background (runs `docker compose up -d --build`)
- `make build` — builds images (`docker compose build`)
- `make down` — stop and remove containers (`docker compose down`)
- `make clean` — stop and remove containers, images, volumes and orphans
- `make prune` — runs `docker system prune -a --volumes -f` (host-level cleanup)
- `make buildx-prune` — prune buildx/buildkit caches (if available)
- `make deep-clean` — runs `clean`, `prune` and `buildx-prune`; to also delete repository Dockerfiles pass `FORCE=1`
- `make delete-dockerfiles` — deletes Dockerfiles in the repo (DANGEROUS — requires `FORCE=1`)

Examples:

```
make up
make deep-clean FORCE=1   # careful: this can remove images, volumes, build caches, and (with FORCE) Dockerfile files
```

Note: The destructive targets that remove source files (`delete-dockerfiles`) require an explicit `FORCE=1` to avoid accidental deletion. Run these only if you really mean to remove those files from the repository.
