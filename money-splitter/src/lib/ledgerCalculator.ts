import type { Group, Ledger, Person } from './state.svelte';

// Interface for the final balances
export interface MemberBalance {
	person: Person;
	totalPaid: number;
	totalShare: number;
	netBalance: number; // positive = owed money, negative = owes money
}

// Interface for the final settlement payments
export type SettlementPayment = {
	from: string; // Name of the person paying
	to: string; // Name of the person receiving
	amount: number;
};

/**
 * Calculates the final settlement for a given ledger and group.
 * @param ledger The ledger containing all transactions.
 * @param group The group of people involved.
 * @returns An object containing member balances and the optimized settlement payments.
 */
export function calculateLedgerSettlement(ledger: Ledger, group: Group) {
	const memberBalances = new Map<string, MemberBalance>();

	// 1. Initialize balances for every member of the group
	for (const member of group.members) {
		memberBalances.set(member.id, {
			person: member,
			totalPaid: 0,
			totalShare: 0,
			netBalance: 0
		});
	}

	// 2. Process each transaction to update totals
	for (const transaction of ledger.transactions) {
		const totalPaidInTx = transaction.payers.reduce((sum, p) => sum + p.amount, 0);
		const beneficiaryCount = transaction.beneficiaries.length;

		if (beneficiaryCount === 0) continue; // Skip transactions with no beneficiaries

		const sharePerBeneficiary = totalPaidInTx / beneficiaryCount;

		// Add to totalPaid for payers
		for (const payer of transaction.payers) {
			const balance = memberBalances.get(payer.id);
			if (balance) {
				balance.totalPaid += payer.amount;
			}
		}

		// Add to totalShare for beneficiaries
		for (const beneficiary of transaction.beneficiaries) {
			const balance = memberBalances.get(beneficiary.id);
			if (balance) {
				balance.totalShare += sharePerBeneficiary;
			}
		}
	}

	// 3. Calculate the final net balance for each member
	const balancesArray: MemberBalance[] = [];
	for (const balance of memberBalances.values()) {
		balance.netBalance = balance.totalPaid - balance.totalShare;
		balancesArray.push(balance);
	}

	// 4. Optimize payments using a DEEP COPY of the balances
	const settlements = optimizePayments(JSON.parse(JSON.stringify(balancesArray)));

	return {
		memberBalances: balancesArray,
		settlements
	};
}

/**
 * Takes an array of member balances and calculates the minimum number of
 * transactions required to settle all debts.
 */
function optimizePayments(balances: MemberBalance[]): SettlementPayment[] {
	const payments: SettlementPayment[] = [];
	const epsilon = 0.01; // Tolerance for floating point inaccuracies

	// Separate members into those who are owed (creditors) and those who owe (debtors)
	let creditors = balances.filter((m) => m.netBalance > epsilon);
	let debtors = balances.filter((m) => m.netBalance < -epsilon);

	// Sort them to handle largest amounts first, which can be more efficient
	creditors.sort((a, b) => b.netBalance - a.netBalance);
	debtors.sort((a, b) => a.netBalance - b.netBalance);

	while (creditors.length > 0 && debtors.length > 0) {
		const creditor = creditors[0];
		const debtor = debtors[0];

		const amount = Math.min(creditor.netBalance, -debtor.netBalance);

		payments.push({
			from: debtor.person.name,
			to: creditor.person.name,
			amount: amount
		});

		// Update balances
		creditor.netBalance -= amount;
		debtor.netBalance += amount;

		// If a member's balance is settled, remove them from the list
		if (creditor.netBalance < epsilon) {
			creditors.shift();
		}
		if (debtor.netBalance > -epsilon) {
			debtors.shift();
		}
	}

	return payments;
}
