import { TextInput } from "@inkjs/ui";
import { Box, Text } from "ink";
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
	groupByBranch: boolean;
	statusMessage: string;
};

export function StatusBar({
	isFilterActive,
	filter,
	onFilterChange,
	activeTab,
	reviewCount,
	myCount,
	isFilterMode,
	loading,
	groupByBranch,
	statusMessage,
}: Props) {
	const isReview = activeTab === "review-requested";
	const tabLabel = isReview
		? `Review PRs (${reviewCount})`
		: `My PRs (${myCount})`;

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
				{statusMessage ? (
					<Text color="green">✓ {statusMessage}</Text>
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
						{groupByBranch && <Text dimColor> [grouped by branch]</Text>}
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
					<Text>
						<Text color="white">h</Text> <Text dimColor>help</Text>
					</Text>
				)}
			</Box>
		</Box>
	);
}
