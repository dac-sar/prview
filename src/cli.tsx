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
    Navigation
      Tab      Switch tab (My PRs / Review PRs)
      j/k ↑/↓  Move cursor

    PR Actions
      Enter/l  Open PR in browser
      o        Mark draft as ready for review
      m        Merge approved PR
      y/Y      Copy PR URL / branch name

    Grouping
      g        Toggle grouping by branch name
      l/Enter  Expand group
      h        Collapse group
      H/L      Collapse/Expand all groups

    Linear
      Space l g  Open Linear issue for the branch
      Space l y  Copy Linear issue URL
      Space l c  Copy Linear issue ID

    General
      /        Filter mode
      Esc      Clear filter
      r        Refresh
      ?        Help
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
