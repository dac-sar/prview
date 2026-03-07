import { render } from "ink";
import meow from "meow";
import { App } from "./app.js";

meow(
	`
  Usage
    $ prc

  Options
    --help  Show help

  Keybindings
    Tab      Switch tab (Review Requested / My PRs)
    j/k ↑/↓  Move cursor
    Enter    Open PR in browser
    /        Filter mode
    Esc      Clear filter
    r        Refresh
    q        Quit
`,
	{
		importMeta: import.meta,
	},
);

process.stdout.write("\x1b[?1049h");

const instance = render(<App />);

instance.waitUntilExit().then(() => {
	process.stdout.write("\x1b[?1049l");
});
