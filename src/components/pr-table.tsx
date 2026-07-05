import { Box, Text } from "ink";
import type { DisplayRow } from "../types.js";
import { PrRow } from "./pr-row.js";

type Props = {
	rows: DisplayRow[];
	selectedIndex: number;
	maxRows: number;
};

export function PrTable({ rows, selectedIndex, maxRows }: Props) {
	if (rows.length === 0) {
		return (
			<Box paddingX={2} paddingY={1}>
				<Text dimColor>No pull requests found.</Text>
			</Box>
		);
	}

	const visibleCount = Math.max(1, maxRows);

	// Calculate scroll window to keep the selected row visible
	let scrollOffset = 0;
	if (rows.length > visibleCount) {
		if (selectedIndex >= visibleCount) {
			scrollOffset = selectedIndex - visibleCount + 1;
		}

		scrollOffset = Math.min(scrollOffset, rows.length - visibleCount);
	}

	const visibleRows = rows.slice(scrollOffset, scrollOffset + visibleCount);

	return (
		<Box flexDirection="column" paddingX={1}>
			{visibleRows.map((row, index) => {
				const isSelected = index + scrollOffset === selectedIndex;
				return row.kind === "group-header" ? (
					<Box key={`group:${row.branch}`}>
						<Text color={isSelected ? "red" : undefined}>
							{isSelected ? ">" : " "}
						</Text>
						<Text wrap="truncate">
							{" "}
							<Text bold color="cyan">
								{row.collapsed ? "▶" : "▼"} {row.branch}
							</Text>
							<Text dimColor> ({row.count})</Text>
						</Text>
					</Box>
				) : (
					<PrRow key={row.pr.url} pr={row.pr} isSelected={isSelected} />
				);
			})}
		</Box>
	);
}
