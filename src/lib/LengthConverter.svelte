<script lang="ts">
  import Converter from "./Converter.svelte";
  import type { BaseConverterProps } from "./types";
  import {
    formatNumberStandard,
    parseInputValue,
    persistentState,
  } from "./utils.svelte";
  import type { UnitDefinition } from "./types";

  const units: UnitDefinition[] = [
    {
      key: "meter",
      label: "Meter",
      symbol: "m",
      color: "emerald-600",
      isMaster: true,
      toMaster: (v) => v,
      fromMaster: (v) => v,
    },
    {
      key: "kilometer",
      label: "Kilometer",
      symbol: "km",
      color: "emerald-600",
      toMaster: (v) => v * 1000,
      fromMaster: (v) => v / 1000,
    },
    {
      key: "centimeter",
      label: "Centimeter",
      symbol: "cm",
      color: "amber-500",
      toMaster: (v) => v * 0.01,
      fromMaster: (v) => v / 0.01,
    },
    {
      key: "millimeter",
      label: "Millimeter",
      symbol: "mm",
      color: "amber-500",
      toMaster: (v) => v * 0.001,
      fromMaster: (v) => v / 0.001,
    },
    {
      key: "inch",
      label: "Inch",
      symbol: "in",
      color: "violet-500",
      toMaster: (v) => v * 0.0254,
      fromMaster: (v) => v / 0.0254,
    },
    {
      key: "foot",
      label: "Foot",
      symbol: "ft",
      color: "violet-500",
      toMaster: (v) => v * 0.3048,
      fromMaster: (v) => v / 0.3048,
    },
    {
      key: "yard",
      label: "Yard",
      symbol: "yd",
      color: "rose-500",
      toMaster: (v) => v * 0.9144,
      fromMaster: (v) => v / 0.9144,
    },
    {
      key: "mile",
      label: "Mile",
      symbol: "mi",
      color: "rose-500",
      toMaster: (v) => v * 1609.344,
      fromMaster: (v) => v / 1609.344,
    },
    {
      key: "nauticalMile",
      label: "Nautical Mile",
      symbol: "nmi",
      color: "cyan-500",
      toMaster: (v) => v * 1852,
      fromMaster: (v) => v / 1852,
    },
    {
      key: "astronomicalUnit",
      label: "Astronomical Unit",
      symbol: "AU",
      color: "cyan-500",
      toMaster: (v) => v * 1.496e11,
      fromMaster: (v) => v / 1.496e11,
    },
    {
      key: "lightYear",
      label: "Light Year",
      symbol: "ly",
      color: "cyan-500",
      toMaster: (v) => v * 9.461e15,
      fromMaster: (v) => v / 9.461e15,
    },
    {
      key: "parsec",
      label: "Parsec",
      symbol: "pc",
      color: "cyan-500",
      toMaster: (v) => v * 3.086e16,
      fromMaster: (v) => v / 3.086e16,
    },
  ];

  class Length {
    #master = persistentState<number | undefined>("length-master", undefined);
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

  const length = new Length(units);

  const converterProps: BaseConverterProps = {
    units,
    formatNumber: formatNumberStandard,
    parseInput: parseInputValue,
    converter: length,
  };
</script>

<Converter {...converterProps} />
