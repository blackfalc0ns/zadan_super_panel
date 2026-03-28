export interface DriverCompensationRule {
  basePayout: number;
  distanceRatePerKm: number;
  peakBonus: number;
  zoneBonus: number;
  overrideAllowed: boolean;
}
