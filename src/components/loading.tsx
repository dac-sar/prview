import { Spinner } from "@inkjs/ui";
import { Box } from "ink";

type Props = {
	error: string | null;
};

export function Loading({ error }: Props) {
	if (error) {
		return null;
	}

	return (
		<Box paddingX={2} paddingY={1}>
			<Spinner label="Fetching pull requests..." />
		</Box>
	);
}
