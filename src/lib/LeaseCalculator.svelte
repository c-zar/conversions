<script lang="ts">
  import { onMount } from "svelte";
  import { persistentState } from "./utils.svelte";

  // Step-by-step lease calculator state
  // Use persistentState for all user inputs
  const msrp = persistentState<number | undefined>("lease-msrp", undefined);
  const sellingPrice = persistentState<number | undefined>(
    "lease-sellingPrice",
    undefined,
  );
  const additions = persistentState<number>("lease-additions", 0);
  const reductions = persistentState<number>("lease-reductions", 0);
  const residualPercent = persistentState<number | undefined>(
    "lease-residualPercent",
    undefined,
  );
  const leaseTerm = persistentState<number>("lease-leaseTerm", 36);
  const moneyFactor = persistentState<number | undefined>(
    "lease-moneyFactor",
    undefined,
  );
  const apr = persistentState<number | undefined>("lease-apr", undefined);
  const taxRate = persistentState<number>("lease-taxRate", 0);
  const titleFee = persistentState<number>("lease-titleFee", 0);
  const registrationFee = persistentState<number>("lease-registrationFee", 0);
  const miscFee = persistentState<number>("lease-miscFee", 0);
  const dealerDocFee = persistentState<number>("lease-dealerDocFee", 0);
  const acquisitionFee = persistentState<number>("lease-acquisitionFee", 0);

  function handleMoneyFactorInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    moneyFactor.value = isNaN(val) ? undefined : val;
    apr.value =
      typeof moneyFactor.value === "number" && !isNaN(moneyFactor.value)
        ? +(moneyFactor.value * 2400).toFixed(3)
        : undefined;
  }

  function handleAprInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    apr.value = isNaN(val) ? undefined : val;
    moneyFactor.value =
      typeof apr.value === "number" && !isNaN(apr.value)
        ? +(apr.value / 2400).toFixed(6)
        : undefined;
  }

  // Derived variable for whole number tax rate input
  $: taxRateDisplay = Math.round((taxRate.value ?? 0) * 100);
  // Update taxRate.value when user changes the display value
  function handleTaxRateInput(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    taxRate.value = isNaN(val) ? 0 : val / 100;
  }

  // Calculated values (use .value)
  $: adjustedCapCost =
    (sellingPrice.value ?? 0) + additions.value - reductions.value;
  $: residualValue =
    msrp.value && residualPercent.value
      ? msrp.value * (residualPercent.value / 100)
      : 0;
  $: depreciationTotal = adjustedCapCost - residualValue;
  $: rentChargeTotal =
    (adjustedCapCost + residualValue) *
    (moneyFactor.value ?? 0) *
    leaseTerm.value;
  $: baseTotal = depreciationTotal + rentChargeTotal;
  $: totalFees =
    titleFee.value +
    registrationFee.value +
    miscFee.value +
    dealerDocFee.value +
    acquisitionFee.value;
  $: totalLeaseCost = baseTotal + totalFees;
  $: taxAmount = adjustedCapCost * taxRate.value;
  $: totalLeaseCostWithTax = totalLeaseCost + taxAmount;
  $: basePayment = leaseTerm.value > 0 ? baseTotal / leaseTerm.value : 0;
  $: monthlyWithTax =
    leaseTerm.value > 0 ? totalLeaseCostWithTax / leaseTerm.value : 0;

  // Formatting helpers
  function formatCurrency(val: number | undefined) {
    if (val === undefined || isNaN(val)) return "";
    return val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }
  function formatPercent(val: number | undefined) {
    if (val === undefined || isNaN(val)) return "";
    return val.toFixed(2) + "%";
  }

  // Derived state for display purposes
  $: taxRateDisplay = Math.round(taxRate.value * 100);
</script>

<div
  class="bg-white rounded-2xl shadow-lg border border-slate-200 card-hover max-w-3xl mx-auto">
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6 text-slate-800">
      Car Lease Payment Calculator
    </h2>
    <div class="grid gap-6">
      <!-- Step 1: MSRP -->
      <div class="space-y-2">
        <label
          class="block text-sm font-semibold text-slate-700 uppercase tracking-wide"
          for="msrp">1. MSRP (Sticker Price)</label>
        <input
          id="msrp"
          class="w-full px-4 py-3 text-lg font-medium bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={msrp.value}
          placeholder="e.g. 40000" />
      </div>
      <!-- Step 2: Selling Price -->
      <div class="space-y-2">
        <label
          class="block text-sm font-semibold text-slate-700 uppercase tracking-wide"
          for="sellingPrice">2. Negotiated Price (Selling Price)</label>
        <input
          id="sellingPrice"
          class="w-full px-4 py-3 text-lg font-medium bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={sellingPrice.value}
          placeholder="e.g. 37000" />
      </div>
      <!-- Step 3 & 4: Residual % and Lease Term (single row) -->
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Residual % -->
        <div class="flex-1 space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="residualPercent">3. Residual % of MSRP</label>
          <input
            id="residualPercent"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            max="100"
            step="any"
            bind:value={residualPercent.value}
            placeholder="e.g. 60" />
        </div>
        <!-- Lease Term -->
        <div class="flex-1 space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="leaseTerm">4. Lease Term (months)</label>
          <input
            id="leaseTerm"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="1"
            step="1"
            bind:value={leaseTerm.value}
            placeholder="e.g. 36" />
        </div>
      </div>
      <div class="text-slate-600 text-sm">
        Residual Value = MSRP × Residual % = <span class="font-semibold"
          >{formatCurrency(residualValue)}</span>
      </div>
      <!-- Step 5: Additions -->
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="additions">5. Additions</label>
        <input
          id="additions"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={additions.value}
          placeholder="e.g. 1000" />
      </div>
      <!-- Step 6: Reductions -->
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="reductions">6. Reductions</label>
        <input
          id="reductions"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={reductions.value}
          placeholder="e.g. 2000" />
      </div>
      <div class="text-slate-600 text-sm">
        Adjusted Cap Cost = Selling Price + Additions - Reductions = <span
          class="font-semibold">{formatCurrency(adjustedCapCost)}</span>
      </div>
      <div class="text-slate-600 text-sm">
        Depreciation Total = Adj. Cap Cost - Residual = <span
          class="font-semibold">{formatCurrency(depreciationTotal)}</span>
      </div>
      <!-- Step 7: Money Factor -->
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="moneyFactor">7. Money Factor</label>
        <input
          id="moneyFactor"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="0.00000001"
          bind:value={moneyFactor.value}
          on:input={handleMoneyFactorInput}
          placeholder="e.g. 0.00200000"
          inputmode="decimal" />
      </div>
      <!-- Step 8: APR -->
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide mt-2"
          for="apr">8. Interest Rate (APR %)</label>
        <div class="relative">
          <input
            id="apr"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white pr-10"
            type="number"
            min="0"
            step="any"
            bind:value={apr.value}
            on:input={handleAprInput}
            placeholder="e.g. 4.8" />
          <span
            class="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none text-base"
            >%</span>
        </div>
        <div class="text-xs text-slate-400">(Money Factor × 2400 = APR %)</div>
      </div>
      <!-- Step 9: Tax Rate -->
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="taxRate">9. Tax Rate (%)</label>
        <div class="relative">
          <input
            id="taxRate"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white pr-10"
            type="number"
            min="0"
            max="100"
            step="1"
            bind:value={taxRateDisplay}
            placeholder="e.g. 7"
            on:input={handleTaxRateInput} />
          <span
            class="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none text-base"
            >%</span>
        </div>
        <div class="text-xs text-slate-400">
          (Some states tax monthly payment, others tax upfront)
        </div>
      </div>
      <!-- Step 10: Additional Fees -->
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="titleFee">10. Title Fee</label>
        <input
          id="titleFee"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={titleFee.value}
          placeholder="not provided" />
        <div class="text-xs text-slate-400">
          The fee assessed when the title is transferred to the purchaser
        </div>
      </div>
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="registrationFee">Registration Fee</label>
        <input
          id="registrationFee"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={registrationFee.value}
          placeholder="not provided" />
        <div class="text-xs text-slate-400">
          The fee the state charges to register a vehicle, assign a title and
          cover the cost of license plates
        </div>
      </div>
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="miscFee">Miscellaneous</label>
        <input
          id="miscFee"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={miscFee.value}
          placeholder="not provided" />
        <div class="text-xs text-slate-400">
          All other estimated government fees
        </div>
      </div>
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="acquisitionFee">Dealer Acquisition Fee</label>
        <input
          id="acquisitionFee"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={acquisitionFee.value}
          placeholder="e.g. 595" />
        <div class="text-xs text-slate-400">
          A fee charged by the lessor to cover administrative costs.
        </div>
      </div>
      <div class="space-y-2">
        <label
          class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
          for="dealerDocFee"
          >Dealer Documentation/Processing Charge or Fee</label>
        <input
          id="dealerDocFee"
          class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
          type="number"
          min="0"
          step="any"
          bind:value={dealerDocFee.value}
          placeholder="not provided" />
      </div>
      <div class="text-slate-600 text-sm">
        Total Additional Fees = <span class="font-semibold"
          >{formatCurrency(totalFees)}</span>
      </div>
    </div>
  </div>

  <!-- total/summary-->
  <div
    class="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t p-6 rounded-b-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
    <div class="space-y-2">
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Adjusted Cap Cost = Selling Price + Additions - Reductions</span>
        <span class="font-semibold text-right min-w-[8rem]"
          >{formatCurrency(adjustedCapCost)}</span>
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Residual Value = MSRP × Residual %</span>
        <span class="font-semibold text-right min-w-[8rem]"
          >{formatCurrency(residualValue)}</span>
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Depreciation Total = Adj. Cap Cost - Residual</span>
        <span class="font-semibold text-right min-w-[8rem]"
          >{formatCurrency(depreciationTotal)}</span>
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Rent Charge Total = (Adj. Cap Cost + Residual) × MF × Term</span>
        <span class="font-semibold text-right min-w-[8rem]"
          >{formatCurrency(rentChargeTotal)}</span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Base Lease Cost (no fees, no tax)</span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(baseTotal)}</span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Total Fees</span>
        <span class="text-blue-700 text-right min-w-[8rem]">
          {formatCurrency(totalFees)}
        </span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Total Tax</span>
        <span class="text-blue-700 text-right min-w-[8rem]">
          {formatCurrency(taxAmount)}
        </span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Total Lease Cost </span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(totalLeaseCost)}</span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Total Lease Cost (with tax)</span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(totalLeaseCostWithTax)}</span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Monthly Payment (with tax)</span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(monthlyWithTax)}</span>
      </div>
    </div>
  </div>
</div>
