<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { appState } from '$lib/state.svelte';
	let { children } = $props();

	// Transition logic
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	let url = $derived(page.url.href);
	const transition_time = 100;

	let isDark = $state(false);

	// Check PWA and Theme
	onMount(() => {
		if (window.matchMedia('(display-mode: standalone)').matches) {
			appState.current.isPWAapp = true;
		} else {
			appState.current.isPWAapp = false;
		}

		// Theme Init - Check for saved theme or system preference
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'dark') {
			document.documentElement.classList.add('dark');
			isDark = true;
		} else if (savedTheme === 'light') {
			document.documentElement.classList.remove('dark');
			isDark = false;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark');
			isDark = true;
		} else {
			document.documentElement.classList.remove('dark');
			isDark = false;
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}
</script>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
	<AppBar base="top-0 z-10 p-4" centerClasses="">
		{#snippet lead()}{/snippet}
		<a class="h5 font-bold" href="{base}/">Money Splitter</a>
		{#snippet trail()}
			<button
				class="btn preset-tonal-surface p-2"
				onclick={toggleTheme}
				aria-label="Toggle Dark Mode"
			>
				<span class="text-xl">{isDark ? '🌙' : '☀️'}</span>
			</button>
		{/snippet}
	</AppBar>

	{#key url}
		<main
			class="col-span-1 space-y-4 p-4"
			in:fade={{ duration: transition_time, delay: transition_time + 1 }}
			out:fade={{ duration: transition_time }}
		>
			{@render children()}
		</main>
	{/key}

	<!-- Footer -->
	<footer class="border-surface-500/20 mt-8 border-t p-6 text-center opacity-70">
		<p>
			Thanks for using! Created with ♡ by <a
				href="https://github.com/vfxturjo"
				class="badge preset-filled-secondary-500 hover:preset-filled"
			>
				vfxTurjo
			</a>
		</p>
	</footer>
</div>
