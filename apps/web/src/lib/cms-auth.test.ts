import assert from "node:assert/strict";
import test from "node:test";
import {
  canCreateCmsPost,
  canDeleteCmsPost,
  canEditCmsPost,
  canManageCmsAuthors,
  canPublishCmsPost,
  canUploadCmsMedia,
  canViewCms,
} from "./cms-auth.js";

test("admin has full CMS post and author control", () => {
  assert.equal(canViewCms("admin"), true);
  assert.equal(canCreateCmsPost("admin"), true);
  assert.equal(canEditCmsPost("admin", "someone-else", "admin-id"), true);
  assert.equal(canDeleteCmsPost("admin"), true);
  assert.equal(canPublishCmsPost("admin"), true);
  assert.equal(canManageCmsAuthors("admin"), true);
  assert.equal(canUploadCmsMedia("admin"), true);
});

test("editor creates and edits own drafts but cannot publish or delete", () => {
  assert.equal(canCreateCmsPost("editor"), true);
  assert.equal(canEditCmsPost("editor", "editor-id", "editor-id"), true);
  assert.equal(canEditCmsPost("editor", "other-id", "editor-id"), false);
  assert.equal(canDeleteCmsPost("editor"), false);
  assert.equal(canPublishCmsPost("editor"), false);
  assert.equal(canManageCmsAuthors("editor"), false);
  assert.equal(canUploadCmsMedia("editor"), true);
});

test("viewer reads only and user role has no CMS access", () => {
  assert.equal(canViewCms("viewer"), true);
  assert.equal(canCreateCmsPost("viewer"), false);
  assert.equal(canViewCms("user"), false);
});
