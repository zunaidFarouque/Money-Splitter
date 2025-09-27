import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	// This configuration is ONLY for the development server.
	// It has NO effect on your final static build.
	ssr: {
		// This tells the dev server to not process the internals of these packages,
		// which is the standard way to fix sourcemap/404 errors for libraries like superjson.
		noExternal: ['@skeletonlabs/skeleton-svelte', 'superjson']
	}
});
