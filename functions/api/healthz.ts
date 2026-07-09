import { ok } from "../_lib/api";

export function onRequestGet(): Response {
  return ok({ status: "ok" });
}
