import { createQueryClient } from "@luxero/api-client";
import { cache } from "react";

export const getQueryClient = cache(() => createQueryClient());
