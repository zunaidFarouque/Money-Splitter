<script lang="ts">
	import { calculateLedgerSettlement, type SettlementPayment } from '$lib/ledgerCalculator';
	import { groups, type Group, type Ledger, type Person } from '$lib/state.svelte';
	import { ArrowRight } from 'lucide-svelte';

	type Props = {
		ledger: Ledger;
		close: () => void;
	};
	let { ledger, close }: Props = $props();

	// Find the group associated with this ledger
	const group = $derived(groups.current.find((g) => g.id === ledger.groupId));

	// Calculate the settlement when the component is created
	const settlementResults = $derived.by(() => {
		if (group && ledger) {
			return calculateLedgerSettlement(ledger, group);
		}
		return null;
	});
</script>

<div class="flex max-h-[80vh] flex-col space-y-4 p-4">
	<header>
		<h3 class="h3">Settlement for "{ledger.name}"</h3>
	</header>

	{#if settlementResults}
		<div class="flex-grow space-y-6 overflow-y-auto">
			<!-- Optimized Payments Section -->
			<div>
				<h4 class="h4 mb-2">Who Pays Whom</h4>
				{#if settlementResults.settlements.length > 0}
					<ul class="list">
						{#each settlementResults.settlements as payment}
							<li class="flex items-center justify-between p-2">
								<div class="flex items-center space-x-2">
									<span class="font-bold">{payment.from}</span>
									<ArrowRight size={16} class="text-primary-500" />
									<span class="font-bold">{payment.to}</span>
								</div>
								<span class="text-primary-500 font-mono text-lg">
									${payment.amount.toFixed(2)}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="p-4 text-center opacity-70">Everyone is settled up!</p>
				{/if}
			</div>

			<!-- Detailed Breakdown Section -->
			<div>
				<h4 class="h4 mb-2">Detailed Breakdown</h4>
				<table class="table-compact table w-full">
					<thead>
						<tr>
							<th class="text-left">Name</th>
							<th class="!text-right">Paid</th>
							<th class="!text-right">Share</th>
							<th class="!text-right">Balance</th>
						</tr>
					</thead>
					<tbody>
						{#each settlementResults.memberBalances as balance}
							<tr>
								<td>{balance.person.name}</td>
								<td class="text-right text-green-500">{balance.totalPaid.toFixed(2)}</td>
								<td class="text-right text-red-500">{balance.totalShare.toFixed(2)}</td>
								<td
									class="text-right font-bold"
									class:text-green-400={balance.netBalance > 0}
									class:text-red-400={balance.netBalance < 0}
								>
									{balance.netBalance.toFixed(2)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<p class="p-4 text-center opacity-70">Could not calculate the settlement.</p>
	{/if}

	<!-- Actions -->
	<footer class="flex justify-end">
		<button class="btn preset-tonal" onclick={close}>Close</button>
	</footer>
</div>
