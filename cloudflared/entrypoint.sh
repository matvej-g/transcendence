#!/bin/sh
set -eu

CFG=/etc/cloudflared/config.yaml
CERT=/etc/cloudflared/cert.pem

# credentials file is usually <tunnel-uuid>.json
CREDS="$(ls -1 /etc/cloudflared/*.json 2>/dev/null || true)"

echo "[cloudflared] startup"
echo "[cloudflared] cfg_exists=$([ -s "$CFG" ] && echo yes || echo no)"
echo "[cloudflared] cert_exists=$([ -s "$CERT" ] && echo yes || echo no)"
echo "[cloudflared] creds_found=$([ -n "$CREDS" ] && echo yes || echo no)"

if [ -s "$CFG" ] && [ -s "$CERT" ] && [ -n "$CREDS" ]; then
  echo "[cloudflared] creds found -> starting tunnel"
  exec cloudflared tunnel --config "$CFG" run
fi

echo "[cloudflared] creds missing -> idle"
exec sleep infinity