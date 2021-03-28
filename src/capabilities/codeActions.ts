import { Rule } from 'eslint';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction, CodeActionKind } from 'vscode-languageserver-types';

import { ESLintDiagnostic } from './diagnostics';
import { getWorkspaceEditFromFix } from '../utils/edits';

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
