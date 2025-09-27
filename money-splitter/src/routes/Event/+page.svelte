<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	import { onMount } from 'svelte';
	import { BROWSER } from 'esm-env';

	import EventLedgerMobile from './EventLedgerMobile.svelte';
	import EventLedgerDesktop from './EventLedgerDesktop.svelte';

	let isDesktop = $state(false);
	const mobileBreakpoint = 768; // Standard 'md' breakpoint in Tailwind CSS

	onMount(() => {
		if (BROWSER) {
			const mediaQuery = window.matchMedia(`(min-width: ${mobileBreakpoint}px)`);

			// Set the initial value
			isDesktop = mediaQuery.matches;

			// Listen for changes
			const handleResize = (e: MediaQueryListEvent) => {
				isDesktop = e.matches;
			};

			mediaQuery.addEventListener('change', handleResize);

			// Cleanup listener when the component is destroyed
			return () => {
				mediaQuery.removeEventListener('change', handleResize);
			};
		}
	});
</script>

<div class="container mx-auto">
	{#if isDesktop}
		<EventLedgerDesktop />
	{:else}
		<EventLedgerMobile />
	{/if}
</div>
