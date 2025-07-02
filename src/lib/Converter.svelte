<script lang="ts">
  import type {} from "./types";
  import type { UnitDefinition } from "./types";

  export let units: UnitDefinition[];
  export let formatNumber: (value: number | undefined) => string;
  export let parseInput: (value: string) => number | undefined;
  export let converter: any;

  // Find the master unit (where toMaster(1) === 1 and fromMaster(1) === 1)
  const masterUnit = units.find((u) => u.isMaster == true);
  const otherUnits = units.filter((u) => u !== masterUnit);

  // Sort the other units from smallest to largest
  const sortedUnits = [
    ...(masterUnit ? [masterUnit] : []),
    ...otherUnits.sort((a, b) => a.toMaster(1) - b.toMaster(1)),
  ];

  units = sortedUnits;
</script>

<div
  class="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 card-hover">
  <div class="grid gap-6">
    {#each units as unit}
      <div class="space-y-2">
        <label
          class="block text-sm font-semibold text-slate-700 uppercase tracking-wide"
          for={unit.key}>
          {unit.label}
        </label>
        <div class="relative">
          <input
            id={unit.key}
            class="w-full px-4 py-3 text-lg font-medium bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            step="any"
            placeholder="Enter value..."
            bind:value={
              () =>
                converter[unit.key] === undefined
                  ? ""
                  : formatNumber(converter[unit.key]),
              (v) => (converter[unit.key] = parseInput(v))
            } />
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-{unit.color} pointer-events-none">
            {unit.symbol}
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>
