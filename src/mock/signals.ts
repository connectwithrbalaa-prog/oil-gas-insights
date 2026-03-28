import type { SignalsSummary, SignalReading, SignalRollup } from "@/types/api";

function reading(value: number, unit: string, anomaly = false): SignalReading {
  return { ts: "2026-03-22T10:15:00Z", value, unit, anomaly };
}

function rollups(mean: number, min: number, max: number): SignalRollup[] {
  return [
    { window: "1h", mean, min, max },
    { window: "6h", mean: mean * 0.98, min: min * 0.97, max: max * 1.01 },
    { window: "24h", mean: mean * 0.96, min: min * 0.94, max: max * 1.03 },
  ];
}

export const MOCK_SIGNALS_SUMMARY: Record<string, SignalsSummary> = {
  "COMP-220": {
    asset_id: "COMP-220",
    signals: {
      vibration_x: [reading(8.2, "mm/s", true), reading(7.9, "mm/s", true), reading(7.4, "mm/s")],
      vibration_y: [reading(6.8, "mm/s"), reading(6.5, "mm/s"), reading(6.1, "mm/s")],
      bearing_temp: [reading(87, "°C", true), reading(85, "°C"), reading(82, "°C")],
    },
    rollups: {
      vibration_x: rollups(7.8, 6.2, 8.2),
      vibration_y: rollups(6.5, 5.8, 6.8),
      bearing_temp: rollups(84, 78, 87),
    },
  },
  "COMP-340": {
    asset_id: "COMP-340",
    signals: {
      discharge_pressure: [reading(44.1, "bar"), reading(44.5, "bar"), reading(45.2, "bar")],
      polytropic_efficiency: [reading(77, "%", true), reading(78, "%", true), reading(79, "%")],
    },
    rollups: {
      discharge_pressure: rollups(44.6, 44.1, 46.0),
      polytropic_efficiency: rollups(78, 77, 80),
    },
  },
  "PS-105B": {
    asset_id: "PS-105B",
    signals: {
      seal_dp: [reading(1.56, "bar", true), reading(1.62, "bar", true), reading(1.71, "bar")],
      flow: [reading(142, "m³/h"), reading(145, "m³/h"), reading(148, "m³/h")],
    },
    rollups: {
      seal_dp: rollups(1.65, 1.56, 1.82),
      flow: rollups(145, 140, 152),
    },
  },
  "GT-401": {
    asset_id: "GT-401",
    signals: {
      egt_spread: [reading(47, "°C"), reading(44, "°C"), reading(41, "°C")],
      tc12: [reading(643, "°C", true), reading(638, "°C", true), reading(630, "°C")],
    },
    rollups: {
      egt_spread: rollups(44, 38, 47),
      tc12: rollups(637, 625, 643),
    },
  },
  "HX-310A": {
    asset_id: "HX-310A",
    signals: {
      approach_temp: [reading(22, "°C", true), reading(20, "°C", true), reading(18, "°C")],
    },
    rollups: {
      approach_temp: rollups(20, 16, 22),
    },
  },
  "MOT-150": {
    asset_id: "MOT-150",
    signals: {
      winding_temp: [reading(118, "°C", true), reading(115, "°C", true), reading(112, "°C")],
      current_imbalance: [reading(4.2, "%", true), reading(4.0, "%", true), reading(3.8, "%", true)],
    },
    rollups: {
      winding_temp: rollups(115, 108, 118),
      current_imbalance: rollups(4.0, 3.5, 4.2),
    },
  },
  "GEN-501": {
    asset_id: "GEN-501",
    signals: {
      brg2_oil_temp: [reading(76, "°C", true), reading(74, "°C"), reading(72, "°C")],
    },
    rollups: {
      brg2_oil_temp: rollups(73, 68, 76),
    },
  },
  "CV-2240": {
    asset_id: "CV-2240",
    signals: {
      position_deviation: [reading(3.8, "%", true), reading(3.5, "%", true), reading(3.1, "%", true)],
    },
    rollups: {
      position_deviation: rollups(3.5, 2.8, 3.8),
    },
  },
  "PT-4410": {
    asset_id: "PT-4410",
    signals: {
      calibration_drift: [reading(1.8, "%"), reading(1.6, "%"), reading(1.4, "%")],
    },
    rollups: {
      calibration_drift: rollups(1.6, 1.1, 1.8),
    },
  },
};
