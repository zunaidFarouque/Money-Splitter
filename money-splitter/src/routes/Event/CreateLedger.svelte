<script lang="ts">
	import { activeLedgerId, groups, ledgers, type Ledger } from '$lib/state.svelte';

	type Props = {
		close: () => void;
	};
	let { close }: Props = $props();

	// --- Local state for the form ---
	let ledgerName = $state('');
	let selectedGroupId = $state<string | null>(null);

	// Safely set the default selection only after the component has mounted
	// and the 'groups' store has had a chance to load.
	$effect(() => {
		if (groups.current && groups.current.length > 0 && selectedGroupId === null) {
			selectedGroupId = groups.current[0].id;
		}
	});

	function validateAndCreate() {
		// Basic validation
		if (!ledgerName.trim() || !selectedGroupId) {
			alert('Please provide a ledger name and select a group.');
			return;
		}

		const newLedger: Ledger = {
			id: crypto.randomUUID(),
			name: ledgerName.trim(),
			groupId: selectedGroupId,
			transactions: []
		};

		// Add the new ledger to our persistent store
		ledgers.current.push(newLedger);
		ledgers.current = [...ledgers.current]; // Re-assign to trigger persistence

		// Set the newly created ledger as the active one
		activeLedgerId.current = newLedger.id;

		// Close the modal
		close();
	}
</script>

<div class="flex max-h-[80vh] flex-col space-y-4 p-4">
	<header>
		<h3 class="h3">Create New Ledger</h3>
	</header>

	<div class="flex-grow space-y-4 overflow-y-auto">
		<!-- Ledger Name Input -->
		<label class="label">
			<span>Ledger Name</span>
			<input class="input" type="text" placeholder="e.g., Goa Trip 2025" bind:value={ledgerName} />
		</label>

		<!-- Group Selection -->
		<label class="label">
			<span>Select a Group</span>
			<!-- FIXED: Add a check to ensure groups.current is an array before rendering -->
			{#if groups.current && groups.current.length > 0}
				<select class="select" bind:value={selectedGroupId}>
					<option value={null} disabled>-- Choose a group --</option>
					{#each groups.current as group (group.id)}
						<option value={group.id}>{group.name}</option>
					{/each}
				</select>
			{:else}
				<div class="card bg-warning-200 p-4 text-center">
					<p>You must create a group first before you can create a ledger.</p>
				</div>
			{/if}
		</label>
	</div>

	<!-- Form Actions -->
	<footer class="flex justify-end space-x-2">
		<button class="btn preset-tonal" onclick={close}>Cancel</button>
		<button
			class="btn preset-filled-primary"
			disabled={!ledgerName.trim() || !selectedGroupId}
			onclick={validateAndCreate}>Create</button
		>
	</footer>
</div>
