const { test, expect } = require('../fixtures');
const { api, authenticatedPage, createFixtureGroup, deleteFixtureGroup, makeMemberPending, qaConfig } = require('../helpers');

test('@e2e owner and member complete an isolated shared-cart workflow', async ({ browser }) => {
  const config = qaConfig();
  const owner = await authenticatedPage(browser, config.owner);
  const member = await authenticatedPage(browser, config.member);
  let group;
  try {
    group = await createFixtureGroup(owner.page, config);
    await makeMemberPending(owner.page, member.page, group.id);
    const management = await api(owner.page, 'GET', `/groups/${group.id}/management`);
    expect(management.status).toBe(200);
    const request = management.body.join_requests.find(entry => entry.username === config.member.username);
    expect(request, `Expected a pending join request: ${JSON.stringify(management.body)}`).toBeTruthy();
    expect((await api(owner.page, 'POST', `/groups/${group.id}/join-requests`, { request_id: request.id, action: 'approve' })).status).toBe(200);
    expect((await api(member.page, 'GET', '/groups')).body.some(entry => entry.id === group.id)).toBeTruthy();

    const item = await api(owner.page, 'POST', '/items', { group_id: group.id, name: `${config.prefix} item`, quantity: 1, is_staple: false });
    expect(item.status).toBe(201);
    const itemId = item.body.id;
    expect((await api(member.page, 'POST', `/items/${itemId}/contribution`, { quantity: 1 })).status).toBe(200);
    expect((await api(member.page, 'POST', `/items/${itemId}/comments`, { body: `${config.prefix} comment` })).status).toBe(201);
    expect((await api(member.page, 'PATCH', `/items/${itemId}/complete`)).status).toBe(200);
    expect((await api(owner.page, 'PATCH', `/items/${itemId}/uncomplete`)).status).toBe(200);
    const items = await api(member.page, 'GET', `/items?group_id=${group.id}`);
    expect(items.status).toBe(200);
    expect(items.body.items.some(entry => entry.id === itemId)).toBeTruthy();
    expect((await api(member.page, 'GET', `/activity?group_id=${group.id}`)).status).toBe(200);
    expect((await api(owner.page, 'GET', `/notifications?group_id=${group.id}`)).status).toBe(200);
    expect((await api(member.page, 'GET', `/kitchen?group_id=${group.id}`)).status).toBe(200);
    expect((await api(member.page, 'GET', '/reports')).status).toBe(200);
  } finally {
    await deleteFixtureGroup(owner.page, group && group.id);
    await owner.context.close();
    await member.context.close();
  }
});
