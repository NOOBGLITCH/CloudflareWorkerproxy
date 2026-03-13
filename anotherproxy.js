addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const TARGET_DOMAIN = "https://browserplay.pages.dev/"

async function handleRequest(request) {

  const url = new URL(request.url)

  // Build target URL
  const targetURL = new URL(TARGET_DOMAIN + url.pathname + url.search)

  // Clone headers
  const headers = new Headers(request.headers)

  headers.set("Host", new URL(TARGET_DOMAIN).host)
  headers.set("Origin", TARGET_DOMAIN)
  headers.set("Referer", TARGET_DOMAIN)

  const newRequest = new Request(targetURL, {
    method: request.method,
    headers: headers,
    body: request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : null,
    redirect: "manual"
  })

  try {

    const response = await fetch(newRequest)

    const responseHeaders = new Headers(response.headers)

    // Remove security restrictions
    responseHeaders.delete("content-security-policy")
    responseHeaders.delete("x-frame-options")

    responseHeaders.set("Access-Control-Allow-Origin", "*")
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })

  } catch (err) {

    return new Response(
      "Proxy error: " + err.message,
      { status: 500 }
    )

  }
}