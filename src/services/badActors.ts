import { api } from "@/lib/api";
export const getBadActors = (limit = 20) => api.getBadActors(limit);
