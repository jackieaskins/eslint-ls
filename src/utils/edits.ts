import { Rule } from 'eslint';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextEdit, WorkspaceEdit } from 'vscode-languageserver-types';

export function getTextEditFromFix(
  { range, text }: Rule.Fix,
  document: TextDocument
): TextEdit {
  return {
    range: {
      start: document.positionAt(range[0]),
      end: document.positionAt(range[1]),
    },
    newText: text,
  };
}

export function getWorkspaceEditFromFix(
  fix: Rule.Fix,
  document: TextDocument
): WorkspaceEdit {
  return {
    changes: {
      [document.uri]: [getTextEditFromFix(fix, document)],
    },
  };
}
