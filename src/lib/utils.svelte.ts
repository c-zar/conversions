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

export function persistentState<T>(key: string, initial: T) {
  let _value: T = initial;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) _value = JSON.parse(stored);
  } catch {}
  return {
    get value() {
      return _value;
    },
    set value(val: T) {
      _value = val;
      localStorage.setItem(key, JSON.stringify(_value));
    },
  };
}
