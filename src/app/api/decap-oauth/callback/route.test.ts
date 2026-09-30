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

  it('アクセストークンに</script>を含む値が返ってきても、スクリプトタグを閉じずに安全に埋め込む', async () => {
    const dangerousToken = '</script><script>alert(1)</script>';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ access_token: dangerousToken }),
      })
    );

    const request = new Request(
      'http://localhost:3000/api/decap-oauth/callback?code=dummy&state=correct-state',
      { headers: { cookie: 'decap_oauth_state=correct-state' } }
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(html).toContain('\\u003c/script\\u003e');
  });
});
