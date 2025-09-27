<script lang="ts">
	import type { Group, Payer } from '$lib/state.svelte';

	type Props = {
		payers: Payer[];
		group: Group;
		onSave: (detail: { payers: Payer[] }) => void;
	};
	let { payers, group, onSave }: Props = $props();

	let payersMap = $state<Record<string, number | null>>({});

	$effect(() => {
		const tempMap: Record<string, number | null> = {};
		for (const member of group.members) {
			const existingPayer = payers.find((p) => p.id === member.id);
			tempMap[member.id] = existingPayer ? existingPayer.amount : null;
		}
		payersMap = tempMap;
	});

	function savePayers() {
		const newPayers: Payer[] = [];
		for (const member of group.members) {
			const paidAmount = payersMap[member.id];
			if (paidAmount && paidAmount > 0) {
				newPayers.push({ ...member, amount: paidAmount });
			}
		}
		// Call the prop directly instead of dispatching
		onSave({ payers: newPayers });
	}
</script>

<div class="card bg-surface-900 space-y-4 p-4 shadow-xl">
	<h3 class="h3">Edit Payers</h3>
	<div class="max-h-64 space-y-2 overflow-y-auto">
		{#each group.members as member (member.id)}
			<label class="label">
				<span>{member.name}</span>
				<input class="input" type="number" placeholder="0.00" bind:value={payersMap[member.id]} />
			</label>
		{/each}
	</div>
	<footer class="flex justify-end">
		<button class="btn preset-filled-primary" onclick={savePayers}>Done</button>
	</footer>
</div>
