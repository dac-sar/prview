import { Box, Text } from "ink";
import { COMMAND_GROUPS } from "../constants.js";

// Ink has no real overlay (no z-index), so this is rendered in place of the
// table to behave like a dialog: a bordered, centered box listing all keys,
// sectioned by category.
export function HelpDialog() {
	const keyWidth = Math.max(
		...COMMAND_GROUPS.flatMap((g) => g.commands.map((c) => c.key.length)),
	);

	return (
		<Box flexGrow={1} alignItems="center" justifyContent="center">
			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor="cyan"
				paddingX={2}
				paddingY={1}
			>
				<Box justifyContent="center">
					<Text bold color="cyan">
						Keybindings
					</Text>
				</Box>
				{COMMAND_GROUPS.map((group) => (
					<Box key={group.title} flexDirection="column" marginTop={1}>
						<Text bold color="yellow">
							{group.title}
						</Text>
						{group.commands.map((c) => (
							<Box key={c.key}>
								<Box width={keyWidth + 2}>
									<Text bold color="white">
										{c.key}
									</Text>
								</Box>
								<Text dimColor>{c.label}</Text>
							</Box>
						))}
					</Box>
				))}
				<Box marginTop={1} justifyContent="center">
					<Text dimColor>Press ? or Esc to close</Text>
				</Box>
			</Box>
		</Box>
	);
}
