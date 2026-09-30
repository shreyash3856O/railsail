export const SOURCES = {
  petrol: "Mumbai retail petrol, Sept 2026 (Goodreturns/PPAC)",
  auto: "MMRTA tariff effective 1 Sept 2026 (RTO)",
  rail: "Western Railway suburban II-class single-journey slabs",
  bus: "BEST non-AC chart from 9 May 2025 (approximate stages)",
  frequency: "WR published service pattern: peak 3-5 min, off-peak 8-12 min",
};

export const PETROL_PRICE_PER_LITRE = 111.21;
export const CAR_MILEAGE_KMPL = 15;

export const AUTO_TARIFF = {
  baseFare: 27,
  baseKm: 1.5,
  perKm: 18.22,
  nightSurcharge: 0.25,
  nightStartHour: 0,
  nightEndHour: 5,
};

export function autoFare(distanceKm: number, at: Date = new Date()): number {
  const extra = Math.max(0, distanceKm - AUTO_TARIFF.baseKm);
  let fare = AUTO_TARIFF.baseFare + extra * AUTO_TARIFF.perKm;
  const h = at.getHours();
  if (h >= AUTO_TARIFF.nightStartHour && h < AUTO_TARIFF.nightEndHour) {
    fare *= 1 + AUTO_TARIFF.nightSurcharge;
  }
  return Math.round(fare);
}

export function suburbanRailFare(railKm: number): number {
  if (railKm <= 10) return 5;
  if (railKm <= 30) return 10;
  if (railKm <= 50) return 15;
  if (railKm <= 80) return 20;
  return 25;
}

export function carFuelCost(distanceKm: number): number {
  return Math.round((distanceKm / CAR_MILEAGE_KMPL) * PETROL_PRICE_PER_LITRE);
}

export function bestBusFare(distanceKm: number): number {
  if (distanceKm <= 5) return 10;
  return 10 + 5 * Math.ceil((distanceKm - 5) / 5);
}

export interface TrafficAdjustment {
  factor: number;
  label: string;
}

export function trafficAdjustment(at: Date = new Date()): TrafficAdjustment {
  const h = at.getHours();
  if (h >= 8 && h < 11)
    return { factor: 1.3, label: "Morning peak adjustment (estimated)" };
  if (h >= 17 && h < 21)
    return { factor: 1.45, label: "Evening peak adjustment (estimated)" };
  if (h >= 23 || h < 5)
    return { factor: 0.9, label: "Night hours adjustment (estimated)" };
  return { factor: 1.0, label: "Free-flow conditions" };
}

export interface TrainFrequency {
  running: boolean;
  waitMin: number;
  label: string;
}

export function trainFrequency(at: Date = new Date()): TrainFrequency {
  const h = at.getHours();
  if (h >= 1 && h < 4)
    return {
      running: false,
      waitMin: 0,
      label: "Locals do not run between 1 AM and 4 AM",
    };
  if ((h >= 7 && h < 11) || (h >= 17 && h < 22))
    return {
      running: true,
      waitMin: 2,
      label: "Trains every 3-5 min at this hour (typical)",
    };
  return {
    running: true,
    waitMin: 5,
    label: "Trains every 8-12 min at this hour (typical)",
  };
}

export function formatINR(n: number): string {
  return `Rs ${Math.round(n).toLocaleString("en-IN")}`;
}
