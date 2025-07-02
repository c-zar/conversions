<script lang="ts">
  interface UnitDefinition {
    key: string;
    label: string;
    symbol: string;
    color: string;
    factor: number; // Conversion factor to meters
  }

  const units: UnitDefinition[] = [
    {
      key: "meter",
      label: "Meter",
      symbol: "m",
      color: "emerald-600",
      factor: 1,
    },
    {
      key: "kilometer",
      label: "Kilometer",
      symbol: "km",
      color: "emerald-600",
      factor: 1000,
    },
    {
      key: "centimeter",
      label: "Centimeter",
      symbol: "cm",
      color: "amber-500",
      factor: 0.01,
    },
    {
      key: "millimeter",
      label: "Millimeter",
      symbol: "mm",
      color: "amber-500",
      factor: 0.001,
    },
    {
      key: "inch",
      label: "Inch",
      symbol: "in",
      color: "violet-500",
      factor: 0.0254,
    },
    {
      key: "foot",
      label: "Foot",
      symbol: "ft",
      color: "violet-500",
      factor: 0.3048,
    },
    {
      key: "yard",
      label: "Yard",
      symbol: "yd",
      color: "rose-500",
      factor: 0.9144,
    },
    {
      key: "mile",
      label: "Mile",
      symbol: "mi",
      color: "rose-500",
      factor: 1609.344,
    },
    {
      key: "nauticalMile",
      label: "Nautical Mile",
      symbol: "nmi",
      color: "cyan-500",
      factor: 1852,
    },
    {
      key: "astronomicalUnit",
      label: "Astronomical Unit",
      symbol: "AU",
      color: "cyan-500",
      factor: 1.496e11,
    },
    {
      key: "lightYear",
      label: "Light Year",
      symbol: "ly",
      color: "cyan-500",
      factor: 9.461e15,
    },
    {
      key: "parsec",
      label: "Parsec",
      symbol: "pc",
      color: "cyan-500",
      factor: 3.086e16,
    },
  ];

  class Length {
    #master = $state<number | undefined>();
    #units: UnitDefinition[];

    constructor(units: UnitDefinition[]) {
      this.#units = units;
      // Create getters and setters dynamically for each unit
      units.forEach((unit) => {
        Object.defineProperty(this, unit.key, {
          get: () =>
            this.#master === undefined ? undefined : this.#master / unit.factor,
          set: (value: number | undefined) => {
            if (value === undefined || value === null || isNaN(value)) {
              this.#master = undefined;
              return;
            }
            this.#master = value * unit.factor;
          },
        });
      });
    }
  }

  const length = new Length(units);

  function formatNumber(value: number | undefined): string {
    if (value === undefined) return "";
    if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
      return value.toExponential(6);
    }
    if (Math.abs(value) < 1) {
      return Number(value.toFixed(8)).toString();
    }
    return Number(value.toFixed(6)).toString();
  }

  function parseInput(value: string): number | undefined {
    if (value === "") return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
</script>

<div
  class="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 card-hover"
>
  <div class="grid gap-6">
    {#each units as unit}
      <div class="space-y-2">
        <label
          class="block text-sm font-semibold text-slate-700 uppercase tracking-wide"
          for={unit.key}
        >
          {unit.label}
        </label>
        <div class="relative">
          <input
            id={unit.key}
            class="w-full px-4 py-3 text-lg font-medium bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            step="any"
            placeholder="Enter length..."
            value={formatNumber(length[unit.key])}
            oninput={(e) => {
              const target = e.target as HTMLInputElement;
              length[unit.key] = parseInput(target.value);
            }}
          />
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-{unit.color} pointer-events-none"
          >
            {unit.symbol}
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>
