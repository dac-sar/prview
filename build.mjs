import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').Plugin} */
const ignoreOptionalDeps = {
	name: 'ignore-optional',
	setup(build) {
		build.onResolve({filter: /^react-devtools-core$/}, () => ({
			path: 'react-devtools-core',
			namespace: 'ignore',
		}));
		build.onLoad({filter: /.*/, namespace: 'ignore'}, () => ({
			contents: 'export default undefined;',
		}));
	},
};

/** @type {import('esbuild').BuildOptions} */
const options = {
	entryPoints: ['src/cli.tsx'],
	bundle: true,
	platform: 'node',
	format: 'esm',
	target: 'node18',
	outfile: 'dist/cli.js',
	banner: {
		js: [
			'#!/usr/bin/env node',
			'import {createRequire as __createRequire} from "node:module";',
			'const require = __createRequire(import.meta.url);',
		].join('\n'),
	},
	plugins: [ignoreOptionalDeps],
};

if (watch) {
	const ctx = await esbuild.context(options);
	await ctx.watch();
	console.log('Watching for changes...');
} else {
	await esbuild.build(options);
	console.log('Build complete: dist/cli.js');
}
