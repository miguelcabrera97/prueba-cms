export async function onRequest(context) {
    const client_id = context.env.GITHUB_CLIENT_ID;
    
    if (!client_id) {
        return new Response('Missing GITHUB_CLIENT_ID environment variable.', { status: 500 });
    }

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', client_id);
    url.searchParams.set('scope', 'repo,user');
    
    return Response.redirect(url.toString(), 302);
}
