import { createQueryClient } from "@luxero/api-admin";
import { cache } from "react";

export const getQueryClient = cache(() => createQueryClient());
