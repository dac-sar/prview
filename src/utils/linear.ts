// Linear's "Copy git branch name" produces branches like
// "username/kun-123-fix-login" (the format is customizable, but the issue
// identifier "<team>-<number>" is the constant part). Extract it, segment
// by segment, so a leading "feature/" prefix doesn't hide the identifier.
export function extractLinearIssueId(branch: string): string | undefined {
	const match = branch.match(/(?:^|\/)([a-zA-Z][a-zA-Z0-9]*-\d+)(?:-|\/|$)/);
	return match?.[1]?.toUpperCase();
}

export function linearIssueUrl(workspace: string, issueId: string): string {
	return `https://linear.app/${workspace}/issue/${issueId}`;
}

// Deep link for the Linear desktop app; same path as the web URL.
export function linearAppUrl(workspace: string, issueId: string): string {
	return `linear://${workspace}/issue/${issueId}`;
}

// The team key is the workspace-unique prefix of an issue ID: KUN-123 → KUN.
export function linearTeamKey(issueId: string): string {
	return issueId.split("-")[0] ?? issueId;
}
