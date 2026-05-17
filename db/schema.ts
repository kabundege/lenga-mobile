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
