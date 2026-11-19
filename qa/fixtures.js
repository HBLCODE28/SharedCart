const { test: base, expect } = require('@playwright/test');
const { addQaRequestHeader } = require('./qa-request');

const test = base.extend({
  page: async ({ page }, use) => {
    await addQaRequestHeader(page);
    await use(page);
  }
});

module.exports = { test, expect };
