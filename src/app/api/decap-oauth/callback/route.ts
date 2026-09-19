function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(request, 'decap_oauth_state');

  if (!state || !cookieState || state !== cookieState) {
    return new Response('Invalid state', { status: 400 });
  }

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const { access_token: accessToken, error } = await tokenResponse.json();

  if (error || !accessToken) {
    return new Response(`OAuth error: ${error ?? 'unknown'}`, { status: 400 });
  }

  const message = JSON.stringify({ token: accessToken, provider: 'github' });
  const expectedOrigin = url.origin;

  const html = `
    <!doctype html>
    <html><body>
    <p>Login successful. This window will close automatically.</p>
    <script>
      (function() {
        var expectedOrigin = ${JSON.stringify(expectedOrigin)};
        function receiveMessage(e) {
          if (e.origin !== expectedOrigin) {
            return;
          }
          window.opener.postMessage(
            'authorization:github:success:${message}',
            e.origin
          );
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
    </body></html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': 'decap_oauth_state=; Path=/api/decap-oauth; Max-Age=0',
    },
  });
}
