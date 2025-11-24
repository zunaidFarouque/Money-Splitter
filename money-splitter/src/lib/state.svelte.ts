import { persistedState } from 'svelte-persisted-state';
import * as devalue from 'devalue';

// --- Serializer Configuration ---
const devalueSerializer = {
	stringify: devalue.stringify,
	parse: devalue.parse
};

// SECTION 1: QUICK SPLIT
// =================================================================

export interface paymentData {
	id: number;
	name: string;
	paid: number;
	cost: number;
	locked: boolean;
}

export interface SplitData {
	totalAmount: number;
	totalNoOfPeople: number;
	mode: 'simple' | 'advanced';
	peopleData: paymentData[];
}

export const default_data: SplitData = {
	totalAmount: 0,
	totalNoOfPeople: 2,
	mode: 'simple',
	peopleData: [
		{ id: 1, name: 'person-1', paid: 0, cost: 0, locked: false },
		{ id: 2, name: 'person-2', paid: 0, cost: 0, locked: false }
	]
};

export const data = persistedState<SplitData>(
	'data',
	{ ...default_data },
	{ serializer: devalueSerializer }
);

export const appState = persistedState(
	'appState',
	{
		isPWAapp: false,
		showInputTable: false,
		showOutput: false
	},
	{ serializer: devalueSerializer }
);

// --- Helper Functions for Quick Split ---

export function loadExampleDataset() {
	data.current = {
		totalAmount: 100,
		totalNoOfPeople: 10,
		mode: 'simple',
		peopleData: [
			{ id: 1, name: 'a', paid: 12, cost: 10, locked: false },
			{ id: 2, name: 'b', paid: 14, cost: 10, locked: false },
			{ id: 3, name: 'c', paid: 6, cost: 10, locked: false },
			{ id: 4, name: 'd', paid: 9, cost: 10, locked: false },
			{ id: 5, name: 'e', paid: 18, cost: 10, locked: false },
			{ id: 6, name: 'f', paid: 7, cost: 10, locked: false },
			{ id: 7, name: 'g', paid: 3, cost: 10, locked: false },
			{ id: 8, name: 'h', paid: 13, cost: 10, locked: false },
			{ id: 9, name: 'i', paid: 5, cost: 10, locked: false },
			{ id: 10, name: 'j', paid: 13, cost: 10, locked: false }
		]
	};
}

export function resetPeopleData(clean: boolean = false) {
	const currentData = data.current;
	const currentPeople = currentData.peopleData;
	const currentCount = currentPeople.length;
	const targetCount = Math.max(1, Math.floor(currentData.totalNoOfPeople));

	if (currentCount !== targetCount) {
		const newPeople: paymentData[] = [];
		for (let i = 0; i < targetCount; i++) {
			if (clean && currentPeople[i]) {
				newPeople.push(currentPeople[i]);
			} else {
				newPeople.push({ id: i + 1, name: 'person-' + (i + 1), paid: 0, cost: 0, locked: false });
			}
		}
		newPeople.forEach((person, index) => {
			person.id = index + 1;
		});
		currentData.peopleData = newPeople;
		// Re-assign to trigger persistence
		data.current = currentData;
	}
}

export function loadEventLedgerExample() {
	// Create example group
	const exampleGroupId = crypto.randomUUID();
	const exampleGroup: Group = {
		id: exampleGroupId,
		name: '🗾 Japan Trip 2024',
		members: [
			{ id: crypto.randomUUID(), name: 'Alice' },
			{ id: crypto.randomUUID(), name: 'Bob' },
			{ id: crypto.randomUUID(), name: 'Charlie' },
			{ id: crypto.randomUUID(), name: 'Dave' }
		]
	};

	// Create example ledger
	const exampleLedgerId = crypto.randomUUID();
	const exampleLedger: Ledger = {
		id: exampleLedgerId,
		name: '🗼 Tokyo Expenses',
		groupId: exampleGroupId,
		transactions: [
			{
				id: crypto.randomUUID(),
				description: '✈️ Flight Tickets',
				payers: [
					{ ...exampleGroup.members[0], amount: 1200 },
					{ ...exampleGroup.members[1], amount: 1200 }
				],
				beneficiaries: [...exampleGroup.members]
			},
			{
				id: crypto.randomUUID(),
				description: '🏨 Hotel Booking (3 nights)',
				payers: [{ ...exampleGroup.members[2], amount: 900 }],
				beneficiaries: [...exampleGroup.members]
			},
			{
				id: crypto.randomUUID(),
				description: '🍣 Sushi Dinner at Tsukiji',
				payers: [{ ...exampleGroup.members[1], amount: 180 }],
				beneficiaries: [...exampleGroup.members]
			},
			{
				id: crypto.randomUUID(),
				description: '🚄 Bullet Train to Kyoto',
				payers: [{ ...exampleGroup.members[3], amount: 280 }],
				beneficiaries: [exampleGroup.members[0], exampleGroup.members[1], exampleGroup.members[3]]
			},
			{
				id: crypto.randomUUID(),
				description: '🎭 Kabuki Theater Tickets',
				payers: [{ ...exampleGroup.members[0], amount: 240 }],
				beneficiaries: [exampleGroup.members[0], exampleGroup.members[2]]
			},
			{
				id: crypto.randomUUID(),
				description: '🍜 Ramen Street Food',
				payers: [
					{ ...exampleGroup.members[1], amount: 25 },
					{ ...exampleGroup.members[2], amount: 20 }
				],
				beneficiaries: [...exampleGroup.members]
			}
		]
	};

	// Add to stores
	groups.current = [...groups.current, exampleGroup];
	ledgers.current = [...ledgers.current, exampleLedger];
	activeLedgerId.current = exampleLedgerId;
}

// CORRECTED: Use 'let' instead of 'export let' for rune-based stores in a .svelte.ts file
const mermaidState = $state({
	mermaidLoading: false,
	mermaidString: ''
});

const calculatedResults = $state({
	optimumTransactions: [] as [string, string, number][],
	fullTableData: [] as [number, string, number, number, { to: string; amount: number }[]][]
});

// Export the runes so they can be imported elsewhere
export { mermaidState, calculatedResults };

export function createFullCalculatedTableData() {
	const currentData = data.current;
	const tableData = currentData.peopleData.map((person) => {
		const amountDue =
			currentData.mode === 'advanced'
				? person.cost - person.paid
				: currentData.totalAmount / currentData.totalNoOfPeople - person.paid;
		const toPay: { to: string; amount: number }[] = [];
		calculatedResults.optimumTransactions.forEach(([from, to, amount]) => {
			if (person.name === from) {
				toPay.push({ to, amount });
			}
		});
		return [person.id, person.name, person.paid, amountDue, toPay] as [
			number,
			string,
			number,
			number,
			{ to: string; amount: number }[]
		];
	});
	calculatedResults.fullTableData = tableData;
	return tableData;
}

// SECTION 2: EVENT LEDGER
// =================================================================

// --- Data Structures ---

export interface Person {
	id: string;
	name: string;
}

export interface Group {
	id: string;
	name: string;
	members: Person[];
}

export interface Payer extends Person {
	amount: number;
}

export interface Transaction {
	id: string;
	description: string;
	totalAmount?: number;
	payers: Payer[];
	beneficiaries: Person[];
}

export interface Ledger {
	id: string;
	name: string;
	groupId: string;
	transactions: Transaction[];
}

// --- Persisted State ---

export const groups = persistedState<Group[]>('groups', [], { serializer: devalueSerializer });
export const ledgers = persistedState<Ledger[]>('ledgers', [], { serializer: devalueSerializer });
export const activeLedgerId = persistedState<string | null>('activeLedgerId', null, {
	serializer: devalueSerializer
});
