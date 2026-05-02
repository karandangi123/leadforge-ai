import test from "node:test";
import assert from "node:assert/strict";
import { getGmailConnectionHealth } from "./gmail-connection-health";

test("gmail connection health is active only when required scopes are present and the workspace snapshot is synced", () => {
  const active = getGmailConnectionHealth({
    status: "CONNECTED",
    scope:
      "openid email profile https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels",
    expiresAt: new Date(Date.now() + 60_000),
    refreshToken: "refresh-token",
    lastError: null,
    connectedEmail: "operator@example.com",
    syncStatus: "SYNCED",
    syncError: null,
  });

  assert.equal(active.status, "connected");
  assert.equal(active.isActive, true);
});

test("gmail connection health requires reconnect when the labels scope is missing", () => {
  const missingScope = getGmailConnectionHealth({
    status: "CONNECTED",
    scope: "openid email profile https://www.googleapis.com/auth/gmail.compose",
    expiresAt: null,
    refreshToken: "refresh-token",
    lastError: null,
    connectedEmail: "operator@example.com",
    syncStatus: "SYNCED",
    syncError: null,
  });

  assert.equal(missingScope.status, "error");
  assert.equal(missingScope.isActive, false);
  assert.equal(missingScope.requiresReconnect, true);
});

test("gmail connection health expires when there is no refresh token fallback", () => {
  const expired = getGmailConnectionHealth({
    status: "CONNECTED",
    scope:
      "https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels",
    expiresAt: new Date(Date.now() - 60_000),
    refreshToken: null,
    lastError: null,
    connectedEmail: "operator@example.com",
    syncStatus: "SYNCED",
    syncError: null,
  });

  assert.equal(expired.status, "expired");
  assert.equal(expired.isActive, false);
});

test("gmail connection health stays inactive when the workspace sync failed", () => {
  const failedSync = getGmailConnectionHealth({
    status: "CONNECTED",
    scope:
      "https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels",
    expiresAt: new Date(Date.now() + 60_000),
    refreshToken: "refresh-token",
    lastError: null,
    connectedEmail: "operator@example.com",
    syncStatus: "FAILED",
    syncError: "Gmail labels API returned 403",
  });

  assert.equal(failedSync.status, "error");
  assert.equal(failedSync.isActive, false);
  assert.equal(failedSync.requiresReconnect, false);
});
