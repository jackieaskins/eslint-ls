import { Rule } from 'eslint';
import _ from 'lodash';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction, CodeActionKind, Range } from 'vscode-languageserver-types';

import { getWorkspaceEditFromFix } from '../utils/edits';
import { ESLintDiagnostic } from './diagnostics';

function createCodeActionFromFix(
  fix: Rule.Fix,
  document: TextDocument,
  diagnostics: ESLintDiagnostic[],
  title: string,
  isPreferred: boolean
): CodeAction {
  return {
    title: `[eslint] ${title}`,
    kind: CodeActionKind.QuickFix,
    isPreferred,
    diagnostics,
    edit: getWorkspaceEditFromFix(fix, document),
  };
}

export function getCodeActions(
  diagnostics: ESLintDiagnostic[],
  document: TextDocument,
  range: Range
): CodeAction[] {
  const codeActions = diagnostics.reduce<CodeAction[]>(
    (accum, diagnostic): CodeAction[] => {
      const { code, data } = diagnostic;
      const { fix, suggestions } = data;

      const fixCodeActions = fix
        ? [
            createCodeActionFromFix(
              fix,
              document,
              [diagnostic],
              `Fix ${code}`,
              true
            ),
          ]
        : [];

      const suggestionsCodeActions = suggestions
        ? suggestions.map(({ desc, fix }) =>
            createCodeActionFromFix(fix, document, [diagnostic], desc, false)
          )
        : [];

      return [...accum, ...fixCodeActions, ...suggestionsCodeActions];
    },
    []
  );

  const uniqueCodes = _.uniq(
    diagnostics.map(({ code }) => code).filter((code) => !!code)
  );

  const currentLine = document.getText({
    start: { line: range.start.line, character: 0 },
    end: { line: range.start.line + 1, character: 0 },
  });
  const indent = currentLine.match(/\s+/g)?.[0] ?? '';

  const disableActions = uniqueCodes.flatMap((code) => [
    {
      title: `[eslint] Disable ${code} for current line`,
      kind: CodeActionKind.QuickFix,
      isPreferred: false,
      diagnostics,
      edit: {
        changes: {
          [document.uri]: [
            {
              range: {
                start: { line: range.start.line, character: 0 },
                end: { line: range.start.line, character: 0 },
              },
              newText: `${indent}// eslint-disable-next-line ${code}\n`,
            },
          ],
        },
      },
    },
    {
      title: `[eslint] Disable ${code} for file`,
      kind: CodeActionKind.QuickFix,
      isPreferred: false,
      diagnostics,
      edit: {
        changes: {
          [document.uri]: [
            {
              range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 0 },
              },
              newText: `/* eslint-disable ${code} */\n`,
            },
          ],
        },
      },
    },
  ]);

  return [...codeActions, ...disableActions];
}
