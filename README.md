# prview

A terminal dashboard for your GitHub pull requests.

`prview` lets you monitor pull requests across all your GitHub repositories from a single TUI, powered by React and Ink.

## Features

- View pull requests across multiple repositories in one place
- Two tabs: **My PRs** and **Review PRs** (review requested)
- Group PRs sharing a branch name across repositories (`g`)
- Real-time filtering and sorting
- Auto-refresh every 60 seconds
- Status badges (Approved, Changes Requested, Draft, etc.)
- Press Enter to open a PR in your browser

## Prerequisites

[GitHub CLI](https://cli.github.com/) (`gh`) must be installed and authenticated:

```sh
gh auth login
```

## Installation

```sh
npm install -g @dacsar/prview
```

## Usage

```sh
pv
```

## Keybindings

### Navigation

| Key | Action |
| --- | --- |
| `Tab` | Switch between My PRs / Review PRs |
| `j` / `Down` | Move selection down |
| `k` / `Up` | Move selection up |

### PR Actions

| Key | Action |
| --- | --- |
| `Enter` / `l` | Open selected PR in browser |
| `o` | Mark draft as ready for review |
| `m` | Merge approved PR (auto-updates if behind) |
| `y` | Copy PR URL |
| `Y` | Copy branch name |

### Grouping

| Key | Action |
| --- | --- |
| `g` | Toggle grouping PRs by branch name across repositories |
| `l` / `Enter` | Expand the group under the cursor |
| `h` | Collapse the group under the cursor |
| `H` / `L` | Collapse / Expand all groups |

### General

| Key | Action |
| --- | --- |
| `/` | Enter filter mode |
| `Esc` | Exit filter mode / Clear filter |
| `r` | Refresh |
| `?` | Toggle help |
| `q` | Quit |

## Tech Stack

- [React](https://react.dev/) + [Ink](https://github.com/vadimdemedes/ink) — Terminal UI
- [TypeScript](https://www.typescriptlang.org/)
- [esbuild](https://esbuild.github.io/) — Bundler
- [Biome](https://biomejs.dev/) — Linter & Formatter

## Development

```sh
git clone https://github.com/your-username/prview.git
cd prview
make setup
npm run dev
```

### ローカルで動作確認

ビルドして実行を一発で行えます:

```sh
make pv
```
