

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export type RegisterResult =
  | { ok: true; user: { id: string; username: string } }
  | { ok: false; error: string };

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

