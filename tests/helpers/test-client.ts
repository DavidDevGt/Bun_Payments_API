import type { Hono } from "hono";

export class TestClient {
  constructor(private app: Hono) {}

  async request(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    },
  ) {
    const url = `http://localhost:3000${path}`;
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    };

    if (options?.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await this.app.request(new Request(url, fetchOptions));
    const data = await response.json();

    return {
      status: response.status,
      data,
      headers: response.headers,
    };
  }

  get(path: string, options?: { headers?: Record<string, string> }) {
    return this.request("GET", path, options);
  }

  post(path: string, body: unknown, options?: { headers?: Record<string, string> }) {
    return this.request("POST", path, { body, ...options });
  }

  put(path: string, body: unknown, options?: { headers?: Record<string, string> }) {
    return this.request("PUT", path, { body, ...options });
  }

  delete(path: string, options?: { headers?: Record<string, string> }) {
    return this.request("DELETE", path, options);
  }
}
