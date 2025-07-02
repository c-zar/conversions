<script lang="ts">
  import TemperatureConverter from "./lib/TemperatureConverter.svelte";
  import VolumeConverter from "./lib/VolumeConverter.svelte";
  import LengthConverter from "./lib/LengthConverter.svelte";

  let currentPage = $state<"temperature" | "volume" | "length">("temperature");
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
        <button
          class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 {currentPage ===
          'temperature'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'}"
          onclick={() => (currentPage = "temperature")}>
          Temperature
        </button>
        <button
          class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 {currentPage ===
          'volume'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'}"
          onclick={() => (currentPage = "volume")}>
          Volume
        </button>
        <button
          class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 {currentPage ===
          'length'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200'}"
          onclick={() => (currentPage = "length")}>
          Length
        </button>
      </div>
    </div>

    {#if currentPage === "temperature"}
      <TemperatureConverter />
    {:else if currentPage === "volume"}
      <VolumeConverter />
    {:else}
      <LengthConverter />
    {/if}
  </div>
</div>
