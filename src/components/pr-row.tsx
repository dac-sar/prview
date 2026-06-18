import { Box, Text, useStdout } from "ink";
import { COL, computeColumnLayout } from "../constants.js";
import type { PullRequest } from "../types.js";
import {
	formatElapsedTime,
	getTimeColor,
	getTimeIcon,
} from "../utils/format-time.js";
import { StatusBadge } from "./status-badge.js";

type Props = {
	pr: PullRequest;
	isSelected: boolean;
};

export function PrRow({ pr, isSelected }: Props) {
	const { stdout } = useStdout();
	const columns = stdout?.columns ?? 120;
	const {
		showRepo,
		showStatus,
		showDiff,
		showElapsed,
		showAuthor,
		showReviewer,
		titleWidth,
	} = computeColumnLayout(columns);
	const timeColor = getTimeColor(pr.createdAt);
	const elapsed = formatElapsedTime(pr.createdAt);
	const icon = getTimeIcon(pr.createdAt);
	const repoShort = pr.repository.split("/")[1] ?? pr.repository;
	const selColor = isSelected ? "white" : undefined;

	const filteredReviewers = pr.reviewers.filter(
		(r) => !r.login.toLowerCase().includes("devin"),
	);
	const firstReviewer = filteredReviewers[0];
	const extraCount = filteredReviewers.length - 1;
	const reviewerText = firstReviewer
		? `@${firstReviewer.login}${extraCount > 0 ? ` +${extraCount}` : ""}`
		: "";

	return (
		<Box backgroundColor={isSelected ? "#333333" : undefined}>
			<Text color={isSelected ? "red" : undefined}>
				{isSelected ? ">" : " "}
			</Text>
			<Box width={COL.icon}>
				<Text color={timeColor} wrap="truncate">
					{` ${icon} `}
				</Text>
			</Box>
			{showRepo && (
				<>
					<Box width={COL.repo}>
						<Text dimColor={!isSelected} color={selColor} wrap="truncate">
							{repoShort}#{pr.number}
						</Text>
					</Box>
					<Text dimColor>|</Text>
				</>
			)}
			<Box width={titleWidth}>
				<Text bold={isSelected} color={selColor} wrap="truncate">
					{pr.title}
				</Text>
			</Box>
			{showStatus && (
				<>
					<Text dimColor>|</Text>
					<Box width={COL.status} marginLeft={1}>
						<StatusBadge decision={pr.reviewDecision} isDraft={pr.isDraft} />
					</Box>
				</>
			)}
			{showDiff && (
				<>
					<Text dimColor>|</Text>
					<Box width={COL.diff} marginLeft={1} justifyContent="flex-end">
						<Text wrap="truncate">
							<Text color="green">+{pr.additions}</Text>{" "}
							<Text color="red">-{pr.deletions}</Text>
						</Text>
					</Box>
				</>
			)}
			{showElapsed && (
				<>
					<Text dimColor>|</Text>
					<Box width={COL.elapsed} marginLeft={1}>
						<Text color={timeColor} wrap="truncate">
							{elapsed}
						</Text>
					</Box>
				</>
			)}
			{showAuthor && (
				<>
					<Text dimColor>|</Text>
					<Box width={COL.reviewee} marginLeft={1}>
						<Text dimColor wrap="truncate">
							@{pr.author}
						</Text>
					</Box>
				</>
			)}
			{showReviewer && (
				<>
					<Text dimColor>|</Text>
					<Box width={COL.reviewer} marginLeft={1}>
						<Text dimColor wrap="truncate">
							{reviewerText}
						</Text>
					</Box>
				</>
			)}
		</Box>
	);
}
