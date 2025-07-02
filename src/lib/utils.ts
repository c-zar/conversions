export function formatNumberStandard(value: number | undefined): string {
  if (value === undefined) return "";
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
    return value.toExponential(6);
  }
  if (Math.abs(value) < 1) {
    return Number(value.toFixed(8)).toString();
  }
  return Number(value.toFixed(6)).toString();
}

export function parseInputValue(value: string): number | undefined {
  if (value === "") return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}
