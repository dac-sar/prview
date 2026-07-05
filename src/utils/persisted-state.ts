import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type PersistedState = {
	groupByBranch: boolean;
	collapsedBranches: string[];
	// Linear team key (the "KUN" in KUN-123) → workspace slug (the part after
	// linear.app/ in issue URLs). Team keys are unique within a workspace, so
	// the mapping lets one prview handle issues from multiple workspaces.
	linearWorkspaces: Record<string, string>;
};

const DEFAULT_STATE: PersistedState = {
	groupByBranch: false,
	collapsedBranches: [],
	linearWorkspaces: {},
};

function statePath(): string {
	const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
	return join(configHome, "prview", "state.json");
}

function readWorkspaceMap(value: unknown): Record<string, string> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return {};
	}

	const map: Record<string, string> = {};
	for (const [team, workspace] of Object.entries(value)) {
		if (typeof workspace === "string") {
			map[team] = workspace;
		}
	}

	return map;
}

export function loadPersistedState(): PersistedState {
	try {
		const raw = JSON.parse(readFileSync(statePath(), "utf8")) as Partial<
			Record<keyof PersistedState, unknown>
		>;
		return {
			groupByBranch:
				typeof raw.groupByBranch === "boolean"
					? raw.groupByBranch
					: DEFAULT_STATE.groupByBranch,
			collapsedBranches: Array.isArray(raw.collapsedBranches)
				? raw.collapsedBranches.filter(
						(branch): branch is string => typeof branch === "string",
					)
				: DEFAULT_STATE.collapsedBranches,
			linearWorkspaces: readWorkspaceMap(raw.linearWorkspaces),
		};
	} catch {
		return DEFAULT_STATE;
	}
}

// Display preferences only — a failed write is not worth surfacing.
export function savePersistedState(state: PersistedState): void {
	try {
		const path = statePath();
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, `${JSON.stringify(state, null, "\t")}\n`);
	} catch {
		// ignore
	}
}
