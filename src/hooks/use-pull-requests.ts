import { useCallback, useEffect, useState } from "react";
import type { PullRequest } from "../types.js";
import { fetchMyPRs, fetchReviewRequested } from "../utils/fetch-prs.js";

const REFRESH_INTERVAL = 60_000;

type UsePullRequestsResult = {
	reviewRequested: PullRequest[];
	myPRs: PullRequest[];
	loading: boolean;
	error: string | null;
	refresh: () => void;
};

export function usePullRequests(): UsePullRequestsResult {
	const [reviewRequested, setReviewRequested] = useState<PullRequest[]>([]);
	const [myPRs, setMyPRs] = useState<PullRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [rr, my] = await Promise.all([
				fetchReviewRequested(),
				fetchMyPRs(),
			]);
			setReviewRequested(rr);
			setMyPRs(my);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
		const timer = setInterval(() => {
			void load();
		}, REFRESH_INTERVAL);
		return () => {
			clearInterval(timer);
		};
	}, [load]);

	return { reviewRequested, myPRs, loading, error, refresh: load };
}
