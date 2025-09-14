<script lang="ts">
  import { persistentState } from "./utils.svelte";

  // Helper to create persistent state with default 0
  function pNum(key: string, def = 0) {
    return persistentState<number>(key, def);
  }
  function pNumUndef(key: string) {
    return persistentState<number | undefined>(key, undefined);
  }

  // Lease calculator state
  const msrp = pNumUndef("lease-msrp");
  const msrpDiscount = pNum("lease-msrpDiscount");
  const sellingPrice = pNumUndef("lease-sellingPrice"); // derived
  const additionsBefore = pNum("lease-additionsBefore");
  const reductionsBefore = pNum("lease-reductionsBefore");
  const tradeInValue = pNum("lease-tradeInValue");
  const leaseAdditions = pNum("lease-leaseAdditions");
  const leaseReductions = pNum("lease-leaseReductions");
  const residualPercent = pNumUndef("lease-residualPercent");
  const leaseTerm = pNum("lease-leaseTerm", 36);
  const moneyFactor = pNumUndef("lease-moneyFactor");
  const apr = pNumUndef("lease-apr");
  const taxRate = pNum("lease-taxRate");
  const titleFee = pNum("lease-titleFee");
  const registrationFee = pNum("lease-registrationFee");
  const miscFee = pNum("lease-miscFee");
  const dealerDocFee = pNum("lease-dealerDocFee");
  const acquisitionFee = pNum("lease-acquisitionFee");

  // Tax method state
  const taxMethodState = persistentState<"upfront" | "monthly">(
    "lease-taxMethod",
    "upfront",
  );
  $: taxMethod = taxMethodState.value;
  $: taxMethodState.value = taxMethod;

  // Taxable fees state
  const isTitleFeeTaxableState = persistentState<boolean>(
    "lease-isTitleFeeTaxable",
    false,
  );
  const isRegistrationFeeTaxableState = persistentState<boolean>(
    "lease-isRegistrationFeeTaxable",
    false,
  );
  const isMiscFeeTaxableState = persistentState<boolean>(
    "lease-isMiscFeeTaxable",
    false,
  );
  const isDealerDocFeeTaxableState = persistentState<boolean>(
    "lease-isDealerDocFeeTaxable",
    false,
  );
  const isAcquisitionFeeTaxableState = persistentState<boolean>(
    "lease-isAcquisitionFeeTaxable",
    false,
  );

  $: isTitleFeeTaxable = isTitleFeeTaxableState.value;
  $: isTitleFeeTaxableState.value = isTitleFeeTaxable;

  $: isRegistrationFeeTaxable = isRegistrationFeeTaxableState.value;
  $: isRegistrationFeeTaxableState.value = isRegistrationFeeTaxable;

  $: isMiscFeeTaxable = isMiscFeeTaxableState.value;
  $: isMiscFeeTaxableState.value = isMiscFeeTaxable;

  $: isDealerDocFeeTaxable = isDealerDocFeeTaxableState.value;
  $: isDealerDocFeeTaxableState.value = isDealerDocFeeTaxable;

  $: isAcquisitionFeeTaxable = isAcquisitionFeeTaxableState.value;
  $: isAcquisitionFeeTaxableState.value = isAcquisitionFeeTaxable;

  // Input handlers
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
  function handleTaxRateInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    taxRate.value = isNaN(val) ? 0 : val / 100;
    taxRateDisplay = isNaN(val) ? 0 : val;
  }

  // Derived/calculated values
  $: sellingPrice.value =
    msrp.value !== undefined
      ? Math.max(0, msrp.value - msrpDiscount.value)
      : undefined;
  $: adjustedCapCost =
    (sellingPrice.value ?? 0) + additionsBefore.value - reductionsBefore.value;
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
  // Calculate sum of taxable fees
  $: taxableFees =
    (isTitleFeeTaxable ? titleFee.value : 0) +
    (isRegistrationFeeTaxable ? registrationFee.value : 0) +
    (isMiscFeeTaxable ? miscFee.value : 0) +
    (isDealerDocFeeTaxable ? dealerDocFee.value : 0) +
    (isAcquisitionFeeTaxable ? acquisitionFee.value : 0);
  // Tax calculation based on selected method and taxable fees
  $: taxAmount =
    taxMethod === "upfront"
      ? ((adjustedCapCost ?? 0) + taxableFees) * taxRate.value
      : (baseTotal + taxableFees) * taxRate.value;
  $: totalLeaseCost = baseTotal + totalFees - tradeInValue.value;
  $: totalLeaseCostWithTax =
    totalLeaseCost + taxAmount + leaseAdditions.value - leaseReductions.value;
  $: basePayment = leaseTerm.value > 0 ? baseTotal / leaseTerm.value : 0;
  $: monthlyWithTax =
    leaseTerm.value > 0 ? totalLeaseCostWithTax / leaseTerm.value : 0;
  $: amountFinanced =
    adjustedCapCost + totalFees - tradeInValue.value + taxAmount;

  // Formatting helpers
  function formatCurrency(val: number | undefined | null) {
    if (val === undefined || val === null || isNaN(val)) return "";
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

  // Derived state for display
  $: taxRateDisplay = taxRate.value * 100;

  // DRY input field generator
  /**
   * Usage: {@html inputField({ id, label, bind, placeholder, ... })}
   */
  function inputField({
    id,
    label,
    bind,
    placeholder = "",
    min = 0,
    step = "any",
    readonly = false,
    extra = "",
    inputHandler = undefined,
    type = "number",
    className = "",
    after = "",
    help = "",
  }: {
    id: string;
    label: string;
    bind?: string;
    placeholder?: string;
    min?: number | string;
    step?: number | string;
    readonly?: boolean;
    extra?: string;
    inputHandler?: string;
    type?: string;
    className?: string;
    after?: string;
    help?: string;
  }) {
    // Svelte doesn't allow dynamic bind:value, so this is for markup DRY only
    // Use in markup as a snippet, not as a function call
    return `
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wide" for="${id}">${label}</label>
        <div class="relative">
          <input
            id="${id}"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white ${className}"
            type="${type}"
            min="${min}"
            step="${step}"
            ${readonly ? "readonly" : ""}
            ${bind ? `bind:value={${bind}}` : ""}
            ${inputHandler ? `on:input={${inputHandler}}` : ""}
            placeholder="${placeholder}" ${extra} />
          ${after}
        </div>
        ${help ? `<div class="text-xs text-slate-400">${help}</div>` : ""}
      </div>
    `;
  }
</script>

<div class="">
  <div
    class="bg-white shadow-lg border border-slate-200 max-w-3xl mx-auto"
    id="lease-calculator">
    <div class="p-8">
      <h2 class="text-2xl font-bold text-slate-800">
        Car Lease Payment Calculator
      </h2>
      <div class="grid gap-6">
        <!-- Step 1: MSRP -->
        <div class="space-y-1">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="msrp">
            MSRP (Sticker Price)
          </label>
          <input
            id="msrp"
            class="w-full px-4 py-3 text-lg font-medium bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={msrp.value}
            placeholder="e.g. 40000" />
        </div>
        <!-- Step 2: MSRP Discount -->
        <div class="space-y-1">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="msrpDiscount">
            MSRP Discount
          </label>
          <input
            id="msrpDiscount"
            class="w-full px-4 py-3 text-lg font-medium bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={msrpDiscount.value}
            placeholder="e.g. 3000" />
        </div>
        <!-- Step 3: Selling Price (read-only) -->
        <div class="space-y-1">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="sellingPrice">
            Negotiated Price (Selling Price)
          </label>
          <input
            id="sellingPrice"
            class="w-full px-4 py-3 text-lg font-medium bg-slate-100 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200"
            type="number"
            min="0"
            step="any"
            value={sellingPrice.value}
            readonly
            placeholder="e.g. 37000" />
        </div>
        <!-- Step 4 & 5: Residual % and Lease Term -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="residualPercent">
              Residual % of MSRP
            </label>
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
          <div class="flex-1 space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="leaseTerm">
              Lease Term (months)
            </label>
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
          Residual Value = MSRP × Residual % ={" "}
          <span class="font-semibold">
            {formatCurrency(residualValue)}
          </span>
        </div>
        <!-- Additions/Reductions before/after tax/fees -->
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="additionsBefore">
            Additions to Lease (before tax/fees)
          </label>
          <input
            id="additionsBefore"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={additionsBefore.value}
            placeholder="e.g. 1000" />
        </div>
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="reductionsBefore">
            Reductions to Lease (before tax/fees)
          </label>
          <input
            id="reductionsBefore"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={reductionsBefore.value}
            placeholder="e.g. 2000" />
        </div>
        <div class="text-slate-600 text-sm">
          Adjusted Cap Cost = Selling Price + Additions (before) - Reductions
          (before) ={" "}
          <span class="font-semibold">
            {formatCurrency(adjustedCapCost)}
          </span>
        </div>
        <div class="text-slate-600 text-sm">
          Depreciation Total = Adj. Cap Cost - Residual ={" "}
          <span class="font-semibold">
            {formatCurrency(depreciationTotal)}
          </span>
        </div>
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="leaseAdditions">
            Additions to Lease (after tax/fees)
          </label>
          <input
            id="leaseAdditions"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={leaseAdditions.value}
            placeholder="e.g. 500" />
        </div>
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="leaseReductions">
            Reductions to Lease (after tax/fees)
          </label>
          <input
            id="leaseReductions"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={leaseReductions.value}
            placeholder="e.g. 300" />
        </div>
        <!-- Trade-in Value -->
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="tradeInValue">
            Trade-in Value
          </label>
          <input
            id="tradeInValue"
            class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
            type="number"
            min="0"
            step="any"
            bind:value={tradeInValue.value}
            placeholder="e.g. 5000" />
          <div class="text-xs text-slate-400">
            Value of your current vehicle being traded in
          </div>
        </div>

        <!-- Money Factor & APR -->
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="moneyFactor">
            Money Factor
          </label>
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
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="apr">
            Interest Rate (APR %)
          </label>
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
          <div class="text-xs text-slate-400">
            (Money Factor × 2400 = APR %)
          </div>
        </div>
        <!-- Tax Rate -->
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
            for="taxRate">
            Tax Rate (%)
          </label>
          <div class="relative flex gap-2 items-center">
            <input
              id="taxRate"
              class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white pr-10"
              type="number"
              min="0"
              max="100"
              step="0.01"
              bind:value={taxRateDisplay}
              placeholder="e.g. 7.25"
              on:input={handleTaxRateInput} />
            <span
              class="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none text-base"
              >%</span>
            <select
              class="ml-4 px-2 py-1 border rounded text-xs bg-slate-50"
              bind:value={taxMethod}
              aria-label="Tax Calculation Method">
              <option value="upfront">Tax upfront on adjusted cap cost</option>
              <option value="monthly">Tax monthly payment (most common)</option>
            </select>
          </div>
          <div class="text-xs text-slate-400">
            (Some states tax monthly payment, others tax upfront)
          </div>
        </div>
        <div class="space-y-6">
          <div class="space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="titleFee">Title Fee</label>
            <div class="flex items-center gap-2">
              <input
                id="titleFee"
                class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
                type="number"
                min="0"
                step="any"
                bind:value={titleFee.value}
                placeholder="not provided" />
              <label
                class="inline-flex items-center text-xs ml-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  bind:checked={isTitleFeeTaxable}
                  class="mr-1" />
                Taxable
              </label>
            </div>
            <div class="text-xs text-slate-400">
              The fee assessed when the title is transferred to the purchaser
            </div>
          </div>
          <div class="space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="registrationFee">Registration Fee</label>
            <div class="flex items-center gap-2">
              <input
                id="registrationFee"
                class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
                type="number"
                min="0"
                step="any"
                bind:value={registrationFee.value}
                placeholder="not provided" />
              <label
                class="inline-flex items-center text-xs ml-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  bind:checked={isRegistrationFeeTaxable}
                  class="mr-1" />
                Taxable
              </label>
            </div>
            <div class="text-xs text-slate-400">
              The fee the state charges to register a vehicle, assign a title
              and cover the cost of license plates
            </div>
          </div>
          <div class="space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="miscFee">Miscellaneous</label>
            <div class="flex items-center gap-2">
              <input
                id="miscFee"
                class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
                type="number"
                min="0"
                step="any"
                bind:value={miscFee.value}
                placeholder="not provided" />
              <label
                class="inline-flex items-center text-xs ml-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  bind:checked={isMiscFeeTaxable}
                  class="mr-1" />
                Taxable
              </label>
            </div>
            <div class="text-xs text-slate-400">
              All other estimated government fees
            </div>
          </div>
          <div class="space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="acquisitionFee">Dealer Acquisition Fee</label>
            <div class="flex items-center gap-2">
              <input
                id="acquisitionFee"
                class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
                type="number"
                min="0"
                step="any"
                bind:value={acquisitionFee.value}
                placeholder="e.g. 595" />
              <label
                class="inline-flex items-center text-xs ml-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  bind:checked={isAcquisitionFeeTaxable}
                  class="mr-1" />
                Taxable
              </label>
            </div>
            <div class="text-xs text-slate-400">
              A fee charged by the lessor to cover administrative costs.
            </div>
          </div>
          <div class="space-y-2">
            <label
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              for="dealerDocFee"
              >Dealer Documentation/Processing Charge or Fee</label>
            <div class="flex items-center gap-2">
              <input
                id="dealerDocFee"
                class="w-full px-4 py-2 text-base bg-slate-50 border-2 border-slate-200 rounded-lg input-focus transition-all duration-200 hover:border-slate-300 hover:bg-white"
                type="number"
                min="0"
                step="any"
                bind:value={dealerDocFee.value}
                placeholder="not provided" />
              <label
                class="inline-flex items-center text-xs ml-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  bind:checked={isDealerDocFeeTaxable}
                  class="mr-1" />
                Taxable
              </label>
            </div>
          </div>
          <div class="text-slate-600 text-sm">
            Total Additional Fees =
            <span class="font-semibold">{formatCurrency(totalFees)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Summary -->
  <div
    id="summary"
    class="bg-white/95 backdrop-blur-sm border-t p-6 rounded-b-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
    <div class="space-y-2">
      <div class="text-slate-900 text-lg font-bold">Lease Cost Breakdown</div>
      {#each [{ label: "MSRP (Sticker Price)", value: formatCurrency(msrp.value), strong: true }, { label: "MSRP Discount", value: "- " + formatCurrency(msrpDiscount.value) }, { label: "Selling Price (Negotiated)", value: formatCurrency(sellingPrice.value), strong: true }, { label: "Additions (before tax/fees)", value: "+ " + formatCurrency(additionsBefore.value) }, { label: "Reductions (before tax/fees)", value: "- " + formatCurrency(reductionsBefore.value) }, { label: "Adjusted Cap Cost", value: formatCurrency(adjustedCapCost), strong: true, border: true }, { label: "Residual % of MSRP", value: formatPercent(residualPercent.value) }, { label: "Residual Value", value: formatCurrency(residualValue) }, { label: "Depreciation Total", value: formatCurrency(depreciationTotal) }, { label: "Money Factor", value: moneyFactor.value ?? "" }, { label: "APR (%)", value: apr.value ?? "" }, { label: "Lease Term (months)", value: leaseTerm.value }, { label: "Rent Charge Total", value: formatCurrency(rentChargeTotal) }, { label: "Base Lease Cost (no fees, no tax)", value: formatCurrency(baseTotal), strong: true, border: true }, { label: "Title Fee", value: formatCurrency(titleFee.value) }, { label: "Registration Fee", value: formatCurrency(registrationFee.value) }, { label: "Miscellaneous Fee", value: formatCurrency(miscFee.value) }, { label: "Dealer Doc Fee", value: formatCurrency(dealerDocFee.value) }, { label: "Acquisition Fee", value: formatCurrency(acquisitionFee.value) }, { label: "Total Additional Fees", value: formatCurrency(totalFees), strong: true, border: true }] as row, i}
        <div
          class={`text-slate-${row.strong ? "700 text-base font-semibold" : "600 text-sm"} flex justify-between${row.border ? " border-b pb-1" : ""}`}>
          <span>{row.label}</span>
          <span class="text-right min-w-[8rem]">{row.value}</span>
        </div>
      {/each}
      <div class=" text-slate-800 text-base font-semibold">
        Additions/Reductions After Fees
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Additions (after tax/fees)</span>
        <span class="text-right min-w-[8rem]"
          >+ {formatCurrency(leaseAdditions.value)}</span>
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Reductions (after tax/fees)</span>
        <span class="text-right min-w-[8rem]"
          >- {formatCurrency(leaseReductions.value)}</span>
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Trade-in Value;</span>
        <span class="text-right min-w-[8rem]"
          >- {formatCurrency(tradeInValue.value)}</span>
      </div>
      <div
        class="text-slate-700 text-base font-semibold flex justify-between border-t pt-2">
        <span>Total Lease Cost (Base + Fees)</span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(totalLeaseCost)}</span>
      </div>
      <div class=" text-slate-800 text-base font-semibold">Taxes</div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span>Tax Rate</span>
        <span class="text-right min-w-[8rem]">{taxRateDisplay ?? 0}%</span>
      </div>
      <div class="text-slate-600 text-sm flex justify-between">
        <span
          >Tax Amount {taxMethod === "upfront"
            ? formatCurrency(adjustedCapCost + taxableFees)
            : formatCurrency(baseTotal + taxableFees)} * {taxRateDisplay ??
            0}%</span>
        <span class="text-right min-w-[8rem]">{formatCurrency(taxAmount)}</span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Total Lease Cost + Tax</span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(totalLeaseCost + taxAmount)}</span>
      </div>
      <div class="text-slate-700 text-base font-semibold flex justify-between">
        <span>Total Lease Cost (with tax, additions, reductions)</span>
        <span class="text-blue-700 text-right min-w-[8rem]"
          >{formatCurrency(totalLeaseCostWithTax)}</span>
      </div>
    </div>
    <div
      class="text-slate-900 text-lg font-bold flex justify-between border-t pt-2">
      <span>Monthly Payment (over {leaseTerm.value} months)</span>
      <span class="text-blue-700 text-right min-w-[8rem]"
        >{formatCurrency(monthlyWithTax)}</span>
    </div>
  </div>
</div>
