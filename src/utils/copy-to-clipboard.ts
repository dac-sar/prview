import { execFile } from "node:child_process";

export function copyToClipboard(text: string): void {
	const child = execFile("pbcopy", () => {
		// Silently fail — user can copy URL from the table
	});
	child.stdin?.end(text);
}
