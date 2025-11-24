<script lang="ts">
	import { calculateAllTransactions } from '$lib/calculator.svelte';
	import {
		appState,
		data,
		// loadExampleDataset, // This will need to be adapted
		mermaidState,
		resetPeopleData
	} from '$lib/state.svelte';
	import { Paperclip } from 'lucide-svelte';
	import autoAnimate from '@formkit/auto-animate';

	// Helper function to load example data with the new store syntax
	function loadExampleDataset() {
		data.reset(); // First, reset to default structure
		// Then, set the new values
		data.current = {
			totalAmount: 100,
			totalNoOfPeople: 10,
			mode: 'simple',
			peopleData: [
				{ id: 1, name: 'a', paid: 12, cost: 10, locked: false },
				{ id: 2, name: 'b', paid: 14, cost: 10, locked: false },
				{ id: 3, name: 'c', paid: 6, cost: 10, locked: false },
				{ id: 4, name: 'd', paid: 9, cost: 10, locked: false },
				{ id: 5, name: 'e', paid: 18, cost: 10, locked: false },
				{ id: 6, name: 'f', paid: 7, cost: 10, locked: false },
				{ id: 7, name: 'g', paid: 3, cost: 10, locked: false },
				{ id: 8, name: 'h', paid: 13, cost: 10, locked: false },
				{ id: 9, name: 'i', paid: 5, cost: 10, locked: false },
				{ id: 10, name: 'j', paid: 13, cost: 10, locked: false }
			]
		};
	}

	let amountToPayPerPerson = $derived(
		Number((data.current.totalAmount / data.current.totalNoOfPeople).toFixed(2))
	);
	let peopleData_sumPaid = $derived(
		data.current.peopleData.reduce((sum, person) => sum + person.paid, 0)
	);
	let peopleData_sumCost = $derived(
		data.current.peopleData.reduce((sum, person) => sum + (person.cost || 0), 0)
	);

	function distributeCosts(changedPersonId?: number) {
		const total = data.current.totalAmount;
		const people = data.current.peopleData;

		// If a specific person changed, lock them
		if (changedPersonId !== undefined) {
			const person = people.find((p) => p.id === changedPersonId);
			if (person) person.locked = true;
		}

		// Calculate locked sum
		const lockedSum = people.reduce((sum, p) => (p.locked ? sum + (p.cost || 0) : sum), 0);
		const remaining = total - lockedSum;

		// Find unlocked people
		const unlockedPeople = people.filter((p) => !p.locked);

		if (unlockedPeople.length > 0) {
			const share = Math.max(0, remaining / unlockedPeople.length);
			// Update unlocked people
			unlockedPeople.forEach((p) => {
				p.cost = Number(share.toFixed(2));
			});

			// Handle rounding errors by adding remainder to the last unlocked person
			const currentSum = people.reduce((sum, p) => sum + (p.cost || 0), 0);
			const diff = total - currentSum;
			if (Math.abs(diff) > 0.001) {
				unlockedPeople[unlockedPeople.length - 1].cost += Number(diff.toFixed(2));
			}
		}
	}

	function resetCalculateButton() {
		appState.current.showOutput = false;
	}

	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade } from 'svelte/transition';
	let modalOpenState_example = $state(false);
	let modalOpenState_reset = $state(false);
	function modalClose() {
		modalOpenState_example = false;
		modalOpenState_reset = false;
	}
</script>

<div class="space-y-4" use:autoAnimate>
	<div class="flex">
		<h4 class="h4 w-full text-left">Overall Scenerio</h4>
		{@render ExampleDatasetLoader()}
		{@render ResetAllData()}
	</div>
	<form class="mx-auto w-full flex-col items-center space-y-4">
		<div class="flex gap-2">
			<label class="label">
				<span class="label-text">Total amount</span>
				<input
					type="number"
					class="input"
					placeholder="Enter Number"
					min="0"
					step="0.01"
					bind:value={data.current.totalAmount}
					oninput={resetCalculateButton}
				/>
			</label>

			<label class="label">
				<span class="label-text">Number of people</span>
				<input
					type="number"
					class="input"
					min="2"
					step="1"
					placeholder="Enter Number"
					bind:value={data.current.totalNoOfPeople}
					oninput={resetCalculateButton}
				/>
			</label>
		</div>
		<p class="text-center">
			Amount to be paid per person: <span class="font-bold">{amountToPayPerPerson}</span>
		</p>

		<button
			type="button"
			class="btn preset-filled w-full print:hidden"
			onclick={() => {
				resetPeopleData(false);
				appState.current.showInputTable = true;
			}}>Start Input</button
		>
	</form>

	{#if appState.current.showInputTable}
		<div class="flex items-center justify-between pt-8">
			<h4 class="h4">People Details</h4>
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium opacity-70">Simple</span>
				<button
					type="button"
					class="relative h-8 w-16 rounded-full transition-all duration-300 {data.current.mode ===
					'advanced'
						? 'from-secondary-500 to-secondary-600 bg-gradient-to-r'
						: 'bg-surface-400-500'}"
					onclick={(e) => {
						data.current.mode = data.current.mode === 'simple' ? 'advanced' : 'simple';
						if (data.current.mode === 'advanced') {
							// Reset locks and distribute equally when switching to advanced
							data.current.peopleData.forEach((p) => (p.locked = false));
							distributeCosts();
						}
					}}
					aria-label="Toggle between Simple and Advanced mode"
				>
					<span
						class="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 {data
							.current.mode === 'advanced'
							? 'translate-x-8'
							: 'translate-x-0'}"
					></span>
				</button>
				<span class="text-sm font-medium opacity-70">Advanced</span>
			</div>
		</div>

		<table class="table">
			<thead>
				<tr>
					<th class="!text-center"><span>ID </span> </th>
					<th class="!text-center"><span>Name </span> </th>
					{#if data.current.mode === 'advanced'}
						<th class="!text-center"><span>Cost (Total: {data.current.totalAmount})</span> </th>
					{/if}
					<th class="!text-center"><span>Amount Paid </span> </th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:preset-outlined-primary-50-950" use:autoAnimate>
				{#each data.current.peopleData as person (person.id)}
					<tr>
						<td>{person.id}</td>
						<td>
							<input
								class="input"
								type="text"
								placeholder="Name"
								bind:value={person.name}
								onclick={() => {
									if (person.name == 'person-' + person.id) person.name = '';
								}}
								onfocusout={() => {
									if (person.name == '') person.name = 'person-' + person.id;
								}}
							/>
						</td>
						{#if data.current.mode === 'advanced'}
							<td>
								<div class="relative">
									{#if person.locked}
										<button
											class="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
											onclick={() => {
												person.locked = false;
												distributeCosts();
											}}
											title="Unlock to auto-calculate"
										>
											🔒
										</button>
									{/if}
									<input
										class="input text-right {person.locked
											? 'border-secondary-500 bg-secondary-500/10 pl-8'
											: ''}"
										type="number"
										placeholder="0.00"
										min="0"
										step="0.01"
										bind:value={person.cost}
										oninput={() => {
											resetCalculateButton();
											distributeCosts(person.id);
										}}
									/>
								</div>
							</td>
						{/if}
						<td>
							<input
								class="input text-right"
								type="number"
								placeholder="0.00"
								min="0"
								step="0.01"
								bind:value={person.paid}
								oninput={resetCalculateButton}
								onclick={() => {
									if (person.paid == 0) person.paid = null!;
								}}
								onfocusout={() => {
									if (person.paid == null) person.paid = 0;
								}}
							/>
						</td>
					</tr>
				{/each}
				<tr>
					<td></td>
					<td class="text-right"> <span class="mx-3"> Total </span> </td>
					{#if data.current.mode === 'advanced'}
						<td class="text-right">
							<span
								class="{Math.abs(peopleData_sumCost - data.current.totalAmount) < 0.01
									? 'text-green-500'
									: 'text-red-500'} mx-3"
							>
								{peopleData_sumCost.toFixed(2)}
							</span>
						</td>
					{/if}
					<td class="text-right">
						<span
							class="{peopleData_sumPaid == data.current.totalAmount
								? 'text-green-500'
								: peopleData_sumPaid > data.current.totalAmount
									? 'text-blue-500'
									: 'text-red-500'} mx-3"
						>
							{peopleData_sumPaid.toFixed(2)}
							{#if peopleData_sumPaid > data.current.totalAmount}
								<span class="text-xs"
									>(Overpaid: +{(peopleData_sumPaid - data.current.totalAmount).toFixed(2)})</span
								>
							{:else if peopleData_sumPaid < data.current.totalAmount}
								<span class="text-xs"
									>(Underpaid: {(peopleData_sumPaid - data.current.totalAmount).toFixed(2)})</span
								>
							{/if}
						</span>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="w-full text-center print:hidden">
			<button
				type="button"
				title={data.current.totalAmount == 0 ||
				(data.current.mode === 'advanced' &&
					Math.abs(peopleData_sumCost - data.current.totalAmount) > 0.01)
					? 'Check the people details table'
					: ''}
				class="btn preset-filled-primary-500 w-1/2"
				disabled={data.current.totalAmount == 0 ||
					(data.current.mode === 'advanced' &&
						Math.abs(peopleData_sumCost - data.current.totalAmount) > 0.01)}
				onclick={() => {
					mermaidState.mermaidString = calculateAllTransactions(data.current);
					appState.current.showOutput = true;
				}}
			>
				{#if !appState.current.showOutput}
					Calculate
				{:else}
					Calculated!
				{/if}
			</button>
		</div>
	{/if}
</div>

<!-- SNIPPETS -->
{#snippet ExampleDatasetLoader()}
	<Modal
		open={modalOpenState_example}
		onOpenChange={(e) => (modalOpenState_example = e.open)}
		triggerBase="btn preset-tonal h-8 mx-2"
		contentBase="card bg-surface-800-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	>
		{#snippet trigger()}
			<Paperclip size={20} />
		{/snippet}
		{#snippet content()}
			<header class="flex justify-between">
				<h4 class="h4">Load Example Dataset?</h4>
			</header>
			<article>
				<p class="opacity-60">It will override current data.</p>
			</article>
			<footer class="flex justify-end gap-4">
				<button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
				<button
					type="button"
					class="btn preset-filled"
					onclick={() => {
						loadExampleDataset();
						modalClose();
					}}>Confirm</button
				>
			</footer>
		{/snippet}
	</Modal>
{/snippet}

{#snippet ResetAllData()}
	<Modal
		open={modalOpenState_reset}
		onOpenChange={(e) => (modalOpenState_reset = e.open)}
		triggerBase="btn preset-tonal h-8"
		contentBase="card bg-surface-800-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	>
		{#snippet trigger()}
			Reset
		{/snippet}
		{#snippet content()}
			<header class="flex justify-between">
				<h4 class="h4">Reset all?</h4>
			</header>
			<article>
				<p class="opacity-60">It will clear all the local storage data, and start from scratch!</p>
			</article>
			<footer class="flex justify-end gap-4">
				<button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
				<button
					type="button"
					class="btn preset-filled-warning-500"
					onclick={() => {
						localStorage.clear();
						location.reload();
					}}>Confirm</button
				>
			</footer>
		{/snippet}
	</Modal>
{/snippet}
