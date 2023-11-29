# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased 

### Changed

* Overhauled class detecting regex for javascript/javascriptreact/typescript/typescriptreact, thanks [@petertriho](https://github.com/petertriho) in [#109](https://github.com/heybourn/headwind/pull/109)
* Support multiple class name regexes per language and optional separator and replacement options, thanks [@han-tyumi](https://github.com/han-tyumi) in [#112](https://github.com/heybourn/headwind/pull/112)
* Fix `cmd+shift+t` overriding default vscode keymap for reopening previously closed tabs, thanks [@tylerjlawson](https://github.com/tylerjlawson) in [#163](https://github.com/heybourn/headwind/pull/163)
* Forked from [heybourn/headwind] to [Trapfether/tailwind-raw-reorder] to continue development. Old repo is inactive.
* Initial rework of the extension to use the same approach as the [Prettier Tailwind plugin]
* Updated the html and php regexes to only select class attributes proceeded by a space
* Added Sort Selection command to sort the selected classes