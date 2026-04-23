import type { ModelAdapter, CompletionRequest, CompletionResponse } from "./adapter";

export type EvalCase = {
  name: string;
  request: CompletionRequest;
  assertions: EvalAssertion[];
};

export type EvalAssertion =
  | { type: "contains"; value: string; caseSensitive?: boolean }
  | { type: "not_contains"; value: string; caseSensitive?: boolean }
  | { type: "json_valid" }
  | { type: "min_length"; chars: number }
  | { type: "max_length"; chars: number }
  | { type: "custom"; fn: (response: CompletionResponse) => boolean | string };

export type EvalResult = {
  name: string;
  passed: boolean;
  failures: string[];
  response: CompletionResponse;
  durationMs: number;
};

export type EvalSuiteResult = {
  total: number;
  passed: number;
  failed: number;
  results: EvalResult[];
};

function runAssertion(assertion: EvalAssertion, response: CompletionResponse): string | null {
  switch (assertion.type) {
    case "contains": {
      const haystack = assertion.caseSensitive ? response.text : response.text.toLowerCase();
      const needle = assertion.caseSensitive ? assertion.value : assertion.value.toLowerCase();
      return haystack.includes(needle) ? null : `Expected response to contain "${assertion.value}"`;
    }
    case "not_contains": {
      const haystack = assertion.caseSensitive ? response.text : response.text.toLowerCase();
      const needle = assertion.caseSensitive ? assertion.value : assertion.value.toLowerCase();
      return !haystack.includes(needle) ? null : `Expected response NOT to contain "${assertion.value}"`;
    }
    case "json_valid": {
      try {
        JSON.parse(response.text);
        return null;
      } catch {
        return "Expected response to be valid JSON";
      }
    }
    case "min_length":
      return response.text.length >= assertion.chars
        ? null
        : `Expected response length >= ${assertion.chars}, got ${response.text.length}`;
    case "max_length":
      return response.text.length <= assertion.chars
        ? null
        : `Expected response length <= ${assertion.chars}, got ${response.text.length}`;
    case "custom": {
      const result = assertion.fn(response);
      if (result === true) return null;
      if (result === false) return "Custom assertion failed";
      return result;
    }
  }
}

export async function runEval(adapter: ModelAdapter, evalCase: EvalCase): Promise<EvalResult> {
  const start = Date.now();
  const response = await adapter.complete(evalCase.request);
  const durationMs = Date.now() - start;

  const failures: string[] = [];
  for (const assertion of evalCase.assertions) {
    const failure = runAssertion(assertion, response);
    if (failure) failures.push(failure);
  }

  return {
    name: evalCase.name,
    passed: failures.length === 0,
    failures,
    response,
    durationMs,
  };
}

export async function runEvalSuite(
  adapter: ModelAdapter,
  cases: EvalCase[],
): Promise<EvalSuiteResult> {
  const results = await Promise.all(cases.map((c) => runEval(adapter, c)));
  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}

export function printEvalResults(suite: EvalSuiteResult): void {
  console.log(`\nEval results: ${suite.passed}/${suite.total} passed`);
  for (const result of suite.results) {
    const icon = result.passed ? "✓" : "✗";
    console.log(`  ${icon} ${result.name} (${result.durationMs}ms)`);
    for (const failure of result.failures) {
      console.log(`      ${failure}`);
    }
  }
  if (suite.failed > 0) {
    console.log(`\n${suite.failed} eval(s) failed`);
  }
}
