import { Text } from "ink";
import type { MergeStateStatus, ReviewDecision } from "../types.js";

type Props = {
	decision: ReviewDecision;
	isDraft: boolean;
	mergeStateStatus: MergeStateStatus;
};

export function StatusBadge({ decision, isDraft, mergeStateStatus }: Props) {
	if (isDraft) {
		return <Text dimColor>◌ DRAFT</Text>;
	}

	if (decision === "APPROVED" && mergeStateStatus === "BEHIND") {
		return <Text color="cyan">⟳ UPDATE</Text>;
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
