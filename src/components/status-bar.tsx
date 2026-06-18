import { TextInput } from "@inkjs/ui";
import { Box, Text, useStdout } from "ink";
import type { Tab } from "../types.js";

type Props = {
	isFilterActive: boolean;
	filter: string;
	onFilterChange: (value: string) => void;
	activeTab: Tab;
	reviewCount: number;
	myCount: number;
	isFilterMode: boolean;
	loading: boolean;
	copiedMessage: string;
};

type Hint = { key: string; label: string; keep: number };

// `keep` is the retention priority: lower drops last. As the bar narrows, the
// highest `keep` values disappear first (r refresh → ... → Tab switch), and
// q quit (keep 1) survives longest.
const HINTS: Hint[] = [
	{ key: "Tab", label: "switch", keep: 6 },
	{ key: "j/k", label: "move", keep: 3 },
	{ key: "Enter", label: "open", keep: 2 },
	{ key: "y", label: "copy", keep: 4 },
	{ key: "/", label: "filter", keep: 5 },
	{ key: "r", label: "refresh", keep: 7 },
	{ key: "q", label: "quit", keep: 1 },
];

// Width a hint occupies: "key" + space + "label", plus a gap before it.
const hintWidth = (h: Hint) => h.key.length + 1 + h.label.length;

// Pick the hints that fit `budget` columns, dropping by `keep` priority, then
// return them in their original display order.
function visibleHints(budget: number): Hint[] {
	const byPriority = [...HINTS].sort((a, b) => a.keep - b.keep);
	const shown = new Set<string>();
	let used = 0;
	for (const h of byPriority) {
		const width = hintWidth(h) + (shown.size > 0 ? 1 : 0); // +1 for gap
		if (used + width > budget) break;
		used += width;
		shown.add(h.key);
	}
	return HINTS.filter((h) => shown.has(h.key));
}

export function StatusBar({
	isFilterActive,
	filter,
	onFilterChange,
	activeTab,
	reviewCount,
	myCount,
	isFilterMode,
	loading,
	copiedMessage,
}: Props) {
	const { stdout } = useStdout();
	const columns = stdout?.columns ?? 80;

	const isReview = activeTab === "review-requested";
	const tabLabel = isReview
		? `To Review (${reviewCount})`
		: `My PRs (${myCount})`;

	// Reserve the left side (padding + label + a little breathing room) so the
	// hints only claim the remaining width.
	const reserved = 2 + tabLabel.length + (loading ? 13 : 0) + 2;
	const hints = visibleHints(columns - reserved);

	return (
		<Box
			borderStyle="single"
			borderColor="gray"
			borderTop
			borderBottom={false}
			borderLeft={false}
			borderRight={false}
			paddingX={1}
			justifyContent="space-between"
		>
			<Box>
				{copiedMessage ? (
					<Text color="green">✓ {copiedMessage}</Text>
				) : isFilterActive || filter ? (
					<>
						<Text color="yellow">/</Text>
						{isFilterActive ? (
							<TextInput
								defaultValue={filter}
								onChange={onFilterChange}
								placeholder="Filter by title, repo, author, reviewer..."
							/>
						) : (
							<Text dimColor> {filter}</Text>
						)}
					</>
				) : (
					<>
						<Text bold color={isReview ? "cyan" : "magenta"}>
							{tabLabel}
						</Text>
						{loading && <Text dimColor> Refreshing...</Text>}
					</>
				)}
			</Box>
			<Box gap={1}>
				{isFilterMode ? (
					<Text dimColor>
						<Text color="gray">Esc</Text> <Text dimColor>cancel</Text>
					</Text>
				) : (
					hints.map((h) => (
						<Text key={h.key}>
							<Text color="white">{h.key}</Text> <Text dimColor>{h.label}</Text>
						</Text>
					))
				)}
			</Box>
		</Box>
	);
}
