// rough test with some errors not finalized

import { describe, it, expect } from 'jasmine';

describe('Font Loading Test', () => {
  const div = document.createElement('div');
  div.style.fontFamily = 'Lato';
  document.body.appendChild(div);
  it('should have Lato font applied', () => {
    const computedFontFamily = window.getComputedStyle(div).fontFamily;
    expect(computedFontFamily).toContain('Lato');
  });
});