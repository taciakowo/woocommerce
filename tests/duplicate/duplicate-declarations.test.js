import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

const FILES_TO_CHECK = ['src/**/*.js'];

function checkDuplicateDeclarations(keyword) {
  return FILES_TO_CHECK.flatMap(pattern => {
    const files = fs.readdirSync(path.resolve(pattern.replace('**/*.js', '')));
    return files.flatMap(file => {
      const content = fs.readFileSync(path.join(pattern.replace('**/*.js', ''), file), 'utf8');
      const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      return matches && matches.length > 1 ? [`${file}: ${matches.length} razy`] : [];
    });
  });
}

describe('Sprawdzenie podwójnych deklaracji zmiennych', function () {
  it('params nie powinien być zadeklarowany więcej niż raz w pliku', function () {
    const duplicates = checkDuplicateDeclarations('params');
    expect(duplicates.length, `Podwójne deklaracje params: ${duplicates.join(', ')}`).to.equal(0);
  });

  it('dotenv nie powinien być zadeklarowany więcej niż raz w pliku', function () {
    const duplicates = checkDuplicateDeclarations('dotenv');
    expect(duplicates.length, `Podwójne deklaracje dotenv: ${duplicates.join(', ')}`).to.equal(0);
  });
});
