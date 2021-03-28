import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextEdit } from 'vscode-languageserver-types';

import { lint } from '../eslint';
import { getTextEditFromFix } from '../utils/edits';

export async function getFormattingTextEdits(
  document: TextDocument
): Promise<TextEdit[]> {
  const results = await lint(document);

  return results.flatMap(({ messages }) =>
    messages.reduce<TextEdit[]>((accum, { fix }) => {
      if (!fix) {
        return accum;
      }

      return [...accum, getTextEditFromFix(fix, document)];
    }, [])
  );
}
