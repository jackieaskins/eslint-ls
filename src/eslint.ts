import { ESLint } from 'eslint';
import { dirname } from 'path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

export async function lint(
  fileUri: string,
  textDocument: TextDocument
): Promise<ESLint.LintResult[]> {
  const filePath = URI.parse(fileUri).path;
  const cwd = dirname(filePath);
  const engine = new ESLint({ cwd });

  return await engine.lintText(textDocument.getText(), { filePath });
}
