export type ReviewDecision =
	| "APPROVED"
	| "CHANGES_REQUESTED"
	| "REVIEW_REQUIRED"
	| "";

export type ReviewState =
	| "APPROVED"
	| "CHANGES_REQUESTED"
	| "COMMENTED"
	| "PENDING"
	| "DISMISSED";

export type MergeStateStatus =
	| "BEHIND"
	| "BLOCKED"
	| "CLEAN"
	| "DIRTY"
	| "DRAFT"
	| "HAS_HOOKS"
	| "UNKNOWN"
	| "UNSTABLE"
	| "";

export type Reviewer = {
	login: string;
	state: ReviewState;
};

export type Label = {
	name: string;
	color: string;
};

export type PullRequest = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	repository: string;
	author: string;
	reviewers: Reviewer[];
	reviewDecision: ReviewDecision;
	mergeStateStatus: MergeStateStatus;
	isDraft: boolean;
	additions: number;
	deletions: number;
	labels: Label[];
	branch: string;
};

export type Tab = "review-requested" | "my-prs";
