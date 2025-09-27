<script lang="ts">
	import {
		groups,
		ledgers,
		type Group,
		type Ledger,
		type Payer,
		type Person,
		type Transaction
	} from '$lib/state.svelte';
	import { Check, AlertTriangle } from 'lucide-svelte';

	type Props = {
		ledger: Ledger;
		transactionToEdit?: Transaction | null;
		close: () => void;
	};
	let { ledger, transactionToEdit = null, close }: Props = $props();

	// Find the group associated with this ledger
	const group = $derived(groups.current.find((g) => g.id === ledger.groupId));

	// --- Local state for the form inputs ---
	let description = $state('');
	let totalAmount = $state<number | undefined>(undefined);
	let payersMap = $state<Record<string, number | null>>({});
	let beneficiariesMap = $state<Record<string, boolean>>({});

	// --- Initialize or update form state when props change ---
	$effect(() => {
		// This effect is "keyed" to the transaction being edited.
		// It will re-run ONLY when a new transaction is passed in (or it changes from null to a value).
		const key = transactionToEdit?.id ?? 'new';

		const currentGroup = group; // Get the current value of the derived state
		if (!currentGroup) return;

		if (transactionToEdit) {
			// EDIT MODE: Populate form with existing transaction data
			description = transactionToEdit.description;
			totalAmount = transactionToEdit.totalAmount;
			for (const member of currentGroup.members) {
				const payer = transactionToEdit.payers.find((p) => p.id === member.id);
				payersMap[member.id] = payer ? payer.amount : null;
				beneficiariesMap[member.id] =
					transactionToEdit.beneficiaries.some((b) => b.id === member.id) || false;
			}
		} else {
			// CREATE MODE: Initialize form for a new transaction
			description = '';
			totalAmount = undefined;
			for (const member of currentGroup.members) {
				payersMap[member.id] = null;
				beneficiariesMap[member.id] = true; // Everyone is a beneficiary by default
			}
		}
	});

	// --- Derived State for Validation and UI ---
	const totalPaid = $derived(
		Object.values(payersMap).reduce((sum, amount) => sum + (amount || 0), 0)
	);
	const isTotalMismatch = $derived(
		totalAmount !== undefined && totalAmount > 0 && Math.abs(totalAmount - totalPaid) > 0.001
	);
	const beneficiaryCount = $derived(Object.values(beneficiariesMap).filter((b) => b).length);
	const isFormValid = $derived(
		description.trim() !== '' && totalPaid > 0 && beneficiaryCount > 0 && !isTotalMismatch
	);

	function saveTransaction() {
		if (!isFormValid || !group) return;

		// 1. Construct the list of payers
		const payers: Payer[] = [];
		for (const member of group.members) {
			const paidAmount = payersMap[member.id];
			if (paidAmount && paidAmount > 0) {
				payers.push({ ...member, amount: paidAmount });
			}
		}

		// 2. Construct the list of beneficiaries
		const beneficiaries: Person[] = [];
		for (const member of group.members) {
			if (beneficiariesMap[member.id]) {
				beneficiaries.push(member);
			}
		}

		// Find the ledger we need to update
		const ledgerIndex = ledgers.current.findIndex((l) => l.id === ledger.id);
		if (ledgerIndex === -1) return; // Should not happen

		if (transactionToEdit) {
			// UPDATE existing transaction
			const txIndex = ledgers.current[ledgerIndex].transactions.findIndex(
				(tx) => tx.id === transactionToEdit.id
			);
			if (txIndex > -1) {
				ledgers.current[ledgerIndex].transactions[txIndex] = {
					...transactionToEdit,
					description: description.trim(),
					totalAmount,
					payers,
					beneficiaries
				};
			}
		} else {
			// CREATE new transaction
			const newTransaction: Transaction = {
				id: crypto.randomUUID(),
				description: description.trim(),
				totalAmount,
				payers,
				beneficiaries
			};
			ledgers.current[ledgerIndex].transactions.push(newTransaction);
		}

		// 3. Trigger persistence by re-assigning the store's value
		ledgers.current = [...ledgers.current];

		// 4. Close the modal
		close();
	}

	function toggleAllBeneficiaries() {
		if (!group) return;
		// If everyone is already checked, uncheck all. Otherwise, check all.
		const areAllChecked = beneficiaryCount === group.members.length;
		for (const member of group.members) {
			beneficiariesMap[member.id] = !areAllChecked;
		}
	}
</script>

<div class="flex max-h-[80vh] flex-col space-y-4 p-4">
	<header>
		<h3 class="h3">{transactionToEdit ? 'Edit Expense' : 'Add New Expense'}</h3>
	</header>

	{#if group}
		<div class="flex-grow space-y-4 overflow-y-auto">
			<!-- Expense Details -->
			<div class="space-y-4">
				<label class="label">
					<span>Description</span>
					<input
						class="input"
						type="text"
						placeholder="e.g., Lunch at the cafe"
						bind:value={description}
					/>
				</label>
				<label class="label">
					<span>Total Amount (Optional)</span>
					<input
						class="input"
						type="number"
						placeholder="For verification (e.g., 150)"
						bind:value={totalAmount}
					/>
				</label>
			</div>

			<!-- Payers -->
			<div class="space-y-2">
				<h4 class="h4">Paid By</h4>
				<div class="grid grid-cols-2 gap-4">
					{#each group.members as member (member.id)}
						<label class="label">
							<span>{member.name}</span>
							<input
								class="input"
								type="number"
								placeholder="0.00"
								bind:value={payersMap[member.id]}
							/>
						</label>
					{/each}
				</div>
				<div class="pr-2 text-right font-bold">
					Total Paid:
					<span class:text-error-500={isTotalMismatch}>{totalPaid.toFixed(2)}</span>
				</div>
				{#if isTotalMismatch}
					<div class="alert variant-soft-warning">
						<AlertTriangle />
						<span>The sum of payments does not match the optional total amount.</span>
					</div>
				{/if}
			</div>

			<!-- Beneficiaries -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h4 class="h4">Split Between ({beneficiaryCount})</h4>
					<button class="btn btn-sm" onclick={toggleAllBeneficiaries}>
						{beneficiaryCount === group.members.length ? 'Deselect' : 'Select'} All
					</button>
				</div>
				<div class="grid grid-cols-2 gap-2">
					{#each group.members as member (member.id)}
						<label class="card flex items-center space-x-2 p-2">
							<input type="checkbox" class="checkbox" bind:checked={beneficiariesMap[member.id]} />
							<span>{member.name}</span>
						</label>
					{/each}
				</div>
			</div>
		</div>

		<!-- Form Actions -->
		<footer class="flex justify-end space-x-2">
			<button class="btn preset-tonal" onclick={close}>Cancel</button>
			<button class="btn preset-filled-primary" disabled={!isFormValid} onclick={saveTransaction}>
				{transactionToEdit ? 'Update' : 'Save'} Expense
			</button>
		</footer>
	{:else}
		<div class="alert variant-soft-error">
			<AlertTriangle />
			<span>Could not find the associated group for this ledger.</span>
		</div>
	{/if}
</div>
