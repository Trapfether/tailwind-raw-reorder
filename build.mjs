import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'

/**
 * @returns {import('esbuild').Plugin}
 */
function patchRecast() {
  return {
    // https://github.com/benjamn/recast/issues/611
    name: 'patch-recast',
    setup(build) {
      build.onLoad({ filter: /recast\/lib\/patcher\.js$/ }, async (args) => {
        let original = await fs.promises.readFile(args.path, 'utf8')

        return {
          contents: original
            .replace(
              'var nls = needsLeadingSpace(lines, oldNode.loc, newLines);',
              'var nls = oldNode.type !== "TemplateElement" && needsLeadingSpace(lines, oldNode.loc, newLines);',
            )
            .replace(
              'var nts = needsTrailingSpace(lines, oldNode.loc, newLines)',
              'var nts = oldNode.type !== "TemplateElement" && needsTrailingSpace(lines, oldNode.loc, newLines)',
            ),
        }
      })
    },
  }
}

/**
 * @returns {import('esbuild').Plugin}
 */
function copyPreflightFromDistToBaseDist() {
	return {
		name: 'copy-preflight',
		setup(build) {
			build.onEnd(() =>
				fs.promises.copyFile(
					path.resolve(__dirname, './dist/css/node_modules/tailwindcss/lib/css/preflight.css'),
					path.resolve(__dirname, './dist/css/preflight.css'),
				),
			)
		},
	}
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let context = await esbuild.context({
  bundle: true,
  platform: 'node',
  target: 'node14.21.3',
  external: ["vscode"],
  minify: true,
  entryPoints: [path.resolve(__dirname, './src/loader.js')],
  outfile: path.resolve(__dirname, './dist/index.js'),
  format: 'cjs',
  plugins: [patchRecast(), copyPreflightFromDistToBaseDist()],
})

await context.rebuild()

if (process.argv.includes('--watch')) {
  await context.watch()
}

await context.dispose()
