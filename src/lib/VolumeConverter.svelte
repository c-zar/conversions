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
      key: "cubicMeter",
      label: "Cubic Meter",
      symbol: "m³",
      color: "emerald-600",
      toMaster: (v) => v,
      fromMaster: (v) => v,
    },
    {
      key: "liter",
      label: "Liter",
      symbol: "L",
      color: "emerald-600",
      isMaster: true,
      toMaster: (v) => v * 0.001,
      fromMaster: (v) => v / 0.001,
    },
    {
      key: "milliliter",
      label: "Milliliter",
      symbol: "mL",
      color: "emerald-600",
      toMaster: (v) => v * 0.000001,
      fromMaster: (v) => v / 0.000001,
    },
    {
      key: "gallonUS",
      label: "Gallon (US)",
      symbol: "gal",
      color: "indigo-600",
      toMaster: (v) => v * 0.003785411784,
      fromMaster: (v) => v / 0.003785411784,
    },
    {
      key: "quartUS",
      label: "Quart (US)",
      symbol: "qt",
      color: "indigo-600",
      toMaster: (v) => v * 0.000946352946,
      fromMaster: (v) => v / 0.000946352946,
    },
    {
      key: "pintUS",
      label: "Pint (US)",
      symbol: "pt",
      color: "indigo-600",
      toMaster: (v) => v * 0.000473176473,
      fromMaster: (v) => v / 0.000473176473,
    },
    {
      key: "cupUS",
      label: "Cup (US)",
      symbol: "cup",
      color: "pink-600",
      toMaster: (v) => v * 0.0002365882365,
      fromMaster: (v) => v / 0.0002365882365,
    },
    {
      key: "fluidOunceUS",
      label: "Fluid Ounce (US)",
      symbol: "fl oz",
      color: "pink-600",
      toMaster: (v) => v * 0.0000295735296875,
      fromMaster: (v) => v / 0.0000295735296875,
    },
    {
      key: "tablespoonUS",
      label: "Tablespoon (US)",
      symbol: "tbsp",
      color: "orange-600",
      toMaster: (v) => v * 0.00001478676478125,
      fromMaster: (v) => v / 0.00001478676478125,
    },
    {
      key: "teaspoonUS",
      label: "Teaspoon (US)",
      symbol: "tsp",
      color: "orange-600",
      toMaster: (v) => v * 0.00000492892159375,
      fromMaster: (v) => v / 0.00000492892159375,
    },
    {
      key: "barrel",
      label: "Barrel",
      symbol: "bbl",
      color: "red-600",
      toMaster: (v) => v * 0.158987294928,
      fromMaster: (v) => v / 0.158987294928,
    },
    {
      key: "cubicFoot",
      label: "Cubic Foot",
      symbol: "ft³",
      color: "red-600",
      toMaster: (v) => v * 0.0283168465592,
      fromMaster: (v) => v / 0.0283168465592,
    },
    {
      key: "cubicInch",
      label: "Cubic Inch",
      symbol: "in³",
      color: "purple-600",
      toMaster: (v) => v * 0.000016387064,
      fromMaster: (v) => v / 0.000016387064,
    },
    {
      key: "cubicCentimeter",
      label: "Cubic Centimeter",
      symbol: "cm³",
      color: "purple-600",
      toMaster: (v) => v * 0.000001,
      fromMaster: (v) => v / 0.000001,
    },
    {
      key: "gallonImperial",
      label: "Gallon (Imperial)",
      symbol: "gal (UK)",
      color: "teal-600",
      toMaster: (v) => v * 0.00454609,
      fromMaster: (v) => v / 0.00454609,
    },
    {
      key: "pintImperial",
      label: "Pint (Imperial)",
      symbol: "pt (UK)",
      color: "teal-600",
      toMaster: (v) => v * 0.00056826125,
      fromMaster: (v) => v / 0.00056826125,
    },
    {
      key: "fluidOunceImperial",
      label: "Fluid Ounce (Imperial)",
      symbol: "fl oz (UK)",
      color: "teal-600",
      toMaster: (v) => v * 0.0000284130625,
      fromMaster: (v) => v / 0.0000284130625,
    },
  ];

  class Volume {
    #master = persistentState<number | undefined>("volume-master", undefined);
    #units: UnitDefinition[];

    constructor(units: UnitDefinition[]) {
      this.#units = units;
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
  }

  const volume = new Volume(units);

  const converterProps = {
    units,
    formatNumber: formatNumberStandard,
    parseInput: parseInputValue,
    converter: volume,
  };
</script>

<Converter {...converterProps} />
