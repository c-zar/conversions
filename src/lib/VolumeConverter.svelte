<script lang="ts">
  interface UnitDefinition {
    key: string;
    label: string;
    symbol: string;
    color: string;
    factor: number; // Conversion factor to cubic meters
  }

  const units: UnitDefinition[] = [
    {
      key: "cubicMeter",
      label: "Cubic Meter",
      symbol: "m³",
      color: "emerald-600",
      factor: 1,
    },
    {
      key: "liter",
      label: "Liter",
      symbol: "L",
      color: "emerald-600",
      factor: 0.001,
    },
    {
      key: "milliliter",
      label: "Milliliter",
      symbol: "mL",
      color: "emerald-600",
      factor: 0.000001,
    },
    {
      key: "gallonUS",
      label: "Gallon (US)",
      symbol: "gal",
      color: "indigo-600",
      factor: 0.003785411784,
    },
    {
      key: "quartUS",
      label: "Quart (US)",
      symbol: "qt",
      color: "indigo-600",
      factor: 0.000946352946,
    },
    {
      key: "pintUS",
      label: "Pint (US)",
      symbol: "pt",
      color: "indigo-600",
      factor: 0.000473176473,
    },
    {
      key: "cupUS",
      label: "Cup (US)",
      symbol: "cup",
      color: "pink-600",
      factor: 0.0002365882365,
    },
    {
      key: "fluidOunceUS",
      label: "Fluid Ounce (US)",
      symbol: "fl oz",
      color: "pink-600",
      factor: 0.0000295735296875,
    },
    {
      key: "tablespoonUS",
      label: "Tablespoon (US)",
      symbol: "tbsp",
      color: "orange-600",
      factor: 0.00001478676478125,
    },
    {
      key: "teaspoonUS",
      label: "Teaspoon (US)",
      symbol: "tsp",
      color: "orange-600",
      factor: 0.00000492892159375,
    },
    {
      key: "barrel",
      label: "Barrel",
      symbol: "bbl",
      color: "red-600",
      factor: 0.158987294928,
    },
    {
      key: "cubicFoot",
      label: "Cubic Foot",
      symbol: "ft³",
      color: "red-600",
      factor: 0.0283168465592,
    },
    {
      key: "cubicInch",
      label: "Cubic Inch",
      symbol: "in³",
      color: "purple-600",
      factor: 0.000016387064,
    },
    {
      key: "cubicCentimeter",
      label: "Cubic Centimeter",
      symbol: "cm³",
      color: "purple-600",
      factor: 0.000001,
    },
    {
      key: "gallonImperial",
      label: "Gallon (Imperial)",
      symbol: "gal (UK)",
      color: "teal-600",
      factor: 0.00454609,
    },
    {
      key: "pintImperial",
      label: "Pint (Imperial)",
      symbol: "pt (UK)",
      color: "teal-600",
      factor: 0.00056826125,
    },
    {
      key: "fluidOunceImperial",
      label: "Fluid Ounce (Imperial)",
      symbol: "fl oz (UK)",
      color: "teal-600",
      factor: 0.0000284130625,
    },
  ];

  class Volume {
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

    // get volumeCategory() {
    //   if (this.#master === undefined) return 'Unknown';
    //   if (this.#master < 0.000001) return 'Microscopic';
    //   if (this.#master < 0.001) return 'Very Small';
    //   if (this.#master < 0.1) return 'Small';
    //   if (this.#master < 1) return 'Medium';
    //   if (this.#master < 10) return 'Large';
    //   if (this.#master < 100) return 'Very Large';
    //   return 'Extremely Large';
    // }

    // isOneOf(unitKey: string): boolean {
    //   const value = this[unitKey as keyof Volume];
    //   return value !== undefined && Math.abs(value - 1) < 0.001;
    // }
  }

  const volume = new Volume(units);

  function formatNumber(value: number | undefined): string {
    if (value === undefined) return "";
    if (value >= 1000000 || (value < 0.001 && value > 0)) {
      return value.toExponential(3);
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
            placeholder="Enter volume..."
            value={formatNumber(volume[unit.key])}
            oninput={(e) => {
              const target = e.target as HTMLInputElement;
              volume[unit.key] = parseInput(target.value);
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

  <!-- {#if volume.cubicMeter !== undefined}
    <div class="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
      <h3 class="text-lg font-semibold text-slate-700 mb-4">Volume Information</h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
          <span class="font-medium text-slate-600">Category:</span>
          <span class="font-semibold text-slate-800">{volume.volumeCategory}</span>
        </div>
        {#each units as unit}
          {#if volume.isOneOf(unit.key)}
            <div class="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
              <span class="font-medium text-slate-600">Reference:</span>
              <span class="font-semibold text-slate-800">1 {unit.label}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if} -->
</div>
