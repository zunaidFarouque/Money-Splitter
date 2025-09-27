<script lang="ts">
	import type { Person, Transaction } from '$lib/state.svelte';
	import { Edit, Trash2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	type Props = {
		transaction: Transaction;
		groupMembers: Person[];
	};
	let { transaction, groupMembers }: Props = $props();

	const dispatch = createEventDispatcher<{
		edit: Transaction;
		delete: string;
	}>();

	// --- Derived values for display ---
	const totalAmount = $derived(transaction.payers.reduce((sum, p) => sum + p.amount, 0).toFixed(2));

	// Correctly determine if the transaction is for everyone
	const isForEveryone = $derived(() => {
		// If group/beneficiary counts don't match, it can't be for everyone
		if (
			!groupMembers ||
			groupMembers.length === 0 ||
			transaction.beneficiaries.length !== groupMembers.length
		) {
			return false;
		}

		// Check if every group member is in the beneficiaries list
		const beneficiaryNames = new Set(transaction.beneficiaries.map((b) => b.name));
		return groupMembers.every((member) => beneficiaryNames.has(member.name));
	});

	function handleEdit() {
		dispatch('edit', transaction);
	}

	function handleDelete() {
		dispatch('delete', transaction.id);
	}
</script>

<div class="card bg-surface-900 space-y-2 p-4">
	<!-- Main Info: Description and Total Amount -->
	<div class="flex items-start justify-between">
		<h3 class="h6 flex-grow">{transaction.description}</h3>
		<span class="bg-surface-800 pl-1 pr-1 text-lg font-bold">${totalAmount}</span>
	</div>

	<div class="bg-surface-800 flex w-full p-2">
		<!-- Left column: Payers -->
		<div class="border-surface-300 flex w-1/2 flex-col items-start space-y-1 border-r pr-4">
			<p class="w-full text-center">Paid By:</p>
			{#if transaction.payers.length > 0}
				{#each transaction.payers as payer (payer.id)}
					<span class="w-full">
						<span class="float-left font-medium">{payer.name}</span>:
						<span class="text-primary-500 float-right font-mono">${payer.amount.toFixed(2)}</span>
					</span>
				{/each}
			{:else}
				<span class="opacity-70">None</span>
			{/if}
		</div>

		<!-- Right column: For / Not For -->
		<div class="flex w-1/2 flex-col items-start space-y-1 pl-4">
			<p class="w-full text-center">For</p>

			{#if transaction.beneficiaries.length === 0}
				<span class="opacity-70">None</span>
			{:else if isForEveryone()}
				<!-- If everyone is involved, show "everyone" and hide Not For -->
				<span class="font-medium">everyone</span>
			{:else}
				<!-- Normal case: show comma-separated beneficiaries -->
				<span class="font-medium">{transaction.beneficiaries.map((b) => b.name).join(', ')}</span>

				<!-- Not For (50% opacity) -->
				<p class="mt-2 w-full text-center opacity-50">Not For</p>
				<span class="opacity-50">
					{(() => {
						// Now we can accurately find who is "Not For"
						const beneficiaryNames = new Set(transaction.beneficiaries.map((b) => b.name));
						const notFor = groupMembers
							.filter((member) => !beneficiaryNames.has(member.name))
							.map((p) => p.name);
						return notFor.length ? notFor.join(', ') : 'None';
					})()}
				</span>
			{/if}
		</div>
	</div>

	<!-- Action Buttons -->
	<footer class="flex justify-between space-x-2">
		<button class="btn preset-filled-warning mb-0 pb-0" onclick={handleDelete}>
			<Trash2 size={16} class="mr-2" />
			Delete
		</button>
		<button class="btn mb-0 pb-0" onclick={handleEdit}>
			<Edit size={16} class="mr-2" />
			Edit
		</button>
	</footer>
</div>
