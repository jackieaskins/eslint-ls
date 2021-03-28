import { ESLint } from 'eslint';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

const engine = new ESLint();

export async function lint(
  document: TextDocument
): Promise<ESLint.LintResult[]> {
  const filePath = URI.parse(document.uri).path;

  return await engine.lintText(document.getText(), { filePath });
}
