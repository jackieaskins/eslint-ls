#!/usr/bin/env node

import _ from 'lodash';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';

import { getCodeActions } from './capabilities/codeActions';
import { ESLintDiagnostic, getDiagnostics } from './capabilities/diagnostics';
import { getFormattingTextEdits } from './capabilities/documentFormatting';
import { lint } from './eslint';

const DEBOUNCE_MS = 1000;

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

documents.onDidChangeContent(({ document: { uri } }) => {
  _.debounce(async () => {
    const textDocument = documents.get(uri);

    if (!textDocument) {
      return;
    }

    const lintResults = await lint(textDocument);

    connection.sendDiagnostics({
      uri,
      diagnostics: getDiagnostics(lintResults),
    });
  }, DEBOUNCE_MS)();
});

connection.onInitialize(() => ({
  capabilities: {
    codeActionProvider: true,
    documentFormattingProvider: true,
    textDocumentSync: TextDocumentSyncKind.Incremental,
  },
}));

connection.onCodeAction(
  ({ context: { diagnostics }, textDocument: { uri } }) => {
    const document = documents.get(uri);

    if (!document) {
      return [];
    }

    return getCodeActions(diagnostics as ESLintDiagnostic[], document);
  }
);

connection.onDocumentFormatting(async ({ textDocument: { uri } }) => {
  const document = documents.get(uri);

  if (!document) {
    return [];
  }

  return await getFormattingTextEdits(document);
});

documents.listen(connection);
connection.listen();
