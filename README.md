# prview

A terminal dashboard for your GitHub pull requests.

`prview` lets you monitor pull requests across all your GitHub repositories from a single TUI, powered by React and Ink.

## Features

- View pull requests across multiple repositories in one place
- Two tabs: **Review Requested** and **My PRs**
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

| Key | Action |
| --- | --- |
| `Tab` | Switch between Review Requested / My PRs |
| `j` / `Down` | Move selection down |
| `k` / `Up` | Move selection up |
| `Enter` | Open selected PR in browser |
| `/` | Enter filter mode |
| `Esc` | Exit filter mode / Clear filter |
| `r` | Refresh |
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
