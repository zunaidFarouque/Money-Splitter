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
			peopleData: [
				{ id: 1, name: 'a', paid: 12 },
				{ id: 2, name: 'b', paid: 14 },
				{ id: 3, name: 'c', paid: 6 },
				{ id: 4, name: 'd', paid: 9 },
				{ id: 5, name: 'e', paid: 18 },
				{ id: 6, name: 'f', paid: 7 },
				{ id: 7, name: 'g', paid: 3 },
				{ id: 8, name: 'h', paid: 13 },
				{ id: 9, name: 'i', paid: 5 },
				{ id: 10, name: 'j', paid: 13 }
			]
		};
	}

	let amountToPayPerPerson = $derived(
		Number((data.current.totalAmount / data.current.totalNoOfPeople).toFixed(2))
	);
	let peopleData_sumPaid = $derived(
		data.current.peopleData.reduce((sum, person) => sum + person.paid, 0)
	);

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
		<h4 class="h4 pt-8">People Details</h4>
		<table class="table">
			<thead>
				<tr>
					<th class="!text-center"><span>ID </span> </th>
					<th class="!text-center"><span>Name </span> </th>
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
						<td>
							<input
								class="input text-right"
								type="number"
								placeholder="0.00"
								min="0"
								step="0.01"
								bind:value={person.paid}
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
					<td class="text-right">
						<span
							class="{peopleData_sumPaid == data.current.totalAmount
								? 'text-green-500'
								: 'text-red-500'} mx-3"
						>
							{peopleData_sumPaid}
							{peopleData_sumPaid == data.current.totalAmount
								? ''
								: '  (Mismatch: ' + (peopleData_sumPaid - data.current.totalAmount) + ')'}
						</span>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="w-full text-center print:hidden">
			<button
				type="button"
				title={data.current.totalAmount == 0 || peopleData_sumPaid != data.current.totalAmount
					? 'Check the people details table'
					: ''}
				class="btn preset-filled-primary-500 w-1/2"
				disabled={data.current.totalAmount == 0 || peopleData_sumPaid != data.current.totalAmount}
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
