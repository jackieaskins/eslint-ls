#!/usr/bin/env node

import _ from 'lodash';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';

import { getCodeActions } from './codeActions';
import { ESLintDiagnostic, getDiagnostics } from './diagnostics';
import { lint } from './eslint';

const DEBOUNCE_MS = 1000;

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onCodeAction(
  ({ context: { diagnostics }, textDocument: { uri } }) => {
    const document = documents.get(uri);

    if (!document) {
      return [];
    }

    return getCodeActions(diagnostics as ESLintDiagnostic[], document);
  }
);

connection.onInitialize(() => ({
  capabilities: {
    codeActionProvider: true,
    textDocumentSync: TextDocumentSyncKind.Incremental,
  },
}));

documents.onDidChangeContent(({ document: { uri } }) => {
  _.debounce(validateTextFunction, DEBOUNCE_MS)(uri);
});

async function validateTextFunction(uri: string): Promise<void> {
  const textDocument = documents.get(uri);

  if (!textDocument) {
    return;
  }

  const lintResults = await lint(uri, textDocument);

  connection.sendDiagnostics({
    uri,
    diagnostics: getDiagnostics(lintResults),
  });
}

documents.listen(connection);
connection.listen();
