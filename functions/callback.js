export async function onRequest(context) {
    const client_id = context.env.GITHUB_CLIENT_ID;
    const client_secret = context.env.GITHUB_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return new Response('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variables.', { status: 500 });
    }

    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response('Missing code parameter.', { status: 400 });
    }

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return new Response(JSON.stringify(tokenData), { status: 401 });
        }

        const messagePayload = JSON.stringify({
            token: tokenData.access_token,
            provider: 'github'
        });

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="utf-8"></head>
        <body>
            <script>
                function receiveMessage(e) {
                    window.opener.postMessage(
                        'authorization:github:success:' + '${messagePayload}',
                        e.origin
                    );
                }
                window.addEventListener("message", receiveMessage, false);
                window.opener.postMessage("authorizing:github", "*");
            </script>
        </body>
        </html>
        `;

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8'
            }
        });
    } catch (error) {
        return new Response('Error exchanging code for token: ' + error.message, { status: 500 });
    }
}
