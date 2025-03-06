import { Request } from "express";

export interface AuthUser {
  _id: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
