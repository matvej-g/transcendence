# stage 1: get the cloudflared binary
FROM cloudflare/cloudflared:2025.11.1 AS src

# stage 2: tiny runtime with /bin/sh
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=src /usr/local/bin/cloudflared /usr/local/bin/cloudflared

# IMPORTANT: do NOT set ENTRYPOINT here