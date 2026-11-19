const baseURL = process.env.QA_BASE_URL || 'https://sharedcart.h1la.com';
const qaRequestToken = process.env.QA_REQUEST_TOKEN || '';

const qaRequestHeaders = () => qaRequestToken ? { 'x-qa-token': qaRequestToken } : {};

async function addQaRequestHeader(page) {
  if (!qaRequestToken) return;
  const origin = new URL(baseURL).origin;
  await page.route(`${origin}/**`, route => route.continue({
    headers: { ...route.request().headers(), ...qaRequestHeaders() }
  }));
}

module.exports = { addQaRequestHeader, qaRequestHeaders };
