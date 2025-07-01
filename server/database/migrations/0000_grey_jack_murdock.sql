CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`address_line1` text NOT NULL,
	`address_line2` text,
	`address_line3` text,
	`city` text NOT NULL,
	`state` text,
	`postal_code` text NOT NULL,
	`country` text NOT NULL,
	`address_type` text DEFAULT 'billing',
	`name` text NOT NULL,
	`phone` text,
	`is_default` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`username` text NOT NULL,
	`phone` text,
	`password` text,
	`is_phone_verified` integer DEFAULT false,
	`is_email_verified` integer DEFAULT false,
	`name` text DEFAULT '',
	`bio` text DEFAULT '',
	`avatar` text DEFAULT '',
	`birthday` text DEFAULT '',
	`gender` text DEFAULT 'prefer-not-to-say',
	`status` text DEFAULT 'active',
	`social` integer DEFAULT false,
	`social_provider` text,
	`social_id` text,
	`country` text DEFAULT '',
	`city` text DEFAULT '',
	`street` text DEFAULT '',
	`postal_Code` text DEFAULT '',
	`address_Line1` text DEFAULT '',
	`address_Line2` text DEFAULT '',
	`address_Line3` text DEFAULT '',
	`roles` text DEFAULT '["user"]',
	`last_login` integer DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);