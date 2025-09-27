<script>
	import { base } from '$app/paths';
</script>

<!-- 
<div class="container mx-auto grid grid-cols-1 *:p-2">
	<h1 class="h1">Welcome to Money Splitter App!</h1>
	<p>
		Ever shared costs with friends - maybe for a trip, dinner, or just splitting groceries - and
		ended up with a tangled mess of who owes what? We've all been there! Sometimes things don't
		split perfectly at the moment, and figuring out the fairest way to settle up later, especially
		with a group, can be a real headache.
	</p>

	<p>
		That's exactly what the Money Splitter App is for! It's your simple sidekick for handling group
		expenses. Just pop in the total cost and how many people are splitting it. The app figures out
		the basic split. Then, tell it who paid what. Shazam! The app instantly shows you the <mark
			class="mark">smartest</mark
		>
		way for everyone to pay each other back, cutting down on unnecessary transfers and making settling
		up smooth and easy. No more awkward money chats!
	</p>

	<div class="my-8 w-full text-center">
		<a href="{base}/App">
			<button class="btn preset-filled-primary-500 w-1/5">Start</button>
		</a>
	</div>
</div> -->

<!-- 
<script>
	import { base } from '$app/paths';
</script> -->

<div class="container mx-auto grid grid-cols-1 text-center *:p-2">
	<h1 class="h1">How would you like to split?</h1>
	<p class="text-lg text-slate-500">Choose the best method for your situation.</p>

	<div class="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="card flex flex-col p-4 text-left">
			<h2 class="h2">🚀 Quick Split</h2>
			<p class="mt-2 flex-grow">
				Best for settling a <strong>single, known total</strong>. Perfect for a restaurant bill,
				groceries, or any situation where you already know the final amount and just need to figure
				out who owes whom.
			</p>
			<a href="{base}/App" class="mt-4">
				<button class="btn preset-filled-primary-500 w-full">Use Quick Split</button>
			</a>
		</div>

		<div class="card flex flex-col p-4 text-left">
			<h2 class="h2">🧾 Event Ledger</h2>
			<p class="mt-2 flex-grow">
				Best for tracking <strong>multiple expenses over time</strong>. Perfect for a trip, a
				project, or a shared house where you want to log each transaction as it happens to get a
				final, optimized settlement.
			</p>
			<a href="{base}/Event" class="mt-4">
				<button class="btn preset-filled-secondary-500 w-full">Use Event Ledger</button>
			</a>
		</div>
	</div>
</div>
