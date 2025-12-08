import { RegisterRequest } from "./types.js";

export async function postRegisterRequest(payload: RegisterRequest): Promise<Response> {
  return await fetch("/api/user/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}