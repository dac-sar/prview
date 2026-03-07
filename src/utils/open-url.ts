import { execFile } from "node:child_process";

export function openUrl(url: string): void {
	execFile("open", [url], () => {
		// Silently fail — user can copy URL from the table
	});
}
