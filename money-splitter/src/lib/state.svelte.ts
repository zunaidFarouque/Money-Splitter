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
}

export interface SplitData {
	totalAmount: number;
	totalNoOfPeople: number;
	peopleData: paymentData[];
}

export const default_data: SplitData = {
	totalAmount: 0,
	totalNoOfPeople: 2,
	peopleData: [
		{ id: 1, name: 'person-1', paid: 0 },
		{ id: 2, name: 'person-2', paid: 0 }
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
		peopleData: [
			{ id: 1, name: 'a', paid: 12 },
			{ id: 2, name: 'b', paid: 14 },
			{ id: 3, name: 'c', paid: 6 },
			{ id: 4, name: 'd', paid: 9 },
			{ id: 5, name: 'e', paid: 18 },
			{ id: 6, name: 'f', paid: 7 },
			{ id: 7, name: 'g', paid: 3 },
			{ id: 8, name: 'h', paid: 13 },
			{ id: 9, name: 'i', paid: 5 },
			{ id: 10, name: 'j', paid: 13 }
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
				newPeople.push({ id: i + 1, name: 'person-' + (i + 1), paid: 0 });
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
		const amountDue = currentData.totalAmount / currentData.totalNoOfPeople - person.paid;
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
