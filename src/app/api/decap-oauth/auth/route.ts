export async function GET(request: Request) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/decap-oauth/callback`;
  const state = crypto.randomUUID();

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId ?? '');
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo,user');
  authorizeUrl.searchParams.set('state', state);

  const cookieAttributes = [
    `decap_oauth_state=${state}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api/decap-oauth',
    'Max-Age=600',
  ];
  if (url.protocol === 'https:') {
    cookieAttributes.push('Secure');
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      'Set-Cookie': cookieAttributes.join('; '),
    },
  });
}
