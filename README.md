## How To run

In order to run you need to comment out line 13 in public/index.php 

```
require base_path("vendor/autoload.php");
```

Then run  

```
docker compose up -d
```

access Website with localhost:8080
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
