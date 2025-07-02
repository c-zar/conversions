<script lang="ts">
  interface UnitDefinition {
    key: string;
    label: string;
    symbol: string;
    color: string;
    toMaster: (value: number) => number; // Convert from this unit to Celsius
    fromMaster: (value: number) => number; // Convert from Celsius to this unit
  }

  const units: UnitDefinition[] = [
    {
      key: "c",
      label: "Celsius",
      symbol: "°C",
      color: "primary-600",
      toMaster: (c) => c,
      fromMaster: (c) => c,
    },
    {
      key: "f",
      label: "Fahrenheit",
      symbol: "°F",
      color: "orange-600",
      toMaster: (f) => (f - 32) * (5 / 9),
      fromMaster: (c) => c * (9 / 5) + 32,
    },
    {
      key: "k",
      label: "Kelvin",
      symbol: "°K",
      color: "slate-600",
      toMaster: (k) => k - 273.15,
      fromMaster: (c) => c + 273.15,
    },
    {
      key: "n",
      label: "Newton",
      symbol: "°N",
      color: "purple-600",
      toMaster: (n) => (n * 100) / 33,
      fromMaster: (c) => (c * 33) / 100,
    },
    {
      key: "r",
      label: "Rankine",
      symbol: "°R",
      color: "teal-600",
      toMaster: (r) => ((r - 491.67) * 5) / 9,
      fromMaster: (c) => (c * 9) / 5 + 491.67,
    },
  ];

  class Temperature {
    #master = $state<number | undefined>();
    #units: UnitDefinition[];

    constructor(units: UnitDefinition[]) {
      this.#units = units;
      // Create getters and setters dynamically for each unit
      units.forEach((unit) => {
        Object.defineProperty(this, unit.key, {
          get: () =>
            this.#master === undefined
              ? undefined
              : unit.fromMaster(this.#master),
          set: (value: number | undefined) => {
            if (value === undefined || value === null || isNaN(value)) {
              this.#master = undefined;
              return;
            }
            this.#master = unit.toMaster(value);
          },
        });
      });
    }

    get isAbsoluteZero() {
      return this.#master !== undefined && this.#master <= -273.15;
    }

    get isFreezingPoint() {
      return this.#master !== undefined && Math.abs(this.#master - 0) < 0.01;
    }

    get isBoilingPoint() {
      return this.#master !== undefined && Math.abs(this.#master - 100) < 0.01;
    }

    get temperatureCategory() {
      if (this.#master === undefined) return "Unknown";
      if (this.#master < -40) return "Extremely Cold";
      if (this.#master < 0) return "Freezing";
      if (this.#master < 20) return "Cold";
      if (this.#master < 30) return "Cool";
      if (this.#master < 40) return "Warm";
      if (this.#master < 60) return "Hot";
      return "Extremely Hot";
    }
  }

  const temperature = new Temperature(units);

  function formatNumber(value: number | undefined): string {
    if (value === undefined) return "";
    return Number(value.toFixed(2)).toString();
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
            placeholder="Enter temperature..."
            value={formatNumber(temperature[unit.key])}
            oninput={(e) => {
              const target = e.target as HTMLInputElement;
              temperature[unit.key] = parseInput(target.value);
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

  <!-- {#if temperature.c !== undefined}
    <div class="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
      <h3 class="text-lg font-semibold text-slate-700 mb-4">
        Temperature Information
      </h3>
      <div class="space-y-3">
        <div
          class="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0"
        >
          <span class="font-medium text-slate-600">Category:</span>
          <span class="font-semibold text-slate-800"
            >{temperature.temperatureCategory}
          </span>
        </div>
        {#if temperature.isAbsoluteZero}
          <div
            class="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0"
          >
            <span class="font-medium text-slate-600">Special:</span>
            <span class="font-semibold text-slate-800">Absolute Zero</span>
          </div>
        {/if}
        {#if temperature.isFreezingPoint}
          <div
            class="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0"
          >
            <span class="font-medium text-slate-600">Special:</span>
            <span class="font-semibold text-slate-800"
              >Water Freezing Point</span
            >
          </div>
        {/if}
        {#if temperature.isBoilingPoint}
          <div
            class="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0"
          >
            <span class="font-medium text-slate-600">Special:</span>
            <span class="font-semibold text-slate-800">Water Boiling Point</span
            >
          </div>
        {/if}
      </div>
    </div>
  {/if} -->
</div>
