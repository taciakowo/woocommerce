import { ESLint } from 'eslint';
import { expect } from 'chai';

describe('Linting Tests', function () {
  it('Nie powinno być zbędnych zmiennych (no-unused-vars)', async function () {
    const eslint = new ESLint({ overrideConfig: { rules: { 'no-unused-vars': 'error' } } });
    const results = await eslint.lintFiles(['src/**/*.js']);
    const errors = results.flatMap(file => file.messages.filter(msg => msg.ruleId === 'no-unused-vars'));

    expect(errors.length, 'Znaleziono zbędne zmienne!').to.equal(0);
  });
});
