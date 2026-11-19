const { test, expect } = require('../fixtures');
const { api, authenticatedPage, createFixtureGroup, deleteFixtureGroup, makeMemberPending, qaConfig } = require('../helpers');

test('@security public headers and protected resources reject anonymous access', async ({ request }) => {
  const home = await request.get('/');
  expect(home.status()).toBe(200);
  const headers = home.headers();
  expect(headers['strict-transport-security']).toBeTruthy();
  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  for (const path of ['/api/groups', '/api/admin/overview', '/api/profile/me', '/.env', '/schema.sql', '/api/auth_helper.php']) {
    const response = await request.get(path);
    expect([401, 403]).toContain(response.status());
  }
  const invalid = await request.get('/api/groups', { headers: { Authorization: 'Bearer malformed.token.value' } });
  expect(invalid.status()).toBe(401);
});

test('@security system diagnostics remain admin-only', async ({ request }) => {
  const response = await request.post('/api/admin/security/scan');
  expect([401, 403]).toContain(response.status());
});

test('@security member cannot manage or delete an owner fixture group', async ({ browser }) => {
  const config = qaConfig();
  const owner = await authenticatedPage(browser, config.owner);
  const member = await authenticatedPage(browser, config.member);
  let group;
  try {
    group = await createFixtureGroup(owner.page, config);
    await makeMemberPending(owner.page, member.page, group.id);
    const management = await api(owner.page, 'GET', `/groups/${group.id}/management`);
    const request = management.body.join_requests.find(entry => entry.username === config.member.username);
    expect(request, `Expected a pending join request: ${JSON.stringify(management.body)}`).toBeTruthy();
    expect((await api(owner.page, 'POST', `/groups/${group.id}/join-requests`, { request_id: request.id, action: 'approve' })).status).toBe(200);
    expect((await api(member.page, 'GET', `/groups/${group.id}/management`)).status).toBe(403);
    expect((await api(member.page, 'DELETE', `/groups/${group.id}/members?user_id=999999999`)).status).toBe(403);
    expect((await api(member.page, 'DELETE', `/groups/${group.id}`)).status).toBe(403);
    expect((await api(member.page, 'GET', '/admin/overview')).status).toBe(403);
  } finally {
    await deleteFixtureGroup(owner.page, group && group.id);
    await owner.context.close();
    await member.context.close();
  }
});

test('@security invitation redemption must be POST and GET must not mutate state', async ({ browser }) => {
  const config = qaConfig();
  const owner = await authenticatedPage(browser, config.owner);
  const member = await authenticatedPage(browser, config.member);
  let group;
  try {
    group = await createFixtureGroup(owner.page, config);
    const invite = await api(owner.page, 'POST', '/invite/create', { group_id: group.id });
    expect(invite.status).toBe(200);
    const getJoin = await api(member.page, 'GET', `/invite/join?t=${encodeURIComponent(invite.body.token)}`);
    expect(getJoin.status, 'Invitation GET must be rejected to prevent state-changing GET requests').toBe(405);
    const postJoin = await api(member.page, 'POST', '/invite/join', { token: invite.body.token });
    expect(postJoin.status, 'Invitation POST must create the join request').toBe(200);
  } finally {
    await deleteFixtureGroup(owner.page, group && group.id);
    await owner.context.close();
    await member.context.close();
  }
});
