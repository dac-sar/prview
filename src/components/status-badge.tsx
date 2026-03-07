import { Text } from "ink";
import type { ReviewDecision } from "../types.js";

type Props = {
	decision: ReviewDecision;
	isDraft: boolean;
};

export function StatusBadge({ decision, isDraft }: Props) {
	if (isDraft) {
		return <Text dimColor>◌ DRAFT</Text>;
	}

	switch (decision) {
		case "APPROVED": {
			return <Text color="green">✓ APPROVED</Text>;
		}

		case "CHANGES_REQUESTED": {
			return <Text color="red">✕ CHANGES</Text>;
		}

		case "REVIEW_REQUIRED": {
			return <Text color="yellow">● PENDING</Text>;
		}

		default: {
			return <Text color="yellow">● PENDING</Text>;
		}
	}
}
