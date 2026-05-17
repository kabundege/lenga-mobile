import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

/** Scalar sync checkpoints (e.g. lastSyncedAt ISO string per locale or global). */
export const syncState = sqliteTable('sync_state', {
  key: text('key').primaryKey(),
  valueText: text('value_text').notNull(),
});

/**
 * Normalized Strapi cache rows keyed by collection + Strapi documentId + locale.
 * Payload holds the JSON-serialized entity from REST until finer relational tables land.
 */
export const strapiEntities = sqliteTable(
  'strapi_entities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    collection: text('collection').notNull(),
    documentId: text('document_id').notNull(),
    locale: text('locale').notNull(),
    updatedAtRemote: text('updated_at_remote').notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    payloadJson: text('payload_json').notNull(),
  },
  (table) => ({
    collectionDocLocale: uniqueIndex('strapi_entities_coll_doc_locale').on(
      table.collection,
      table.documentId,
      table.locale,
    ),
  }),
);

/** Tracks downloaded Strapi Upload URLs → local file URIs for retries & offline UX. */
export const localAssets = sqliteTable('local_assets', {
  remoteUrl: text('remote_url').primaryKey(),
  localUri: text('local_uri'),
  status: text('status').notNull().default('pending'),
  lastError: text('last_error'),
  attemptCount: integer('attempt_count').notNull().default(0),
  updatedAt: text('updated_at'),
});

/**
 * Large-file download queue with Expo `DownloadResumable` persistence.
 * `resumeToken` is populated after `pauseAsync()` (and best-effort on backgrounding), not on every progress tick.
 */
export const fileDownloads = sqliteTable('file_downloads', {
  id: text('id').primaryKey(),
  fileUrl: text('file_url').notNull(),
  localPath: text('local_path').notNull(),
  status: text('status').notNull().default('pending'),
  progressPercent: integer('progress_percent').notNull().default(0),
  resumeToken: text('resume_token'),
  bytesWritten: integer('bytes_written').notNull().default(0),
  bytesExpected: integer('bytes_expected'),
  lastError: text('last_error'),
  updatedAt: text('updated_at').notNull(),
});
