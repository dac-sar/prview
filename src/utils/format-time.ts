export type TimeColor = "red" | "yellow" | "green";

export function formatElapsedTime(createdAt: string): string {
	const now = Date.now();
	const created = new Date(createdAt).getTime();
	const diffMs = now - created;

	const minutes = Math.floor(diffMs / (1000 * 60));
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${String(days)}d ago`;
	}

	if (hours > 0) {
		return `${String(hours)}h ago`;
	}

	return `${String(minutes)}m ago`;
}

export function getTimeIcon(createdAt: string): string {
	const diffHours =
		(Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
	if (diffHours < 12) return "🆕";
	if (diffHours < 24) return "⚠️";
	return "🔥";
}

export function getTimeColor(createdAt: string): TimeColor {
	const now = Date.now();
	const created = new Date(createdAt).getTime();
	const diffHours = (now - created) / (1000 * 60 * 60);

	if (diffHours > 48) {
		return "red";
	}

	if (diffHours > 24) {
		return "yellow";
	}

	return "green";
}
