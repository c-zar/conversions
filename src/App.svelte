<script lang="ts">
  import TemperatureConverter from "./lib/TemperatureConverter.svelte";
  import VolumeConverter from "./lib/VolumeConverter.svelte";
  import LengthConverter from "./lib/LengthConverter.svelte";
  import EnergyConverter from "./lib/EnergyConverter.svelte";
  import LeaseCalculator from "./lib/LeaseCalculator.svelte";

  const pages = [
    {
      id: "temperature",
      label: "Temperature",
      component: TemperatureConverter,
    },
    { id: "volume", label: "Volume", component: VolumeConverter },
    { id: "length", label: "Length", component: LengthConverter },
    { id: "energy", label: "Energy", component: EnergyConverter },
    { id: "lease", label: "Lease", component: LeaseCalculator },
  ] as const;

  let currentPage = $state<(typeof pages)[number]["id"] | "all">("lease");
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
  <div class="max-w-xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
        Unit Converter
      </h1>
      <p class="text-lg text-slate-600 mb-6">
        Convert between different units of measurement instantly
      </p>

      <div
        class="flex flex-wrap justify-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
        {#each pages as { id, label }}
          <button
            class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 {currentPage ===
            id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-700 hover:bg-slate-300 bg-slate-200'}"
            onclick={() => (currentPage = id)}>
            {label}
          </button>
        {/each}
        <button
          class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 {currentPage ===
          'all'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-700 hover:bg-slate-300 bg-slate-200'}"
          onclick={() => (currentPage = "all")}>
          Show All
        </button>
      </div>
    </div>
  </div>
  <div class="mx-auto">
    {#if currentPage === "all"}
      <div class="columns-1 md:columns-2 xl:columns-3 gap-8 mx-auto px-4">
        {#each pages as { label, component: Component }}
          <div class="break-inside-avoid">
            <h2 class="text-2xl text-center font-bold p-4 text-primary-700">
              {label} Converter
            </h2>
            <Component />
          </div>
        {/each}
      </div>
    {:else}
      <div class="max-w-md mx-auto">
        {#each pages as { id, component: Component }}
          {#if currentPage === id}
            <Component />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
