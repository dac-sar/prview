import type { DisplayRow, PullRequest } from "../types.js";

export type DisplayList = {
	rows: DisplayRow[];
	orderedPrs: PullRequest[];
};

// Build the rows to render and the flattened PR order selection indexes into.
// In grouped mode, PRs sharing a branch name (necessarily across different
// repositories) are pulled together under a group-header row. Every branch
// gets a header — even single-PR ones — so group boundaries stay visible.
// Groups appear at the position of their first PR, so the overall createdAt
// ordering of the input is preserved.
export function buildDisplayRows(
	prs: PullRequest[],
	grouped: boolean,
): DisplayList {
	if (!grouped) {
		return {
			rows: prs.map((pr, prIndex) => ({ kind: "pr", pr, prIndex })),
			orderedPrs: prs,
		};
	}

	const byBranch = new Map<string, PullRequest[]>();
	for (const pr of prs) {
		const group = byBranch.get(pr.branch);
		if (group) {
			group.push(pr);
		} else {
			byBranch.set(pr.branch, [pr]);
		}
	}

	const rows: DisplayRow[] = [];
	const orderedPrs: PullRequest[] = [];
	for (const [branch, group] of byBranch) {
		rows.push({ kind: "group-header", branch, count: group.length });

		for (const pr of group) {
			rows.push({ kind: "pr", pr, prIndex: orderedPrs.length });
			orderedPrs.push(pr);
		}
	}

	return { rows, orderedPrs };
}
