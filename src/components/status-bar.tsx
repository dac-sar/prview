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
}: Props) {
	const isReview = activeTab === "review-requested";
	const tabLabel = isReview
		? `To Review (${reviewCount})`
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
				{isFilterActive || filter ? (
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
					<>
						<Text>
							<Text color="white">Tab</Text> <Text dimColor>switch</Text>
						</Text>
						<Text>
							<Text color="white">j/k</Text> <Text dimColor>move</Text>
						</Text>
						<Text>
							<Text color="white">Enter</Text> <Text dimColor>open</Text>
						</Text>
						<Text>
							<Text color="white">/</Text> <Text dimColor>filter</Text>
						</Text>
						<Text>
							<Text color="white">r</Text> <Text dimColor>refresh</Text>
						</Text>
						<Text>
							<Text color="white">q</Text> <Text dimColor>quit</Text>
						</Text>
					</>
				)}
			</Box>
		</Box>
	);
}
