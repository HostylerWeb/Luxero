import "server-only";
import { cookies } from "next/headers";

export async function getServerCookieHeader(): Promise<string> {
  const store = await cookies();
  return store.toString();
}
