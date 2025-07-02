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
      key: "j",
      label: "Joule",
      symbol: "J",
      color: "primary-600",
      isMaster: true,
      toMaster: (j) => j,
      fromMaster: (j) => j,
    },
    {
      key: "kj",
      label: "Kilojoule",
      symbol: "kJ",
      color: "blue-600",
      toMaster: (kj) => kj * 1000,
      fromMaster: (j) => j / 1000,
    },
    {
      key: "cal",
      label: "Calorie",
      symbol: "cal",
      color: "orange-600",
      toMaster: (cal) => cal * 4.184,
      fromMaster: (j) => j / 4.184,
    },
    {
      key: "kcal",
      label: "Kilocalorie",
      symbol: "kcal",
      color: "red-600",
      toMaster: (kcal) => kcal * 4184,
      fromMaster: (j) => j / 4184,
    },
    {
      key: "btu",
      label: "British Thermal Unit",
      symbol: "BTU",
      color: "teal-600",
      toMaster: (btu) => btu * 1055.06,
      fromMaster: (j) => j / 1055.06,
    },
    {
      key: "ev",
      label: "Electronvolt",
      symbol: "eV",
      color: "purple-600",
      toMaster: (ev) => ev * 1.602176634e-19,
      fromMaster: (j) => j / 1.602176634e-19,
    },
    {
      key: "wh",
      label: "Watt-hour",
      symbol: "Wh",
      color: "green-600",
      toMaster: (wh) => wh * 3600,
      fromMaster: (j) => j / 3600,
    },
    {
      key: "kwh",
      label: "Kilowatt-hour",
      symbol: "kWh",
      color: "slate-600",
      toMaster: (kwh) => kwh * 3600000,
      fromMaster: (j) => j / 3600000,
    },
    {
      key: "erg",
      label: "Erg",
      symbol: "erg",
      color: "pink-600",
      toMaster: (erg) => erg * 1e-7,
      fromMaster: (j) => j / 1e-7,
    },
    {
      key: "thm",
      label: "Therm",
      symbol: "thm",
      color: "amber-600",
      toMaster: (thm) => thm * 105505.585,
      fromMaster: (j) => j / 105505.585,
    },
    {
      key: "ftlb",
      label: "Foot-pound",
      symbol: "ft·lb",
      color: "lime-600",
      toMaster: (ftlb) => ftlb * 1.3558179483314004,
      fromMaster: (j) => j / 1.3558179483314004,
    },
    {
      key: "hph",
      label: "Horsepower-hour",
      symbol: "hp·h",
      color: "cyan-600",
      toMaster: (hph) => hph * 2684519.54,
      fromMaster: (j) => j / 2684519.54,
    },
    {
      key: "tnt",
      label: "Tonne of TNT",
      symbol: "tTNT",
      color: "yellow-700",
      toMaster: (tnt) => tnt * 4.184e9,
      fromMaster: (j) => j / 4.184e9,
    },
  ];

  class Energy {
    #master = persistentState<number | undefined>("energy-master", undefined);
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

  const energy = new Energy(units);

  const converterProps = {
    units,
    formatNumber: formatNumberStandard,
    parseInput: parseInputValue,
    converter: energy,
  };
</script>

<Converter {...converterProps} />
