import { Box, Text } from "ink";
import type { PullRequest } from "../types.js";
import { PrRow } from "./pr-row.js";

type Props = {
	prs: PullRequest[];
	selectedIndex: number;
	maxRows: number;
};

export function PrTable({ prs, selectedIndex, maxRows }: Props) {
	if (prs.length === 0) {
		return (
			<Box paddingX={2} paddingY={1}>
				<Text dimColor>No pull requests found.</Text>
			</Box>
		);
	}

	const visibleCount = Math.max(1, maxRows);

	// Calculate scroll window to keep selectedIndex visible
	let scrollOffset = 0;
	if (prs.length > visibleCount) {
		if (selectedIndex >= visibleCount) {
			scrollOffset = selectedIndex - visibleCount + 1;
		}

		scrollOffset = Math.min(scrollOffset, prs.length - visibleCount);
	}

	const visiblePRs = prs.slice(scrollOffset, scrollOffset + visibleCount);

	return (
		<Box flexDirection="column" paddingX={1}>
			{visiblePRs.map((pr, index) => (
				<PrRow
					key={pr.url}
					pr={pr}
					isSelected={index + scrollOffset === selectedIndex}
				/>
			))}
		</Box>
	);
}
