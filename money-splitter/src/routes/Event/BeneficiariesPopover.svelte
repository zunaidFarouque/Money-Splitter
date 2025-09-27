<script lang="ts">
	import type { Group, Person } from '$lib/state.svelte';

	type Props = {
		beneficiaries: Person[];
		group: Group;
		onSave: (detail: { beneficiaries: Person[] }) => void;
	};
	let { beneficiaries, group, onSave }: Props = $props();

	let beneficiariesMap = $state<Record<string, boolean>>({});

	$effect(() => {
		const tempMap: Record<string, boolean> = {};
		for (const member of group.members) {
			tempMap[member.id] = beneficiaries.some((b) => b.id === member.id);
		}
		beneficiariesMap = tempMap;
	});

	function saveBeneficiaries() {
		const newBeneficiaries: Person[] = [];
		for (const member of group.members) {
			if (beneficiariesMap[member.id]) {
				newBeneficiaries.push(member);
			}
		}
		// Call the prop directly instead of dispatching
		onSave({ beneficiaries: newBeneficiaries });
	}
</script>

<div class="card bg-surface-900 space-y-4 p-4 shadow-xl">
	<h3 class="h3">Edit Beneficiaries</h3>
	<div class="max-h-64 space-y-2 overflow-y-auto">
		{#each group.members as member (member.id)}
			<label class="card flex items-center space-x-2 p-2">
				<input type="checkbox" class="checkbox" bind:checked={beneficiariesMap[member.id]} />
				<span>{member.name}</span>
			</label>
		{/each}
	</div>
	<footer class="flex justify-end">
		<button class="btn preset-filled-primary" onclick={saveBeneficiaries}>Done</button>
	</footer>
</div>
