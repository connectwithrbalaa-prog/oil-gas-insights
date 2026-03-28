import { api } from "@/lib/api";
export const getHealth         = ()                   => api.getHealth();
export const getDeepHealth     = ()                   => api.getDeepHealth();
export const getSignalsSummary = (assetId: string)    => api.getSignalsSummary(assetId);
