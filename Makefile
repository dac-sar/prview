.PHONY: setup build check check-fix pv

setup:
	npm install

build:
	npm run build

check:
	npm run check

check-fix:
	npm run check:fix

pv:
	npm run build && node dist/cli.js
