<script lang="ts">
	import { groups, type Group, type Person } from '$lib/state.svelte';
	import autoAnimate from '@formkit/auto-animate';
	import { Trash2 } from 'lucide-svelte';

	type Props = {
		close: () => void;
	};
	let { close }: Props = $props();

	// --- State for the form ---
	let editingGroup = $state<Group | null>(null);
	let newMemberName = $state('');

	function startCreatingGroup() {
		editingGroup = {
			id: crypto.randomUUID(),
			name: '',
			members: []
		};
	}

	function startEditingGroup(group: Group) {
		editingGroup = JSON.parse(JSON.stringify(group));
	}

	function cancelEdit() {
		editingGroup = null;
		newMemberName = '';
	}

	function addMember() {
		if (newMemberName.trim() === '' || !editingGroup) return;
		const newMember: Person = {
			id: crypto.randomUUID(),
			name: newMemberName.trim()
		};
		editingGroup.members.push(newMember);
		newMemberName = '';
	}

	function removeMember(memberId: string) {
		if (!editingGroup) return;
		editingGroup.members = editingGroup.members.filter((m) => m.id !== memberId);
	}

	function saveGroup() {
		if (!editingGroup || editingGroup.name.trim() === '') return;
		const groupIndex = groups.current.findIndex((g) => g.id === editingGroup!.id);

		if (groupIndex > -1) {
			groups.current[groupIndex] = editingGroup;
		} else {
			groups.current.push(editingGroup);
		}
		groups.current = [...groups.current];
		cancelEdit();
	}

	function deleteGroup(groupId: string) {
		if (confirm('Are you sure you want to delete this group? This cannot be undone.')) {
			groups.current = groups.current.filter((g) => g.id !== groupId);
		}
	}
</script>

<div class="card flex max-h-[80vh] flex-col space-y-4 p-4">
	{#if editingGroup}
		<!-- CREATE / EDIT VIEW -->
		<div class="flex-grow space-y-4 overflow-y-auto" use:autoAnimate>
			<h3 class="h3">{editingGroup.id ? 'Edit Group' : 'Create Group'}</h3>

			<label class="label">
				<span>Group Name</span>
				<input
					class="input"
					type="text"
					placeholder="e.g., Tour Buddies"
					bind:value={editingGroup.name}
				/>
			</label>

			<div>
				<h4 class="h4">Members ({editingGroup.members.length})</h4>
				<div class="mt-2">
					<div class="flex space-x-2">
						<input
							class="input flex-grow"
							type="text"
							placeholder="Add member name..."
							bind:value={newMemberName}
							onkeydown={(e) => e.key === 'Enter' && addMember()}
						/>
						<button
							class="btn preset-filled-primary"
							onclick={addMember}
							disabled={newMemberName.trim() === '' ||
								editingGroup.members.some(
									(m) => m.name.trim().toLowerCase() === newMemberName.trim().toLowerCase()
								)}
						>
							{#if newMemberName.trim() !== '' && editingGroup.members.some((m) => m.name
											.trim()
											.toLowerCase() === newMemberName.trim().toLowerCase())}
								<span class="float-right text-sm text-red-600">No Dupes!</span>
							{:else}
								Add
							{/if}
						</button>
					</div>
				</div>
			</div>

			<ul class="list space-y-2">
				{#each editingGroup.members as member (member.id)}
					<li class="flex items-center justify-between">
						<span>{member.name}</span>
						<button class="btn-icon btn-icon-sm" onclick={() => removeMember(member.id)}>
							<Trash2 size={16} />
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<footer class="flex justify-end space-x-2">
			<button class="btn preset-tonal" onclick={cancelEdit}>Cancel</button>
			<button class="btn preset-filled-primary" onclick={saveGroup}>Save Group</button>
		</footer>
	{:else}
		<!-- LIST VIEW -->
		<header class="flex items-center justify-between">
			<h3 class="h3">Manage Groups</h3>
			<button class="btn preset-filled" onclick={startCreatingGroup}>+ New Group</button>
		</header>
		<div class="flex-grow overflow-y-auto" use:autoAnimate>
			<!-- FIXED: Add a check to ensure groups.current is an array before rendering -->
			{#if groups.current}
				<ul class="list">
					{#each groups.current as group (group.id)}
						<li class="flex items-center justify-between">
							<div>
								<p class="font-bold">{group.name}</p>
								<p class="text-sm opacity-70">{group.members.length} members</p>
							</div>
							<div class="flex space-x-2">
								<button class="btn btn-sm" onclick={() => startEditingGroup(group)}>Edit</button>
								<button
									class="btn-icon btn-icon-sm preset-filled-warning"
									onclick={() => deleteGroup(group.id)}
								>
									<Trash2 size={16} />
								</button>
							</div>
						</li>
					{/each}
				</ul>
				{#if groups.current.length === 0}
					<p class="p-4 text-center opacity-70">
						No groups created yet. Click "+ New Group" to start.
					</p>
				{/if}
			{/if}
		</div>
		<footer class="flex justify-end">
			<button class="btn preset-tonal" onclick={close}>Close</button>
		</footer>
	{/if}
</div>
