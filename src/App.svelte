<script lang="ts">
  import TemperatureConverter from "./lib/TemperatureConverter.svelte";
  import VolumeConverter from "./lib/VolumeConverter.svelte";
  import LengthConverter from "./lib/LengthConverter.svelte";
  import EnergyConverter from "./lib/EnergyConverter.svelte";

  const pages = [
    {
      id: "temperature",
      label: "Temperature",
      component: TemperatureConverter,
    },
    { id: "volume", label: "Volume", component: VolumeConverter },
    { id: "length", label: "Length", component: LengthConverter },
    { id: "energy", label: "Energy", component: EnergyConverter },
  ] as const;

  let currentPage = $state<(typeof pages)[number]["id"]>("temperature");
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
  <div class="max-w-2xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
        Unit Converter
      </h1>
      <p class="text-lg text-slate-600 mb-6">
        Convert between different units of measurement instantly
      </p>

      <div
        class="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
        {#each pages as { id, label }}
          <button
            class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 {currentPage ===
            id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'}"
            onclick={() => (currentPage = id)}>
            {label}
          </button>
        {/each}
      </div>
    </div>

    {#each pages as { id, component: Component }}
      {#if currentPage === id}
        <Component />
      {/if}
    {/each}
  </div>
</div>
