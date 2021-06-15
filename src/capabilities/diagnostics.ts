import { ESLint, Linter, Rule } from 'eslint';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';

type DiagnosticData = {
  fix?: Rule.Fix;
  suggestions?: Linter.LintSuggestion[];
};

export interface ESLintDiagnostic extends Diagnostic {
  data: DiagnosticData;
}

export function getDiagnostics(
  lintResults: ESLint.LintResult[]
): ESLintDiagnostic[] {
  return lintResults.flatMap(({ messages }) =>
    messages.map(
      ({
        column,
        endColumn,
        endLine,
        fix,
        line,
        message,
        ruleId,
        severity,
        suggestions,
      }) => ({
        severity:
          severity === 1
            ? DiagnosticSeverity.Warning
            : DiagnosticSeverity.Error,
        range: {
          start: { line: line - 1, character: column - 1 },
          end: {
            line: (endLine ?? line) - 1,
            character: (endColumn ?? column) - 1,
          },
        },
        code: ruleId ?? undefined,
        message: ['[eslint]', message, ruleId && `[${ruleId}]`]
          .filter((item) => !!item)
          .join(' '),
        source: 'eslint',
        data: {
          fix,
          suggestions,
        },
      })
    )
  );
}
