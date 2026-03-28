import { api } from "@/lib/api";
export const getRcaOutcomes        = (windowDays = 30) => api.getRcaOutcomes(windowDays);
export const downloadRcaOutcomesCsv = (windowDays = 30) => api.downloadRcaOutcomesCsv(windowDays);
