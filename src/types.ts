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

// A renderable line in the PR table; the selection cursor indexes into the
// row list. In grouped mode, PRs sharing a branch name across repositories
// sit under a group-header row, which is itself selectable and collapsible.
export type DisplayRow =
	| { kind: "group-header"; branch: string; count: number; collapsed: boolean }
	| { kind: "pr"; pr: PullRequest };
