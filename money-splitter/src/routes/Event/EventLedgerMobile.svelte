<script lang="ts">
	import {
		activeLedgerId,
		groups,
		ledgers,
		type Transaction,
		type Person,
		loadEventLedgerExample
	} from '$lib/state.svelte';
	import autoAnimate from '@formkit/auto-animate';
	import { Modal } from '@skeletonlabs/skeleton-svelte';

	import ManageGroups from './ManageGroups.svelte';
	import CreateLedger from './CreateLedger.svelte';
	import AddExpense from './AddExpense.svelte';
	import TransactionCard from './TransactionCard.svelte';
	import Settlement from './Settlement.svelte';

	let showManageGroupsModal = $state(false);
	let showCreateLedgerModal = $state(false);
	let showAddExpenseModal = $state(false);
	let showSettlementModal = $state(false);
	let showExampleModal = $state(false);

	// Assuming you have these variables available in this component
	let transactions: Transaction[] = [];

	// State to hold the transaction being edited
	let editingTransaction = $state<Transaction | null>(null);

	const activeLedger = $derived(ledgers.current.find((l) => l.id === activeLedgerId.current));
	// 2. Find the group associated with this ledger
	const activeGroup = $derived(groups.current.find((g) => g.id === activeLedger?.groupId));
	// 3. Get the members of that group. Default to an empty array if not found.
	const groupMembers: Person[] = $derived(activeGroup?.members ?? []);

	function handleAddExpenseClick() {
		editingTransaction = null; // Ensure we're not editing
		showAddExpenseModal = true;
	}

	function handleEditTransaction(event: CustomEvent<Transaction>) {
		editingTransaction = event.detail; // Get the transaction from the event
		showAddExpenseModal = true;
	}

	function handleDeleteTransaction(event: CustomEvent<string>) {
		const transactionIdToDelete = event.detail;
		if (
			!activeLedger ||
			!confirm('Are you sure you want to delete this transaction? This cannot be undone.')
		) {
			return;
		}

		// Find the ledger and filter out the transaction
		const ledgerIndex = ledgers.current.findIndex((l) => l.id === activeLedger.id);
		if (ledgerIndex > -1) {
			ledgers.current[ledgerIndex].transactions = ledgers.current[ledgerIndex].transactions.filter(
				(tx) => tx.id !== transactionIdToDelete
			);
			ledgers.current = [...ledgers.current]; // Trigger persistence
		}
	}
</script>

<div class="space-y-6 p-4" use:autoAnimate>
	<!-- Header Section -->
	<header class="flex items-center justify-between">
		<h1 class="h1">Events</h1>
		<div class="flex flex-wrap justify-end">
			<button
				class="btn preset-tonal mr-2 h-10 w-10 p-0"
				onclick={() => (showExampleModal = true)}
				title="Load Example Dataset"
			>
				📎
			</button>
			<button class="btn preset-tonal mr-2" onclick={() => (showManageGroupsModal = true)}>
				Manage Groups
			</button>
			<button
				class="btn preset-filled-primary-100-900"
				onclick={() => (showCreateLedgerModal = true)}
			>
				+ New Ledger
			</button>
		</div>
	</header>

	<!-- Ledger Selection -->
	{#if ledgers.current && ledgers.current.length > 0}
		<div class="flex items-center space-x-2">
			<span class="font-bold">Active Ledger:</span>
			<select class="select" bind:value={activeLedgerId.current}>
				<option value={null} disabled selected>-- Select a Ledger --</option>
				{#each ledgers.current as ledger (ledger.id)}
					<option value={ledger.id}>{ledger.name}</option>
				{/each}
			</select>
		</div>
	{:else}
		<div class="card bg-surface-900 space-y-4 p-8 text-center">
			<h3 class="h3">Welcome!</h3>
			<p>Create your first ledger to start tracking expenses for a trip or event.</p>
			<button class="btn preset-filled-primary" onclick={() => (showCreateLedgerModal = true)}>
				Create a Ledger
			</button>
		</div>
	{/if}

	<!-- Transaction List for the Active Ledger -->
	{#if activeLedger}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="h2">Transactions</h2>
				<div class="flex space-x-2">
					<button class="btn preset-filled" onclick={() => (showSettlementModal = true)}>
						Settle Up
					</button>
				</div>
			</div>

			{#if activeLedger.transactions.length > 0}
				<div class="space-y-4" use:autoAnimate>
					{#each activeLedger.transactions as transaction (transaction.id)}
						<TransactionCard
							{transaction}
							{groupMembers}
							on:delete={handleDeleteTransaction}
							on:edit={handleEditTransaction}
						/>
					{/each}
				</div>
			{:else}
				<div class="p-8 text-center opacity-70">
					<p>No expenses logged for "{activeLedger.name}" yet.</p>
					<p>Click "+ Add Expense" to get started!</p>
				</div>
			{/if}
		</div>
	{/if}

	<button class="btn preset-filled w-full" onclick={handleAddExpenseClick}> + Add Expense </button>

	<!-- Modals -->
	<Modal
		open={showManageGroupsModal}
		onOpenChange={(e) => (showManageGroupsModal = e.open)}
		contentBase="w-full max-w-md bg-surface-900"
	>
		{#snippet content()}
			<ManageGroups close={() => (showManageGroupsModal = false)} />
		{/snippet}
	</Modal>

	<Modal
		open={showCreateLedgerModal}
		onOpenChange={(e) => (showCreateLedgerModal = e.open)}
		contentBase="w-full max-w-md bg-surface-900"
	>
		{#snippet content()}
			<CreateLedger close={() => (showCreateLedgerModal = false)} />
		{/snippet}
	</Modal>

	<Modal
		open={showAddExpenseModal}
		onOpenChange={(e) => (showAddExpenseModal = e.open)}
		contentBase="w-full max-w-lg bg-surface-900"
	>
		{#snippet content()}
			{#if activeLedger}
				<AddExpense
					ledger={activeLedger}
					transactionToEdit={editingTransaction}
					close={() => (showAddExpenseModal = false)}
				/>
			{/if}
		{/snippet}
	</Modal>

	<Modal
		open={showSettlementModal}
		onOpenChange={(e) => (showSettlementModal = e.open)}
		contentBase="w-full max-w-lg bg-surface-900"
	>
		{#snippet content()}
			{#if activeLedger}
				<Settlement ledger={activeLedger} close={() => (showSettlementModal = false)} />
			{/if}
		{/snippet}
	</Modal>

	<!-- Example Dataset Modal -->
	<Modal
		open={showExampleModal}
		onOpenChange={(e) => (showExampleModal = e.open)}
		contentBase="card bg-surface-800-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	>
		{#snippet content()}
			<header class="flex justify-between">
				<h4 class="h4">Load Example Dataset?</h4>
			</header>
			<article>
				<p class="opacity-60">
					This will create a sample "Japan Trip 2024" group with 4 members and a "Tokyo Expenses"
					ledger with 6 example transactions.
				</p>
			</article>
			<footer class="flex justify-end gap-4">
				<button type="button" class="btn preset-tonal" onclick={() => (showExampleModal = false)}>
					Cancel
				</button>
				<button
					type="button"
					class="btn preset-filled"
					onclick={() => {
						loadEventLedgerExample();
						showExampleModal = false;
					}}
				>
					Confirm
				</button>
			</footer>
		{/snippet}
	</Modal>
</div>
