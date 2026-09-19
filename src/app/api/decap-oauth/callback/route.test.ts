import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

describe('GET /api/decap-oauth/callback', () => {
  it('stateがCookieの値と一致しない場合は400を返し、GitHubへ問い合わせない', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const request = new Request(
      'http://localhost:3000/api/decap-oauth/callback?code=dummy&state=wrong-state',
      { headers: { cookie: 'decap_oauth_state=correct-state' } }
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('stateパラメータ自体が無い場合は400を返し、GitHubへ問い合わせない', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const request = new Request(
      'http://localhost:3000/api/decap-oauth/callback?code=dummy',
      { headers: { cookie: 'decap_oauth_state=correct-state' } }
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
