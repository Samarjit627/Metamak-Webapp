// regionHealth.ts
export async function fetchRegionSignals(location: string) {
  return {
    holidays: ["June 1", "June 12"],
    strikeRisk: "Low",
    laborSaturation: "Medium",
    delayWarning: false
  };
}
