<script lang="ts">
  import Converter from "./Converter.svelte";
  import {
    formatNumberStandard,
    parseInputValue,
    persistentState,
  } from "./utils.svelte";
  import type { UnitDefinition } from "./types";

  const units: UnitDefinition[] = [
    {
      key: "c",
      label: "Celsius",
      symbol: "°C",
      color: "primary-600",
      isMaster: true,
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
    #master = persistentState<number | undefined>(
      "temperature-master",
      undefined,
    );
    #units: UnitDefinition[];

    constructor(units: UnitDefinition[]) {
      this.#units = units;
      // Create getters and setters dynamically for each unit
      units.forEach((unit) => {
        Object.defineProperty(this, unit.key, {
          get: () =>
            this.#master.value === undefined
              ? undefined
              : unit.fromMaster(this.#master.value),
          set: (value: number | undefined) => {
            if (value === undefined || value === null || isNaN(value)) {
              this.#master.value = undefined;
              return;
            }
            this.#master.value = unit.toMaster(value);
          },
        });
      });
    }

    get isAbsoluteZero() {
      return this.#master.value !== undefined && this.#master.value <= -273.15;
    }

    get isFreezingPoint() {
      return (
        this.#master.value !== undefined &&
        Math.abs(this.#master.value - 0) < 0.01
      );
    }

    get isBoilingPoint() {
      return (
        this.#master.value !== undefined &&
        Math.abs(this.#master.value - 100) < 0.01
      );
    }

    get temperatureCategory() {
      if (this.#master?.value === undefined) return "Unknown";
      if (this.#master.value < -40) return "Extremely Cold";
      if (this.#master.value < 0) return "Freezing";
      if (this.#master.value < 20) return "Cold";
      if (this.#master.value < 30) return "Cool";
      if (this.#master.value < 40) return "Warm";
      if (this.#master.value < 60) return "Hot";
      return "Extremely Hot";
    }
  }

  const temperature = new Temperature(units);

  const converterProps = {
    units,
    formatNumber: formatNumberStandard,
    parseInput: parseInputValue,
    converter: temperature,
  };
</script>

<Converter {...converterProps} />

<!-- TODO: Uncomment and adapt the temperature information section once we have a way to handle custom UI elements in the base converter -->
<!-- {#if temperature.c !== undefined}
  <div class="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
    ...temperature information section...
  </div>
{/if} -->
