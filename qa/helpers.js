const { expect } = require('@playwright/test');
const { addQaRequestHeader } = require('./qa-request');

const required = name => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required QA environment variable: ${name}`);
  return value;
};

const qaConfig = () => ({
  owner: { username: required('QA_OWNER_USERNAME'), password: required('QA_OWNER_PASSWORD') },
  member: { username: required('QA_MEMBER_USERNAME'), password: required('QA_MEMBER_PASSWORD') },
  runId: (process.env.QA_RUN_ID || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`).replace(/[^a-zA-Z0-9-]/g, ''),
  prefix: 'QA-'
});

async function api(page, method, path, data) {
  return page.evaluate(async ({ method, path, data }) => {
    const response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data)
    });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: response.status, body };
  }, { method, path, data });
}

async function login(page, account) {
  await page.goto('/');
  await page.locator('#loginEmail').fill(account.username);
  await page.locator('#loginPassword').fill(account.password);
  await page.locator('#formLogin').press('Enter');
  await expect(page.locator('#screenGroups')).not.toHaveClass(/hidden/);
}

async function authenticatedPage(browser, account) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await addQaRequestHeader(page);
  await login(page, account);
  return { context, page };
}

async function createFixtureGroup(page, config) {
  const name = `${config.prefix}${config.runId}`;
  const response = await api(page, 'POST', '/groups', { name });
  expect(response.status).toBe(201);
  return response.body;
}

async function deleteFixtureGroup(page, groupId) {
  if (!groupId) return;
  const response = await api(page, 'DELETE', `/groups/${groupId}`);
  if (![200, 404].includes(response.status)) throw new Error(`Fixture cleanup failed: HTTP ${response.status}`);
}

async function makeMemberPending(ownerPage, memberPage, groupId) {
  const invite = await api(ownerPage, 'POST', '/invite/create', { group_id: groupId });
  expect(invite.status).toBe(200);
  const joined = await api(memberPage, 'POST', '/invite/join', { token: invite.body.token });
  expect(joined.status).toBe(200);
  expect(joined.body.status).toBe('pending');
  return invite.body.token;
}

module.exports = { api, authenticatedPage, createFixtureGroup, deleteFixtureGroup, login, makeMemberPending, qaConfig };
