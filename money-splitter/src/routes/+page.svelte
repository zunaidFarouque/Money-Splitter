<script>
	import { base } from '$app/paths';
	import { fade, fly } from 'svelte/transition';
</script>

<div class="container relative mx-auto flex min-h-[80vh] flex-col items-center justify-center p-4">
	<!-- Background Gradient -->
	<div
		class="from-primary-500/5 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-50"
	></div>

	<!-- Hero Section -->
	<div class="mb-16 text-center" in:fly={{ y: -20, duration: 800, delay: 200 }}>
		<h1
			class="h1 from-primary-500 to-secondary-500 mb-6 bg-gradient-to-br box-decoration-clone bg-clip-text font-bold text-transparent"
		>
			Split Expenses, Stress-Free
		</h1>
		<p class="mx-auto max-w-2xl text-xl leading-relaxed opacity-80">
			The easiest way to track bills, share costs, and settle up with friends.
			<br class="hidden md:block" />
			No more awkward math. Just simple, fair splitting.
		</p>
	</div>

	<!-- Cards Section -->
	<div class="grid w-full max-w-5xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
		<!-- Quick Split Card -->
		<a
			href="{base}/App"
			class="card card-hover border-surface-500/30 group relative overflow-hidden border p-8 transition-all hover:scale-[1.02] hover:shadow-xl"
			in:fly={{ x: -20, duration: 800, delay: 400 }}
		>
			<!-- Decorative blob -->
			<div
				class="bg-primary-500/10 group-hover:bg-primary-500/20 absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl transition-all"
			></div>

			<div class="relative z-10 flex h-full flex-col">
				<div class="mb-6 flex items-center gap-4">
					<div
						class="bg-primary-500/10 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm"
					>
						🚀
					</div>
					<h2 class="h2 font-semibold">Quick Split</h2>
				</div>
				<p class="mb-8 flex-grow text-lg opacity-80">
					Perfect for a single bill. Dinner, groceries, or a quick cab ride. Enter the total, add
					people, and see who owes what instantly.
				</p>
				<button
					class="btn preset-filled-primary-500 shadow-primary-500/20 w-full py-3 font-semibold shadow-lg"
				>
					Start Quick Split
				</button>
			</div>
		</a>

		<!-- Event Ledger Card -->
		<a
			href="{base}/Event"
			class="card card-hover border-surface-500/30 group relative overflow-hidden border p-8 transition-all hover:scale-[1.02] hover:shadow-xl"
			in:fly={{ x: 20, duration: 800, delay: 600 }}
		>
			<!-- Decorative blob -->
			<div
				class="bg-secondary-500/10 group-hover:bg-secondary-500/20 absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl transition-all"
			></div>

			<div class="relative z-10 flex h-full flex-col">
				<div class="mb-6 flex items-center gap-4">
					<div
						class="bg-secondary-500/10 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm"
					>
						🧾
					</div>
					<h2 class="h2 font-semibold">Event Ledger</h2>
				</div>
				<p class="mb-8 flex-grow text-lg opacity-80">
					Ideal for trips and shared projects. Track multiple expenses over time and get a final
					optimized settlement plan.
				</p>
				<button
					class="btn preset-filled-secondary-500 shadow-secondary-500/20 w-full py-3 font-semibold shadow-lg"
				>
					Start Event Ledger
				</button>
			</div>
		</a>
	</div>

	<!-- How It Works Section -->
	<div class="mt-24 w-full max-w-5xl px-4" in:fly={{ y: 20, duration: 800, delay: 800 }}>
		<h3 class="h3 mb-12 text-center font-bold">How It Works</h3>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="flex flex-col items-center text-center">
				<div
					class="bg-surface-500/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
				>
					✍️
				</div>
				<h4 class="h4 mb-2 font-semibold">1. Add Expenses</h4>
				<p class="opacity-70">Enter who paid for what. It's quick and easy.</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div
					class="bg-surface-500/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
				>
					🧮
				</div>
				<h4 class="h4 mb-2 font-semibold">2. Split Costs</h4>
				<p class="opacity-70">The app calculates the fairest way to split the total.</p>
			</div>
			<div class="flex flex-col items-center text-center">
				<div
					class="bg-surface-500/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
				>
					💸
				</div>
				<h4 class="h4 mb-2 font-semibold">3. Settle Up</h4>
				<p class="opacity-70">See exactly who owes whom. No more confusion.</p>
			</div>
		</div>
	</div>
</div>
