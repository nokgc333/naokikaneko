import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

describe('GET /api/decap-oauth/auth', () => {
  it('GitHubの認可URLへリダイレクトする', async () => {
    vi.stubEnv('GITHUB_OAUTH_CLIENT_ID', 'test-client-id');
    const request = new Request('http://localhost:3000/api/decap-oauth/auth');
    const response = await GET(request);
    expect(response.status).toBe(302);
    const location = response.headers.get('location');
    expect(location).toContain('https://github.com/login/oauth/authorize');
    expect(location).toContain('client_id=test-client-id');
  });

  it('CSRF対策のstateパラメータを生成し、認可URLとCookie両方に含める', async () => {
    vi.stubEnv('GITHUB_OAUTH_CLIENT_ID', 'test-client-id');
    const request = new Request('http://localhost:3000/api/decap-oauth/auth');
    const response = await GET(request);

    const location = new URL(response.headers.get('location') ?? '');
    const stateInUrl = location.searchParams.get('state');
    expect(stateInUrl).toBeTruthy();

    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain(`decap_oauth_state=${stateInUrl}`);
    expect(setCookie).toContain('HttpOnly');
  });
});
