import { useMemo } from "react";
import type { PullRequest } from "../types.js";

export function useFilterSort(
	prs: PullRequest[],
	filter: string,
): PullRequest[] {
	return useMemo(() => {
		let result = prs;

		if (filter) {
			const lower = filter.toLowerCase();
			result = result.filter(
				(pr) =>
					pr.title.toLowerCase().includes(lower) ||
					pr.repository.toLowerCase().includes(lower) ||
					pr.author.toLowerCase().includes(lower) ||
					pr.reviewers.some((r) => r.login.toLowerCase().includes(lower)),
			);
		}

		return [...result].sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
	}, [prs, filter]);
}
