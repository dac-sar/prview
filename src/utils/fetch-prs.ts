import { execFile } from "node:child_process";
import type { Label, PullRequest, ReviewDecision, Reviewer } from "../types.js";

const QUERY = `
query($q: String!) {
  search(query: $q, type: ISSUE, first: 50) {
    nodes {
      ... on PullRequest {
        number
        title
        url
        createdAt
        isDraft
        additions
        deletions
        headRefName
        reviewDecision
        author {
          login
        }
        repository {
          nameWithOwner
        }
        labels(first: 10) {
          nodes {
            name
            color
          }
        }
        latestReviews(first: 10) {
          nodes {
            author {
              login
            }
            state
          }
        }
        reviewRequests(first: 10) {
          nodes {
            requestedReviewer {
              ... on User {
                login
              }
              ... on Team {
                name
              }
            }
          }
        }
      }
    }
  }
}
`;

type GraphQLNode = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	isDraft: boolean;
	additions: number;
	deletions: number;
	headRefName: string;
	reviewDecision: ReviewDecision | null;
	author: { login: string } | null;
	repository: { nameWithOwner: string };
	labels: { nodes: Array<{ name: string; color: string }> };
	latestReviews: {
		nodes: Array<{ author: { login: string } | null; state: string }>;
	};
	reviewRequests: {
		nodes: Array<{
			requestedReviewer: { login?: string; name?: string } | null;
		}>;
	};
};

type GraphQLResponse = {
	data: {
		search: {
			nodes: GraphQLNode[];
		};
	};
};

function parseNode(node: GraphQLNode): PullRequest {
	const reviewers: Reviewer[] = [];

	for (const review of node.latestReviews.nodes) {
		if (review.author) {
			reviewers.push({
				login: review.author.login,
				state: review.state as Reviewer["state"],
			});
		}
	}

	for (const request of node.reviewRequests.nodes) {
		const login =
			request.requestedReviewer?.login ?? request.requestedReviewer?.name;
		if (login && !reviewers.some((r) => r.login === login)) {
			reviewers.push({ login, state: "PENDING" });
		}
	}

	const labels: Label[] = node.labels.nodes.map((l) => ({
		name: l.name,
		color: l.color,
	}));

	return {
		number: node.number,
		title: node.title,
		url: node.url,
		createdAt: node.createdAt,
		repository: node.repository.nameWithOwner,
		author: node.author?.login ?? "unknown",
		reviewers,
		reviewDecision: node.reviewDecision ?? "",
		isDraft: node.isDraft,
		additions: node.additions,
		deletions: node.deletions,
		labels,
		branch: node.headRefName,
	};
}

function runGh(args: string[], stdin?: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = execFile(
			"gh",
			args,
			{ maxBuffer: 10 * 1024 * 1024 },
			(error: Error | null, stdout: string) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(stdout);
			},
		);

		if (stdin && child.stdin) {
			child.stdin.write(stdin);
			child.stdin.end();
		}
	});
}

function runGraphQL(searchQuery: string): Promise<GraphQLResponse> {
	const body = JSON.stringify({
		query: QUERY,
		variables: { q: searchQuery },
	});

	return runGh(["api", "graphql", "--input", "-"], body).then(
		(result) => JSON.parse(result) as GraphQLResponse,
	);
}

export async function fetchReviewRequested(): Promise<PullRequest[]> {
	const json = await runGraphQL("is:pr is:open review-requested:@me");
	return json.data.search.nodes.map((node) => parseNode(node));
}

export async function fetchMyPRs(): Promise<PullRequest[]> {
	const json = await runGraphQL("is:pr is:open author:@me");
	return json.data.search.nodes.map((node) => parseNode(node));
}
