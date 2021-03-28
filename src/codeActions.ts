import { Rule } from 'eslint';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CodeAction,
  CodeActionKind,
  WorkspaceEdit,
} from 'vscode-languageserver-types';

import { ESLintDiagnostic } from './diagnostics';

function getEditFromFix(
  { range, text }: Rule.Fix,
  document: TextDocument
): WorkspaceEdit {
  return {
    changes: {
      [document.uri]: [
        {
          range: {
            start: document.positionAt(range[0]),
            end: document.positionAt(range[1]),
          },
          newText: text,
        },
      ],
    },
  };
}

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
    edit: getEditFromFix(fix, document),
  };
}

export function getCodeActions(
  diagnostics: ESLintDiagnostic[],
  document: TextDocument
): CodeAction[] {
  return diagnostics.reduce<CodeAction[]>((accum, diagnostic): CodeAction[] => {
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
  }, []);
}
