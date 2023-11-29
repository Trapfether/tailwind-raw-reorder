// @ts-check
'use strict';

import { commands, workspace, Range, window } from 'vscode';
import { getTextMatch, buildMatchers } from './utils.mjs';
import { spawn } from 'child_process';
import { rustyWindPath } from 'rustywind';
import { getTailwindConfig } from './config.mjs';
import { sortClasses } from './sorting.mjs'

/**
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

/**
 * @typedef {string | string[] | { regex?: string | string[]; separator?: string; replacement?: string } | undefined} LangConfig
 */

const config = workspace.getConfiguration();
/** @type {{ [key: string]: LangConfig | LangConfig[] }} */
const langConfig =
  config.get('tailwind-raw-reorder.classRegex') || {};

/**
 * @param {ExtensionContext} context
 */
export function activate(context) {
  let disposable = commands.registerTextEditorCommand(
    'tailwind-raw-reorder.sortTailwindClasses',
    function (editor, edit) {
      const editorText = editor.document.getText();
      const editorLangId = editor.document.languageId;
      const editorFilePath = editor.document.fileName;

      const matchers = buildMatchers(
        langConfig[editorLangId] || langConfig['html']
      );

      const tailwindConfig = getTailwindConfig({
        filepath: editorFilePath
      });

      if (!tailwindConfig) {
        window.showErrorMessage(
          'Tailwind Raw Reorder: Tailwind config not found'
        );
        return;
      }

      for (const matcher of matchers) {
        getTextMatch(matcher.regex, editorText, (text, startPosition) => {
          const endPosition = startPosition + text.length;
          const range = new Range(
            editor.document.positionAt(startPosition),
            editor.document.positionAt(endPosition)
          );

          const options = {
            separator: matcher.separator,
            replacement: matcher.replacement,
            env: tailwindConfig
          };

          edit.replace(
            range,
            sortClasses(text, options)
          );
        });
      }
    }
  );

  let runOnProject = commands.registerCommand(
    'tailwind-raw-reorder.sortTailwindClassesOnWorkspace',
    () => {
      let workspaceFolder = workspace.workspaceFolders || [];
      if (workspaceFolder[0]) {
        window.showInformationMessage(
          `Running Tailwind Raw Reorder on: ${workspaceFolder[0].uri.fsPath}`
        );

        let rustyWindArgs = [
          workspaceFolder[0].uri.fsPath,
          '--write',
        ].filter((arg) => arg !== '');

        let rustyWindProc = spawn(rustyWindPath, rustyWindArgs);

        rustyWindProc.stdout.on(
          'data',
          (data) =>
            data &&
            data.toString() !== '' &&
            console.log('rustywind stdout:\n', data.toString())
        );

        rustyWindProc.stderr.on('data', (data) => {
          if (data && data.toString() !== '') {
            console.log('rustywind stderr:\n', data.toString());
            window.showErrorMessage(`Tailwind Raw Reorder error: ${data.toString()}`);
          }
        });
      }
    }
  );

  let runOnSelection = commands.registerCommand(
    'tailwind-raw-reorder.sortTailwindClassesOnSelection',
    () => {
      let editor = window.activeTextEditor;
      if (editor) {
        let selection = editor.selection;
        let editorText = editor.document.getText(selection);
        let editorLangId = editor.document.languageId;
        let editorFilePath = editor.document.fileName;

        const matchers = buildMatchers(
          langConfig[editorLangId] || langConfig['html']
        );

        const tailwindConfig = getTailwindConfig({
          filepath: editorFilePath
        });

        if (!tailwindConfig) {
          window.showErrorMessage(
            'Tailwind Raw Reorder: Tailwind config not found'
          );
          return;
        }

        for (const matcher of matchers) {
          const seperator = matcher.separator;
          const replacement = matcher.replacement;

          //regex that matches a seperator seperated list of classes that may contain letters, numbers, dashes, underscores, square brackets, square brackets with single quotes inside, and forward slashes
          const regexContent = `(?:[a-zA-Z][a-zA-Z\\/_\\-:]+(?:\\[[a-zA-Z\\/_\\-"'\\\\:\\.]\\])?(${(seperator || /\s/).source})*)+`;
          const regex = new RegExp(regexContent);
          if (regex.test(editorText)) {
            const sortedText = sortClasses(editorText, {
              seperator: seperator,
              replacement,
              env: tailwindConfig
            });
            editor.edit((editBuilder) => {
              editBuilder.replace(selection, sortedText);
            });
          }
        }
      }
    }
  );

  context.subscriptions.push(runOnProject);
  context.subscriptions.push(disposable);

  // if runOnSave is enabled organize tailwind classes before saving
  if (config.get('tailwind-raw-reorder.runOnSave')) {
    context.subscriptions.push(
      workspace.onWillSaveTextDocument((_e) => {
        commands.executeCommand('tailwind-raw-reorder.sortTailwindClasses');
      })
    );
  }
}
