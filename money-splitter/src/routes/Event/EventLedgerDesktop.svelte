<script lang="ts">
	import {
		activeLedgerId,
		ledgers,
		groups,
		type Transaction,
		type Payer,
		type Person
	} from '$lib/state.svelte';
	import autoAnimate from '@formkit/auto-animate';
	import { Modal, Popover } from '@skeletonlabs/skeleton-svelte';

	import ManageGroups from './ManageGroups.svelte';
	import CreateLedger from './CreateLedger.svelte';
	import Settlement from './Settlement.svelte';
	import PayersPopover from './PayersPopover.svelte';
	import BeneficiariesPopover from './BeneficiariesPopover.svelte';

	let showManageGroupsModal = $state(false);
	let showCreateLedgerModal = $state(false);
	let showSettlementModal = $state(false);

	const activeLedger = $derived(ledgers.current?.find((l) => l.id === activeLedgerId.current));
	const activeGroup = $derived(
		activeLedger ? groups.current.find((g) => g.id === activeLedger.groupId) : null
	);

	// --- New Transaction State ---
	let newTxDescription = $state('');
	let newTxPayers = $state<Payer[]>([]);
	let newTxBeneficiaries = $state<Person[]>([]);

	$effect(() => {
		if (activeLedger) {
			resetNewTransaction();
		}
	});

	function resetNewTransaction() {
		newTxDescription = '';
		newTxPayers = [];
		newTxBeneficiaries = activeGroup?.members ?? [];
	}

	function addNewTransaction() {
		const totalPaid = newTxPayers.reduce((sum, p) => sum + p.amount, 0);
		if (!activeLedger || !newTxDescription.trim() || totalPaid <= 0) {
			alert('Please provide a description and at least one payer.');
			return;
		}

		const newTransaction: Transaction = {
			id: crypto.randomUUID(),
			description: newTxDescription.trim(),
			payers: newTxPayers,
			beneficiaries: newTxBeneficiaries
		};

		const ledgerIndex = ledgers.current.findIndex((l) => l.id === activeLedger.id);
		if (ledgerIndex > -1) {
			ledgers.current[ledgerIndex].transactions.push(newTransaction);
			ledgers.current = [...ledgers.current];
		}

		resetNewTransaction();
	}

	function updateTransaction() {
		ledgers.current = [...ledgers.current];
	}

	function deleteTransaction(txId: string) {
		if (!activeLedger) return;
		const ledgerIndex = ledgers.current.findIndex((l) => l.id === activeLedger.id);
		if (ledgerIndex > -1) {
			ledgers.current[ledgerIndex].transactions = ledgers.current[ledgerIndex].transactions.filter(
				(tx) => tx.id !== txId
			);
			ledgers.current = [...ledgers.current];
		}
	}

	function confirmDeleteTransaction() {
		if (!activeLedger || !transactionToDelete) return;
		const ledgerIndex = ledgers.current.findIndex((l) => l.id === activeLedger.id);
		if (ledgerIndex > -1) {
			ledgers.current[ledgerIndex].transactions = ledgers.current[ledgerIndex].transactions.filter(
				(tx) => tx.id !== transactionToDelete!.id
			);
			ledgers.current = [...ledgers.current];
		}
		// Close the modal and clear the state
		showDeleteModal = false;
		transactionToDelete = null;
	}

	function promptDeleteTransaction(tx: Transaction) {
		transactionToDelete = tx; // Store the transaction
		showDeleteModal = true; // Open the modal
	}

	///
	///
	//

	let payersPopoverStates = $state<Record<string, boolean>>({});
	let beneficiariesPopoverStates = $state<Record<string, boolean>>({});
	let newTxBeneficiariesPopoverOpen = $state(false);
	let newTxPayersPopoverOpen = $state(false);

	let showDeleteModal = $state(false);
	let transactionToDelete = $state<Transaction | null>(null);
</script>

<div class="space-y-6 p-4" use:autoAnimate>
	<!-- Header Section -->
	<header class="flex items-center justify-between">
		<h1 class="h1">Events</h1>
		<div>
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
			<button class="btn preset-filled" onclick={() => (showCreateLedgerModal = true)}>
				Create a Ledger
			</button>
		</div>
	{/if}

	<!-- Transaction Table -->
	{#if activeLedger && activeGroup}
		<div class="flex items-center justify-between">
			<h2 class="h3">Transactions for "{activeLedger.name}"</h2>
			<button class="btn preset-filled" onclick={() => (showSettlementModal = true)}>
				Settle Up
			</button>
		</div>

		<div class="table-container">
			<table class="table-interactive table">
				<thead>
					<tr>
						<th class="w-1">#</th>
						<th class="w-4/12">Description</th>
						<th class="!text-left">Paid By</th>
						<th class="!text-center">Beneficiaries</th>
						<th class="!text-right">Total</th>
						<th class="!text-center">
							<!-- removed text to save space -->
						</th>
					</tr>
				</thead>
				<tbody use:autoAnimate>
					<!-- Existing Transactions -->
					{#each activeLedger.transactions as tx (tx.id)}
						<tr>
							<td>
								{activeLedger.transactions.indexOf(tx) + 1}
							</td>
							<td
								class="borderra resize-none overflow-y-hidden align-middle hover:border"
								bind:innerText={tx.description}
								contenteditable="true"
								onchange={updateTransaction}
							></td>
							<!-- <div></div> -->
							<!-- <textarea
									class="input resize-none overflow-y-hidden "
									rows="2"
									bind:value={tx.description}
									onchange={updateTransaction}
								>
								</textarea> -->
							<td>
								<Popover
									open={payersPopoverStates[tx.id]}
									onOpenChange={(e) => (payersPopoverStates[tx.id] = e.open)}
									positioning={{ placement: 'bottom' }}
									contentBase="w-72 card p-4 space-y-4"
									triggerBase="w-full"
									zIndex="99"
								>
									{#snippet trigger()}
										<button class="btn !h-auto !min-h-10 w-full">
											<div class="flex w-full flex-col items-start">
												{#if tx.payers.length > 0}
													{#each tx.payers as payer (payer.id)}
														<span class="w-full">
															<span class="float-left font-medium">{payer.name}</span>:
															<span class=" text-primary-500 float-right font-mono"
																>${payer.amount.toFixed(2)}</span
															>
														</span>
													{/each}
												{:else}
													<span class="opacity-70">None</span>
												{/if}
											</div>
										</button>
									{/snippet}
									{#snippet content()}
										<PayersPopover
											payers={tx.payers}
											group={activeGroup}
											onSave={({ payers }) => {
												tx.payers = payers;
												updateTransaction();
												payersPopoverStates[tx.id] = false;
											}}
										/>
									{/snippet}
								</Popover>
							</td>
							<td>
								<Popover
									open={beneficiariesPopoverStates[tx.id]}
									onOpenChange={(e) => (beneficiariesPopoverStates[tx.id] = e.open)}
									positioning={{ placement: 'bottom' }}
									contentBase="w-72 card p-4 space-y-4"
								>
									{#snippet trigger()}
										<!-- <button class="btn btn-sm w-full text-left">
											{tx.beneficiaries.length === activeGroup.members.length
												? 'Everyone'
												: tx.beneficiaries.map((b) => b.name).join(', ') || 'None'}
										</button> -->

										<div class="flex flex-col items-start space-y-1 pl-4">
											<!-- <p class="w-full text-center text-xs">Yes:</p> -->
											{#if tx.beneficiaries.length === 0}
												<span class="opacity-70">None</span>
											{:else if tx.beneficiaries.length === activeGroup.members.length}
												<span class="font-medium">Everyone</span>
											{:else}
												<span class="font-medium"
													>{tx.beneficiaries.map((b) => b.name).join(', ')}</span
												>

												<p class="mt-2 w-full text-left text-sm opacity-50">
													<span class="italic"> Not included: </span>
													{activeGroup.members
														.filter((m) => !tx.beneficiaries.some((b) => b.id === m.id))
														.map((m) => m.name)
														.join(', ') || 'None'}
												</p>
											{/if}
										</div>
									{/snippet}
									{#snippet content()}
										<BeneficiariesPopover
											beneficiaries={tx.beneficiaries}
											group={activeGroup}
											onSave={({ beneficiaries }) => {
												tx.beneficiaries = beneficiaries;
												updateTransaction();
												beneficiariesPopoverStates[tx.id] = false;
											}}
										/>
									{/snippet}
								</Popover>
							</td>
							<td class="text-right font-bold">
								${tx.payers.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
							</td>
							<td class="text-center">
								<button class="btn-icon btn-icon-sm" onclick={() => promptDeleteTransaction(tx)}>
									🗑️
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
				<!-- New Transaction Row -->
				<tfoot>
					<tr>
						<td></td>
						<td>
							<input
								type="text"
								class="input"
								placeholder="Add new expense..."
								bind:value={newTxDescription}
								onkeydown={(e) => e.key === 'Enter' && addNewTransaction()}
							/>
						</td>
						<!-- Popover for adding new payers -->
						<td>
							<Popover
								open={newTxPayersPopoverOpen}
								onOpenChange={(e) => (newTxPayersPopoverOpen = e.open)}
								positioning={{ placement: 'top' }}
								contentBase="w-72 card p-4 space-y-4"
							>
								{#snippet trigger()}
									<button class="btn btn-sm w-full text-left">
										{newTxPayers.map((p) => p.name).join(', ') || '+ Add Payers'}
									</button>
								{/snippet}
								{#snippet content()}
									<PayersPopover
										payers={newTxPayers}
										group={activeGroup}
										onSave={({ payers }) => {
											newTxPayers = payers;
											newTxPayersPopoverOpen = false;
										}}
									/>
								{/snippet}
							</Popover>
						</td>

						<!-- Popover for adding new beneficiaries -->
						<td>
							<Popover
								open={newTxBeneficiariesPopoverOpen}
								onOpenChange={(e) => (newTxBeneficiariesPopoverOpen = e.open)}
								positioning={{ placement: 'top' }}
								contentBase="w-72 card p-4 space-y-4"
							>
								{#snippet trigger()}
									<button class="btn btn-sm text-left">
										{newTxBeneficiaries.length === activeGroup.members.length
											? 'Everyone'
											: newTxBeneficiaries.map((b) => b.name).join(', ') || '+ Add Beneficiaries'}
									</button>
								{/snippet}
								{#snippet content()}
									<BeneficiariesPopover
										beneficiaries={newTxBeneficiaries}
										group={activeGroup}
										onSave={({ beneficiaries }) => {
											newTxBeneficiaries = beneficiaries;
											newTxBeneficiariesPopoverOpen = false;
										}}
									/>
								{/snippet}
							</Popover>
						</td>
						<td class="text-right" colspan="2">
							<button class="btn btn-sm preset-filled-primary w-full" onclick={addNewTransaction}>
								Add
							</button>
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	{/if}

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
	<!-- NEW: Delete Confirmation Modal -->
	<Modal open={showDeleteModal} contentBase="w-full max-w-lg bg-surface-900">
		{#snippet content()}
			{#if transactionToDelete}
				<div class="space-y-4 p-4">
					<h3 class="h3">Delete Transaction?</h3>
					<!-- It displays info from transactionToDelete -->
					<div class="card variant-soft p-4">
						<p class="text-lg font-bold">{transactionToDelete.description}</p>
						<div class="flex w-full">
							<!-- Left column: Payers (50%) with right border as separator -->
							<div
								class="border-surface-300 mb-4 mt-4 flex w-1/2 flex-col items-start space-y-1 border-r pr-4"
							>
								<p class="w-full text-center">Payers</p>
								{#if transactionToDelete.payers.length > 0}
									{#each transactionToDelete.payers as payer (payer.id)}
										<span class="w-full">
											<span class="font-medium">{payer.name}</span>:
											<span class="text-primary-500 float-right font-mono"
												>${payer.amount.toFixed(2)}</span
											>
										</span>
									{/each}
								{:else}
									<span class="opacity-70">None</span>
								{/if}
							</div>

							<!-- Right column: Beneficiaries (50%) -->
							<div class="flex w-1/2 flex-col items-start space-y-1 pl-4">
								<p class="w-full text-center">Beneficiaries</p>
								{#if transactionToDelete.beneficiaries.length === activeGroup!.members.length}
									<span>Everyone</span>
								{:else if transactionToDelete.beneficiaries.length > 0}
									{#each transactionToDelete.beneficiaries as b (b.id)}
										<span>{b.name}</span>
									{/each}
								{:else}
									<span class="opacity-70">None</span>
								{/if}
							</div>
						</div>

						<p>
							Total amount: ${(
								transactionToDelete.totalAmount ??
								(transactionToDelete.payers ?? []).reduce((sum, p) => sum + p.amount, 0)
							).toFixed(2)}
						</p>
					</div>
					<footer class="flex justify-end space-x-2">
						<button class="btn preset-tonal" onclick={() => (showDeleteModal = false)}>
							Cancel
						</button>
						<!-- The confirm button calls the actual delete function -->
						<button class="btn preset-filled-warning" onclick={confirmDeleteTransaction}>
							Confirm Delete
						</button>
					</footer>
				</div>
			{/if}
		{/snippet}
	</Modal>
</div>
