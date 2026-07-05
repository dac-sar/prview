import { Box, Text, useApp, useInput, useStdout } from "ink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HelpDialog } from "./components/help-dialog.js";
import { Loading } from "./components/loading.js";
import { PrTable } from "./components/pr-table.js";
import { StatusBar } from "./components/status-bar.js";
import { WhichKeyPanel } from "./components/which-key-panel.js";
import { type LeaderAction, resolveLeaderNodes } from "./constants.js";
import { useFilterSort } from "./hooks/use-filter-sort.js";
import { usePullRequests } from "./hooks/use-pull-requests.js";
import type { Tab } from "./types.js";
import { copyToClipboard } from "./utils/copy-to-clipboard.js";
import { markPrReady, mergePr, updatePrBranch } from "./utils/fetch-prs.js";
import { buildDisplayRows, findRowIndex } from "./utils/group-prs.js";
import {
	extractLinearIssueId,
	linearAppUrl,
	linearIssueUrl,
	linearTeamKey,
} from "./utils/linear.js";
import { openUrl, openUrlWithFallback } from "./utils/open-url.js";
import {
	loadPersistedState,
	savePersistedState,
} from "./utils/persisted-state.js";

// Read once at startup; the app then owns the state and writes back on change.
const persisted = loadPersistedState();

export function App() {
	const { exit } = useApp();
	const { stdout } = useStdout();
	const rows = stdout?.rows ?? 24;
	const { reviewRequested, myPRs, loading, error, refresh } = usePullRequests();

	const [activeTab, setActiveTab] = useState<Tab>("my-prs");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [filter, setFilter] = useState("");
	const [isFilterMode, setIsFilterMode] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [groupByBranch, setGroupByBranch] = useState(persisted.groupByBranch);
	const [collapsedBranches, setCollapsedBranches] = useState<
		ReadonlySet<string>
	>(new Set(persisted.collapsedBranches));
	const [linearWorkspaces, setLinearWorkspaces] = useState<
		Record<string, string>
	>(persisted.linearWorkspaces);
	// null = leader inactive, "" = <space> pressed, "l" = inside the l group.
	const [leaderPath, setLeaderPath] = useState<string | null>(null);
	// A Linear action waiting on the workspace slug for its team; non-null
	// while the workspace prompt is shown.
	const [pendingLinear, setPendingLinear] = useState<{
		issueId: string;
		action: "open" | "copy-url";
	} | null>(null);
	const [statusMessage, setStatusMessage] = useState("");
	const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const notify = useCallback((message: string) => {
		setStatusMessage(message);
		if (statusTimer.current) {
			clearTimeout(statusTimer.current);
		}
		statusTimer.current = setTimeout(() => setStatusMessage(""), 2000);
	}, []);

	const notifyCopied = useCallback(
		(label: string) => notify(`Copied ${label} to clipboard`),
		[notify],
	);

	const currentPRs = activeTab === "review-requested" ? reviewRequested : myPRs;
	const filteredPRs = useFilterSort(currentPRs, filter);
	const displayRows = useMemo(
		() => buildDisplayRows(filteredPRs, groupByBranch, collapsedBranches),
		[filteredPRs, groupByBranch, collapsedBranches],
	);

	// Persist grouping state when it changes. The PR lists are read through a
	// ref so a periodic refresh alone never triggers a write; they are only
	// used to prune collapsed entries whose branches no longer exist. Skip the
	// pruning while both lists are empty (startup, before the first fetch) —
	// wiping the saved entries there would defeat the persistence.
	const prsRef = useRef({ reviewRequested, myPRs });
	prsRef.current = { reviewRequested, myPRs };
	useEffect(() => {
		const all = [...prsRef.current.reviewRequested, ...prsRef.current.myPRs];
		const known = new Set(all.map((pr) => pr.branch));
		savePersistedState({
			groupByBranch,
			collapsedBranches:
				all.length > 0
					? [...collapsedBranches].filter((branch) => known.has(branch))
					: [...collapsedBranches],
			linearWorkspaces,
		});
	}, [groupByBranch, collapsedBranches, linearWorkspaces]);

	// On terminal resize (SIGWINCH — same event whether you resize, split, or
	// add a Ghostty window), the alternate screen can keep stale rows because
	// Ink erases based on the pre-resize line count. Wipe the screen and force a
	// repaint so the new layout renders from a clean slate.
	const [, setResizeTick] = useState(0);
	useEffect(() => {
		if (!stdout) return;
		const onResize = () => {
			stdout.write("\x1b[2J\x1b[H");
			setResizeTick((n) => n + 1);
		};
		stdout.on("resize", onResize);
		return () => {
			stdout.off("resize", onResize);
		};
	}, [stdout]);

	const clampIndex = useCallback(
		(index: number) => Math.max(0, Math.min(index, displayRows.length - 1)),
		[displayRows.length],
	);

	useInput(
		(_input, key) => {
			if (key.escape) {
				setIsFilterMode(false);
				return;
			}
		},
		{ isActive: isFilterMode },
	);

	// Help dialog: any of ? / Esc / q closes it; everything else is swallowed.
	useInput(
		(input, key) => {
			if (input === "?" || key.escape || input === "q") {
				setShowHelp(false);
			}
		},
		{ isActive: showHelp },
	);

	const performLinearAction = useCallback(
		(action: "open" | "copy-url", workspace: string, issueId: string) => {
			const webUrl = linearIssueUrl(workspace, issueId);
			if (action === "open") {
				// Prefer the desktop app; `open` fails when the linear:// scheme
				// has no handler, and we fall back to the browser.
				openUrlWithFallback(linearAppUrl(workspace, issueId), webUrl);
			} else {
				copyToClipboard(webUrl);
				notifyCopied("issue URL");
			}
		},
		[notifyCopied],
	);

	const runLeaderAction = useCallback(
		(action: LeaderAction) => {
			const row = displayRows[selectedIndex];
			if (!row) {
				return;
			}

			const branch = row.kind === "pr" ? row.pr.branch : row.branch;
			const issueId = extractLinearIssueId(branch);
			if (!issueId) {
				notify(`No Linear issue in branch: ${branch}`);
				return;
			}

			if (action === "linear-copy-id") {
				copyToClipboard(issueId);
				notify(`Copied ${issueId} to clipboard`);
				return;
			}

			const kind = action === "linear-open" ? "open" : "copy-url";
			const workspace = linearWorkspaces[linearTeamKey(issueId)];
			if (!workspace) {
				// Unknown team: ask for its workspace slug, then run the action.
				setPendingLinear({ issueId, action: kind });
			} else {
				performLinearAction(kind, workspace, issueId);
			}
		},
		[displayRows, selectedIndex, linearWorkspaces, notify, performLinearAction],
	);

	// Leader (Space) mode: keys walk LEADER_KEYMAP; a leaf runs its action,
	// Esc / Space / an unmapped key cancels. Swallows everything else.
	useInput(
		(input, key) => {
			if (key.escape || input === " ") {
				setLeaderPath(null);
				return;
			}

			const nodes = resolveLeaderNodes(leaderPath ?? "");
			const node = nodes.find((n) => n.key === input);
			if (!node) {
				setLeaderPath(null);
				return;
			}

			if (node.action) {
				setLeaderPath(null);
				runLeaderAction(node.action);
				return;
			}

			setLeaderPath((prev) => (prev ?? "") + node.key);
		},
		{ isActive: leaderPath !== null && pendingLinear === null },
	);

	// Workspace prompt: TextInput owns typing/submit; only Esc is handled here.
	useInput(
		(_input, key) => {
			if (key.escape) {
				setPendingLinear(null);
			}
		},
		{ isActive: pendingLinear !== null },
	);

	const handleWorkspaceSubmit = useCallback(
		(value: string) => {
			const workspace = value.trim();
			const pending = pendingLinear;
			setPendingLinear(null);
			if (!workspace || !pending) {
				return;
			}

			const teamKey = linearTeamKey(pending.issueId);
			setLinearWorkspaces((prev) => ({ ...prev, [teamKey]: workspace }));
			notify(`Saved Linear workspace for ${teamKey}: ${workspace}`);
			performLinearAction(pending.action, workspace, pending.issueId);
		},
		[pendingLinear, notify, performLinearAction],
	);

	useInput(
		(input, key) => {
			const selectedRow = displayRows[selectedIndex];
			const selectedPr =
				selectedRow?.kind === "pr" ? selectedRow.pr : undefined;

			if (input === "q") {
				exit();
				return;
			}

			if (input === "?") {
				setShowHelp(true);
				return;
			}

			if (input === " ") {
				setLeaderPath("");
				return;
			}

			if (key.tab) {
				setActiveTab((prev) =>
					prev === "review-requested" ? "my-prs" : "review-requested",
				);
				setSelectedIndex(0);
				return;
			}

			if (input === "j" || key.downArrow) {
				setSelectedIndex((prev) => clampIndex(prev + 1));
				return;
			}

			if (input === "k" || key.upArrow) {
				setSelectedIndex((prev) => clampIndex(prev - 1));
				return;
			}

			if (key.return || input === "l") {
				if (selectedRow?.kind === "group-header") {
					if (selectedRow.collapsed) {
						// Rows are only added after the header, so the cursor stays put.
						const next = new Set(collapsedBranches);
						next.delete(selectedRow.branch);
						setCollapsedBranches(next);
					}
				} else if (selectedPr) {
					openUrl(selectedPr.url);
				}

				return;
			}

			// Collapse the group under the cursor (the selected PR's, or the
			// header's own). No-op outside grouped mode.
			if (input === "h") {
				if (groupByBranch && selectedRow) {
					const branch =
						selectedRow.kind === "pr"
							? selectedRow.pr.branch
							: selectedRow.branch;
					if (!collapsedBranches.has(branch)) {
						const next = new Set(collapsedBranches);
						next.add(branch);
						const nextRows = buildDisplayRows(filteredPRs, true, next);
						setSelectedIndex(Math.max(0, findRowIndex(nextRows, selectedRow)));
						setCollapsedBranches(next);
					}
				}

				return;
			}

			if (input === "H" || input === "L") {
				if (groupByBranch) {
					const next: ReadonlySet<string> =
						input === "H"
							? new Set(filteredPRs.map((pr) => pr.branch))
							: new Set();
					const nextRows = buildDisplayRows(filteredPRs, true, next);
					setSelectedIndex(Math.max(0, findRowIndex(nextRows, selectedRow)));
					setCollapsedBranches(next);
				}

				return;
			}

			if (input === "y") {
				if (selectedPr) {
					copyToClipboard(selectedPr.url);
					notifyCopied("URL");
				}

				return;
			}

			if (input === "Y") {
				if (selectedRow) {
					copyToClipboard(
						selectedRow.kind === "pr"
							? selectedRow.pr.branch
							: selectedRow.branch,
					);
					notifyCopied("branch");
				}

				return;
			}

			if (input === "o") {
				const pr = selectedPr;
				if (pr) {
					if (!pr.isDraft) {
						notify(`#${pr.number} is not a draft`);
					} else {
						notify(`Marking #${pr.number} as ready...`);
						markPrReady(pr.repository, pr.number)
							.then(() => {
								notify(`Marked #${pr.number} as ready`);
								refresh();
							})
							.catch((err: unknown) => {
								const message =
									err instanceof Error ? err.message : "Unknown error";
								notify(`Failed to mark ready: ${message}`);
							});
					}
				}

				return;
			}

			if (input === "m") {
				const pr = selectedPr;
				if (pr) {
					if (pr.reviewDecision !== "APPROVED") {
						notify(`#${pr.number} is not approved`);
					} else if (pr.mergeStateStatus === "BEHIND") {
						notify(`Updating branch for #${pr.number}...`);
						updatePrBranch(pr.repository, pr.number)
							.then(() => {
								notify(
									`Updated branch for #${pr.number}, press m again once checks pass`,
								);
								refresh();
							})
							.catch((err: unknown) => {
								const message =
									err instanceof Error ? err.message : "Unknown error";
								notify(`Failed to update branch: ${message}`);
							});
					} else if (
						pr.mergeStateStatus === "BLOCKED" ||
						pr.mergeStateStatus === "DIRTY"
					) {
						notify(
							`#${pr.number} cannot be merged (${pr.mergeStateStatus.toLowerCase()})`,
						);
					} else {
						notify(`Merging #${pr.number}...`);
						mergePr(pr.repository, pr.number)
							.then(() => {
								notify(`Merged #${pr.number}`);
								refresh();
							})
							.catch((err: unknown) => {
								const message =
									err instanceof Error ? err.message : "Unknown error";
								notify(`Failed to merge: ${message}`);
							});
					}
				}

				return;
			}

			if (input === "g") {
				const next = !groupByBranch;
				// Keep the cursor on the same PR (or its group) across the reorder.
				const nextRows = buildDisplayRows(filteredPRs, next, collapsedBranches);
				setSelectedIndex(Math.max(0, findRowIndex(nextRows, selectedRow)));
				setGroupByBranch(next);
				return;
			}

			if (input === "/") {
				setIsFilterMode(true);
				return;
			}

			if (key.escape) {
				setFilter("");
				setIsFilterMode(false);
				return;
			}

			if (input === "r") {
				refresh();
				return;
			}
		},
		{
			isActive:
				!isFilterMode &&
				!showHelp &&
				leaderPath === null &&
				pendingLinear === null,
		},
	);

	// StatusBar: 2 rows (border-top + content), error: 1 row if present
	const reservedRows = 2 + (error ? 1 : 0);
	const maxRows = rows - reservedRows;

	return (
		<Box flexDirection="column" height={rows} justifyContent="flex-end">
			{error && (
				<Box paddingX={2}>
					<Text color="red">Error: {error}</Text>
				</Box>
			)}
			{showHelp ? (
				<HelpDialog />
			) : loading && filteredPRs.length === 0 ? (
				<Loading error={error} />
			) : (
				<Box
					flexGrow={1}
					overflow="hidden"
					flexDirection="column"
					justifyContent="flex-end"
				>
					<PrTable
						rows={displayRows}
						selectedIndex={selectedIndex}
						maxRows={maxRows}
					/>
					{leaderPath !== null && <WhichKeyPanel path={leaderPath} />}
				</Box>
			)}
			<StatusBar
				isFilterActive={isFilterMode}
				filter={filter}
				onFilterChange={setFilter}
				activeTab={activeTab}
				reviewCount={reviewRequested.length}
				myCount={myPRs.length}
				isFilterMode={isFilterMode}
				loading={loading}
				groupByBranch={groupByBranch}
				workspacePromptTeam={
					pendingLinear ? linearTeamKey(pendingLinear.issueId) : null
				}
				onWorkspaceSubmit={handleWorkspaceSubmit}
				statusMessage={statusMessage}
			/>
		</Box>
	);
}
