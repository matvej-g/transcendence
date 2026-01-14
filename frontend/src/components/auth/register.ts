import type { RegisterRequest, RegisterResult } from "./types.js";
import { postRegisterRequest } from "./api.js";
import { setCurrentUserId, setUserOnline } from './authUtils.js';
import { initProfile } from '../profile/profile.js';
import { appWs } from "../../ws/appWs.js";

/**
 * Public API used by the UI.
 */
export async function registerHandle(payload: RegisterRequest): Promise<RegisterResult> {
  try {
    const res = await postRegisterRequest(payload);
    const data = await parseRegisterResponseBody(res);

    logRegisterResponse(res, data);

    if (!res.ok) {
      return buildRegisterErrorResult(data);
    }

    // store userId and initialize profile immediately
    const userIdToStore = data?.id ?? data?.user?.id ?? null;
    if (userIdToStore) {
      setCurrentUserId(userIdToStore);
      try { await setUserOnline(); } catch (e) { console.warn('[auth] setUserOnline failed', e); }
    }
	appWs.connect(); //connect app websocket after register
    return buildRegisterSuccessResult(data);
  } catch (e) {
    logRegisterException(e);
    return buildNetworkErrorResult();
  }
}

/* ──────────────────────────── helpers ──────────────────────────── */

/**
 * Reads and parses the HTTP response body into JS.
 * Falls back to a simple wrapper if JSON parsing fails.
 */
async function parseRegisterResponseBody(res: Response): Promise<any> {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function logRegisterResponse(res: Response, data: any): void {
  console.log("[TS] registerHandle → HTTP", res.status, res.statusText);
  console.log("[TS] registerHandle → body", data);
}

/**
 * Builds a RegisterResult for non-2xx responses.
 */
function buildRegisterErrorResult(data: any): RegisterResult {
  const err =
    typeof data === "object" && data?.error
      ? String(data.error)
      : "Register_FAILED";

  return { ok: false, error: err };
}

/**
 * Builds a RegisterResult for successful responses.
 * Normalises backend field names into our `{ id, username }` shape.
 */
function buildRegisterSuccessResult(data: any): RegisterResult {
  return {
    ok: true,
    user: {
      id: String(data.id),
      username: String(data.userName ?? data.username),
    },
  };
}

/**
 * Logs unexpected exceptions (network issues, etc.).
 */
function logRegisterException(e: unknown): void {
  console.log("[TS] registerHandle → exception", e);
}

/**
 * Standardised result for network-level failures.
 */
function buildNetworkErrorResult(): RegisterResult {
  return { ok: false, error: "NETWORK_ERROR" };
}
