const port = Number(Bun.env.PORT ?? "18080");

const orders = new Map([
	["1001", { id: "1001", owner: "alice", total: 129.5 }],
	["1002", { id: "1002", owner: "bob", total: 840.0 }],
]);

function json(data: unknown, init?: ResponseInit): Response {
	return Response.json(data, {
		headers: {
			"cache-control": "no-store",
			...(init?.headers ?? {}),
		},
		status: init?.status,
		statusText: init?.statusText,
	});
}

Bun.serve({
	port,
	fetch(request) {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			return new Response("red-team mock service\n", { headers: { "content-type": "text/plain" } });
		}

		const orderMatch = /^\/api\/orders\/([^/]+)$/.exec(url.pathname);
		if (request.method === "GET" && orderMatch) {
			const token = request.headers.get("authorization");
			if (token !== "Bearer lowpriv-demo") {
				return json({ error: "missing or invalid token" }, { status: 401 });
			}

			const order = orders.get(orderMatch[1]!);
			if (!order) {
				return json({ error: "not found" }, { status: 404 });
			}

			return json(order);
		}

		return json({ error: "not found" }, { status: 404 });
	},
});

process.stdout.write(`mock red-team target listening on http://127.0.0.1:${port}\n`);
