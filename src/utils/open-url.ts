import { execFile } from "node:child_process";

export function openUrl(url: string): void {
	execFile("open", [url], () => {
		// Silently fail — user can copy URL from the table
	});
}

// Try url first (e.g. an app deep link); `open` exits non-zero when no
// handler is registered, in which case fall back to fallbackUrl.
export function openUrlWithFallback(url: string, fallbackUrl: string): void {
	execFile("open", [url], (error) => {
		if (error) {
			openUrl(fallbackUrl);
		}
	});
}
