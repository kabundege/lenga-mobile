CREATE TABLE `local_assets` (
	`remote_url` text PRIMARY KEY NOT NULL,
	`local_uri` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_error` text,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `strapi_entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection` text NOT NULL,
	`document_id` text NOT NULL,
	`locale` text NOT NULL,
	`updated_at_remote` text NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`payload_json` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `strapi_entities_coll_doc_locale` ON `strapi_entities` (`collection`,`document_id`,`locale`);--> statement-breakpoint
CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value_text` text NOT NULL
);
