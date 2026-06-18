export const COL = {
	icon: 4,
	repo: 18,
	status: 12,
	diff: 12,
	elapsed: 8,
	reviewee: 12,
	reviewer: 12,
};

// Always-present width: paddingX=1×2(2) + selector(1) + icon(4) = 7.
// icon and title never drop; the title takes whatever width is left.
const BASE_WIDTH = 7;

// Width each optional column consumes, including its adjacent separator
// (and marginLeft where the column has one). repo's separator sits after it
// (before the title); every other column owns the separator before it.
const OPTIONAL_WIDTH = {
	repo: COL.repo + 1, // 18 + separator
	status: COL.status + 2, // 12 + separator + marginLeft
	diff: COL.diff + 2,
	elapsed: COL.elapsed + 2,
	author: COL.reviewee + 2,
	reviewer: COL.reviewer + 2,
} as const;

type OptionalColumn = keyof typeof OPTIONAL_WIDTH;

// Order in which columns drop as the terminal narrows (first = drops first).
const DROP_ORDER: OptionalColumn[] = [
	"reviewer",
	"author",
	"repo",
	"diff",
	"elapsed",
	"status",
];

// Below this remaining title width, drop the next column in DROP_ORDER.
const MIN_TITLE_WIDTH = 20;

export type ColumnLayout = {
	showRepo: boolean;
	showStatus: boolean;
	showDiff: boolean;
	showElapsed: boolean;
	showAuthor: boolean;
	showReviewer: boolean;
	titleWidth: number;
};

// Drop optional columns in DROP_ORDER until the title fits MIN_TITLE_WIDTH,
// then give the rest of the width to the title.
export function computeColumnLayout(columns: number): ColumnLayout {
	const visible = new Set<OptionalColumn>(
		Object.keys(OPTIONAL_WIDTH) as OptionalColumn[],
	);

	const fixed = () => {
		let width = BASE_WIDTH;
		for (const col of visible) width += OPTIONAL_WIDTH[col];
		return width;
	};

	for (const col of DROP_ORDER) {
		if (columns - fixed() >= MIN_TITLE_WIDTH) break;
		visible.delete(col);
	}

	return {
		showRepo: visible.has("repo"),
		showStatus: visible.has("status"),
		showDiff: visible.has("diff"),
		showElapsed: visible.has("elapsed"),
		showAuthor: visible.has("author"),
		showReviewer: visible.has("reviewer"),
		titleWidth: Math.max(10, columns - fixed()),
	};
}
