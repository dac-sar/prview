import { Box, Text } from "ink";
import { resolveLeaderNodes } from "../constants.js";

type Props = {
	path: string;
};

// LazyVim-style which-key hint. Absolutely positioned so it overlays the
// bottom-right corner of the table without shifting any rows; the explicit
// backgroundColor keeps padding cells opaque (Ink paints nothing for empty
// cells otherwise, letting the row underneath show through).
export function WhichKeyPanel({ path }: Props) {
	const nodes = resolveLeaderNodes(path);
	if (nodes.length === 0) {
		return null;
	}

	const title = ["<space>", ...path].join(" ");

	return (
		<Box
			position="absolute"
			width="100%"
			height="100%"
			flexDirection="column"
			justifyContent="flex-end"
			alignItems="flex-end"
		>
			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor="gray"
				backgroundColor="black"
				paddingX={1}
				minWidth={22}
			>
				{nodes.map((node) => (
					<Box key={node.key}>
						<Text bold color="cyan">
							{node.key}
						</Text>
						<Text dimColor>
							{"  "}
							{node.children ? `+${node.label}` : node.label}
						</Text>
					</Box>
				))}
				<Box justifyContent="center">
					<Text dimColor>{title}</Text>
				</Box>
			</Box>
		</Box>
	);
}
