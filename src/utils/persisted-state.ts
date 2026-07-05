import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type PersistedState = {
	groupByBranch: boolean;
	collapsedBranches: string[];
};

const DEFAULT_STATE: PersistedState = {
	groupByBranch: false,
	collapsedBranches: [],
};

function statePath(): string {
	const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
	return join(configHome, "prview", "state.json");
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
