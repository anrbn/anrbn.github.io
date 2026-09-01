---
title: A small HTTP client, built in layers.
description: A modest TypeScript boundary for requests, errors, and the code
  that should not have to think about either.
pubDate: 2026-09-01
kind: blog
draft: false
image: /images/posts/chatgpt-image-aug-31-2026-050311-am.png
---
Most HTTP clients become complicated in the same innocent way: one useful option at a time. A header here, a timeout there, a special case for an empty response, and soon every request carries a small history of the application.

The way out is not a larger abstraction. It is a narrow seam. We want one place that knows how the network behaves and many places that only know what the product is trying to do. If that seam stays small, the code on either side can change without dragging the other along.

This article builds that seam in three layers:

1. **The contract** names the possible outcomes.
2. **The transport** contains `fetch` and turns its awkward edges into ordinary values.
3. **The product layer** gives the application a vocabulary such as `publishDraft` instead of a sequence of headers, status checks, and JSON parsing.

# 1. The Seam

## Types as a Contract

Begin with the outcomes, not the implementation. Callers need to distinguish a response the server rejected from a request that never reached it. They should be able to handle both without catching an exception whose shape is unknown.

A discriminated union makes those paths explicit. The `ok` field is deliberately boring: TypeScript understands it, an `if` statement reads naturally, and no helper library is required.

`src/http/types.ts`

```typescript
export type HttpFailure =
  | {
      kind: "network";
      message: string;
      cause?: unknown;
    }
  | {
      kind: "http";
      status: number;
      message: string;
      body: unknown;
    };

export type Result<T> =
  | { ok: true; data: T; response: Response }
  | { ok: false; error: HttpFailure; response?: Response };

export interface ClientOptions {
  baseUrl: string;
  headers?: HeadersInit;
  fetch?: typeof globalThis.fetch;
}
```

### Where the Side Effect Enters

The injected `fetch` looks like a testing convenience, and it is. More importantly, it states where the side effect enters.

The client owns the network. Everything above it can remain plain TypeScript.

# 2. The Transport

## One Boundary for `fetch`

The transport layer has only a few jobs:

- assemble a URL
- merge headers
- perform the request
- decode a body when one exists
- normalize failure

It should not know that the application has posts, users, invoices, or drafts.

### Why Keep These Responsibilities Together?

Keeping those responsibilities together matters. If JSON parsing is scattered across call sites, a `204 No Content` response becomes a dozen separate bugs. If status handling is scattered, each feature invents a slightly different definition of success.

### `src/http/client.ts`

```typescript
import type { ClientOptions, Result } from "./types";

export function createHttpClient(options: ClientOptions) {
  const runFetch = options.fetch ?? globalThis.fetch;

  async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<Result<T>> {
    const headers = new Headers(options.headers);

    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    try {
      const response = await runFetch(
        new URL(path, options.baseUrl),
        { ...init, headers },
      );

      const body = response.status === 204
        ? undefined
        : await response.json().catch(() => undefined);

      if (!response.ok) {
        return {
          ok: false,
          error: {
            kind: "http",
            status: response.status,
            message: response.statusText || "Request failed",
            body,
          },
          response,
        };
      }

      return {
        ok: true,
        data: body as T,
        response,
      };
    } catch (cause) {
      return {
        ok: false,
        error: {
          kind: "network",
          message: "Network unavailable",
          cause,
        },
      };
    }
  }

  return {
    get: <T>(path: string) => request<T>(path),

    post: <T>(path: string, body: unknown) =>
      request<T>(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      }),
  };
}
```

## Errors Are Data

Notice what the helper does not do: it does not throw for an expected HTTP failure.

A `404` and a `422` are answers from the server, not failures of control flow. Returning them as data makes the unhappy path visible in the function signature and keeps recovery near the decision that owns it.

### Exceptions vs Expected Failures

> Exceptions are valuable for broken assumptions. A server saying "no" is usually not a broken assumption; it is part of the conversation.

There are reasonable variations. You may prefer throwing errors because your framework has an error boundary, or you may need separate kinds for timeouts and cancellation.

The important part is not this exact union. It is choosing one vocabulary at the boundary instead of forcing every caller to interpret raw platform behavior.

# 3. The Product Layer

## Keep Call Sites Quiet

The final layer speaks in product terms.

It knows which endpoint publishes a draft and what a post looks like, but it does not know how headers are merged or how an empty body is decoded. The resulting function is small enough that its name carries most of the meaning.

### `src/posts/publish-draft.ts`

```typescript
import { createHttpClient } from "../http/client";

type Post = {
  id: string;
  title: string;
  publishedAt: string;
};

const http = createHttpClient({
  baseUrl: "https://api.example.com",
  headers: {
    accept: "application/json",
  },
});

export async function publishDraft(draftId: string) {
  const result = await http.post<Post>(
    `/drafts/${draftId}/publish`,
    { notifySubscribers: true },
  );

  if (!result.ok) {
    return {
      published: false,
      reason: result.error,
    } as const;
  }

  return {
    published: true,
    post: result.data,
  } as const;
}
```

### Let the Product Layer Supply Judgment

The call site now decides what failure means for the feature.

A form might keep the draft and show a message. A background job might retry a network error but stop on a validation response.

The transport reports facts; the product layer supplies judgment.

# 4. Confidence

## Test the Seam

Because the side effect enters through one option, the test does not need to patch a global or start a server.

A tiny fake can return a real `Response`, which lets the test exercise status handling and body decoding together.

### `src/http/client.test.ts`

```typescript
import { expect, it, vi } from "vitest";
import { createHttpClient } from "./client";

it("returns a typed HTTP failure", async () => {
  const fakeFetch = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        message: "Draft is empty",
      }),
      {
        status: 422,
        statusText: "Unprocessable Content",
        headers: {
          "content-type": "application/json",
        },
      },
    ),
  );

  const http = createHttpClient({
    baseUrl: "https://api.example.com",
    fetch: fakeFetch,
  });

  const result = await http.post(
    "/drafts/42/publish",
    {},
  );

  expect(result.ok).toBe(false);

  if (!result.ok && result.error.kind === "http") {
    expect(result.error.status).toBe(422);
    expect(result.error.body).toEqual({
      message: "Draft is empty",
    });
  }
});
```

### Test Public Behavior

The test is intentionally close to the public behavior. It does not inspect a private parser or assert the exact options object passed to `fetch`.

That freedom matters: the client can gain tracing, retries, or a different header strategy without rewriting tests that never cared about those details.

# 5. The Next Layer

## Growing the Client

A production client will eventually need more:

- cancellation
- authentication
- observability
- request identifiers
- timeout handling
- a careful retry strategy for idempotent requests

Add each capability at the lowest layer that can own it completely.

### Keep Responsibilities at Their Natural Layer

Authentication headers belong at the boundary.

"Try publishing again" belongs with the feature.

A request identifier may cross both, but only because both have a legitimate reason to know it.

## Keep the Seam Small

The small client above is not finished, and that is its strength. It has an obvious center and clear edges.

You can point to:

- the line where the outside world begins
- the type that describes how it can fail
- the function where a product decision is made

When code has those landmarks, growth does not have to mean losing your way.