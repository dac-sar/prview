import type { DisplayRow, PullRequest } from "../types.js";

// Build the rows to render; the selection cursor indexes into this array.
// In grouped mode, PRs sharing a branch name (necessarily across different
// repositories) are pulled together under a group-header row. Every branch
// gets a header — even single-PR ones — so group boundaries stay visible.
// Collapsed branches emit only their header. Groups appear at the position
// of their first PR, so the overall createdAt ordering of the input is
// preserved.
export function buildDisplayRows(
	prs: PullRequest[],
	grouped: boolean,
	collapsedBranches: ReadonlySet<string>,
): DisplayRow[] {
	if (!grouped) {
		return prs.map((pr) => ({ kind: "pr", pr }));
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
	for (const [branch, group] of byBranch) {
		const collapsed = collapsedBranches.has(branch);
		rows.push({ kind: "group-header", branch, count: group.length, collapsed });

		if (!collapsed) {
			for (const pr of group) {
				rows.push({ kind: "pr", pr });
			}
		}
	}

	return rows;
}

// Where the cursor should land after rows are rebuilt (collapse/expand,
// grouping toggled). Prefer the same PR, then the header of its branch,
// then the first PR of that branch (for header → flat transitions).
export function findRowIndex(
	rows: DisplayRow[],
	target: DisplayRow | undefined,
): number {
	if (!target) {
		return -1;
	}

	if (target.kind === "pr") {
		const byPr = rows.findIndex(
			(row) => row.kind === "pr" && row.pr.url === target.pr.url,
		);
		if (byPr >= 0) {
			return byPr;
		}

		return rows.findIndex(
			(row) => row.kind === "group-header" && row.branch === target.pr.branch,
		);
	}

	const byHeader = rows.findIndex(
		(row) => row.kind === "group-header" && row.branch === target.branch,
	);
	if (byHeader >= 0) {
		return byHeader;
	}

	return rows.findIndex(
		(row) => row.kind === "pr" && row.pr.branch === target.branch,
	);
}
