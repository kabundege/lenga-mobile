CREATE TABLE `file_downloads` (
	`id` text PRIMARY KEY NOT NULL,
	`file_url` text NOT NULL,
	`local_path` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress_percent` integer DEFAULT 0 NOT NULL,
	`resume_token` text,
	`bytes_written` integer DEFAULT 0 NOT NULL,
	`bytes_expected` integer,
	`last_error` text,
	`updated_at` text NOT NULL
);
