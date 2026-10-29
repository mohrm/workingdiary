import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it('escapes characters that could break out of HTML text or attributes', () => {
    assert.equal(
      escapeHtml('<script>alert("x")</script>'),
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
    assert.equal(escapeHtml("a'b&c"), 'a&#39;b&amp;c');
  });

  it('leaves plain activity names untouched', () => {
    assert.equal(escapeHtml('Regulatorik'), 'Regulatorik');
    assert.equal(escapeHtml('Meetings/QA'), 'Meetings/QA');
  });
});
