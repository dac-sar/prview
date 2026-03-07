.PHONY: setup build check check-fix

setup:
	npm install

build:
	npm run build

check:
	npm run check

check-fix:
	npm run check:fix
