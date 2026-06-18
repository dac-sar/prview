import { Box, Text, useApp, useInput, useStdout } from "ink";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loading } from "./components/loading.js";
import { PrTable } from "./components/pr-table.js";
import { StatusBar } from "./components/status-bar.js";
import { useFilterSort } from "./hooks/use-filter-sort.js";
import { usePullRequests } from "./hooks/use-pull-requests.js";
import type { Tab } from "./types.js";
import { copyToClipboard } from "./utils/copy-to-clipboard.js";
import { openUrl } from "./utils/open-url.js";

export function App() {
	const { exit } = useApp();
	const { stdout } = useStdout();
	const rows = stdout?.rows ?? 24;
	const { reviewRequested, myPRs, loading, error, refresh } = usePullRequests();

	const [activeTab, setActiveTab] = useState<Tab>("review-requested");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [filter, setFilter] = useState("");
	const [isFilterMode, setIsFilterMode] = useState(false);
	const [copiedMessage, setCopiedMessage] = useState("");
	const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const notifyCopied = useCallback(() => {
		setCopiedMessage("Copied URL to clipboard");
		if (copiedTimer.current) {
			clearTimeout(copiedTimer.current);
		}
		copiedTimer.current = setTimeout(() => setCopiedMessage(""), 2000);
	}, []);

	const currentPRs = activeTab === "review-requested" ? reviewRequested : myPRs;
	const filteredPRs = useFilterSort(currentPRs, filter);

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
		(index: number) => Math.max(0, Math.min(index, filteredPRs.length - 1)),
		[filteredPRs.length],
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

	useInput(
		(input, key) => {
			if (input === "q") {
				exit();
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

			if (key.return) {
				const pr = filteredPRs[selectedIndex];
				if (pr) {
					openUrl(pr.url);
				}

				return;
			}

			if (input === "y") {
				const pr = filteredPRs[selectedIndex];
				if (pr) {
					copyToClipboard(pr.url);
					notifyCopied();
				}

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
		{ isActive: !isFilterMode },
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
			{loading && filteredPRs.length === 0 ? (
				<Loading error={error} />
			) : (
				<Box
					flexGrow={1}
					overflow="hidden"
					flexDirection="column"
					justifyContent="flex-end"
				>
					<PrTable
						prs={filteredPRs}
						selectedIndex={selectedIndex}
						maxRows={maxRows}
					/>
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
				copiedMessage={copiedMessage}
			/>
		</Box>
	);
}
