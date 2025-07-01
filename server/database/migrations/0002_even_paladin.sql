PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`unread` integer DEFAULT true,
	`name` text DEFAULT '',
	`email` text DEFAULT '',
	`phone` integer NOT NULL,
	`subject` text DEFAULT '',
	`message` text DEFAULT '',
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_contacts`("id", "user", "unread", "name", "email", "phone", "subject", "message", "created_at", "updated_at") SELECT "id", "user", "unread", "name", "email", "phone", "subject", "message", "created_at", "updated_at" FROM `contacts`;--> statement-breakpoint
DROP TABLE `contacts`;--> statement-breakpoint
ALTER TABLE `__new_contacts` RENAME TO `contacts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text DEFAULT '',
	`description` text DEFAULT '',
	`discount` integer DEFAULT 0,
	`min_order_amount` integer DEFAULT 0,
	`first_order_only` integer DEFAULT false,
	`active` integer DEFAULT false,
	`usage_limit` integer DEFAULT 0,
	`used_count` integer DEFAULT 0,
	`start_date` text DEFAULT '',
	`end_date` text DEFAULT '',
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_coupons`("id", "code", "description", "discount", "min_order_amount", "first_order_only", "active", "usage_limit", "used_count", "start_date", "end_date", "created_at", "updated_at") SELECT "id", "code", "description", "discount", "min_order_amount", "first_order_only", "active", "usage_limit", "used_count", "start_date", "end_date", "created_at", "updated_at" FROM `coupons`;--> statement-breakpoint
DROP TABLE `coupons`;--> statement-breakpoint
ALTER TABLE `__new_coupons` RENAME TO `coupons`;--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `__new_addresses` (
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
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_addresses`("id", "user", "address_line1", "address_line2", "address_line3", "city", "state", "postal_code", "country", "address_type", "name", "phone", "is_default", "created_at", "updated_at") SELECT "id", "user", "address_line1", "address_line2", "address_line3", "city", "state", "postal_code", "country", "address_type", "name", "phone", "is_default", "created_at", "updated_at" FROM `addresses`;--> statement-breakpoint
DROP TABLE `addresses`;--> statement-breakpoint
ALTER TABLE `__new_addresses` RENAME TO `addresses`;--> statement-breakpoint
CREATE TABLE `__new_users` (
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
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "username", "phone", "password", "is_phone_verified", "is_email_verified", "name", "bio", "avatar", "birthday", "gender", "status", "social", "social_provider", "social_id", "country", "city", "street", "postal_Code", "address_Line1", "address_Line2", "address_Line3", "roles", "last_login", "created_at", "updated_at") SELECT "id", "email", "username", "phone", "password", "is_phone_verified", "is_email_verified", "name", "bio", "avatar", "birthday", "gender", "status", "social", "social_provider", "social_id", "country", "city", "street", "postal_Code", "address_Line1", "address_Line2", "address_Line3", "roles", "last_login", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text,
	`name` text DEFAULT '',
	`description` text DEFAULT '',
	`overview` text DEFAULT '',
	`features` text DEFAULT '',
	`highlights` text DEFAULT '',
	`thumbnail` text DEFAULT '',
	`video` text DEFAULT '',
	`published` integer DEFAULT false,
	`featured` integer DEFAULT false,
	`fetched` integer DEFAULT false,
	`h_variants` integer DEFAULT false,
	`active_variants` integer DEFAULT false,
	`seo_title` text DEFAULT '',
	`seo_description` text DEFAULT '',
	`seo_tags` text DEFAULT '[]',
	`og_img` text DEFAULT '',
	`tags` text DEFAULT '[]',
	`brand` integer,
	`category` integer,
	`season` text DEFAULT '',
	`specs` text DEFAULT '{}',
	`estimated_delivery` text DEFAULT '',
	`sale_price` real DEFAULT 0,
	`purchase_price` real DEFAULT 0,
	`discount` real DEFAULT 0,
	`shipping_cost` real DEFAULT 0,
	`max_shipping_products` integer DEFAULT 5,
	`min_shipping_products` integer DEFAULT 1,
	`free_shipping` integer DEFAULT false,
	`sold` integer DEFAULT 0,
	`view` integer DEFAULT 0,
	`stock` integer DEFAULT 0,
	`likes` integer DEFAULT 0,
	`shares` integer DEFAULT 0,
	`rating` real DEFAULT 0,
	`brand_warranty` integer DEFAULT false,
	`brand_wrt_duration` text DEFAULT '',
	`seller_warranty` integer DEFAULT false,
	`seller_wrt_duration` text DEFAULT '',
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`brand`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "sku", "name", "description", "overview", "features", "highlights", "thumbnail", "video", "published", "featured", "fetched", "h_variants", "active_variants", "seo_title", "seo_description", "seo_tags", "og_img", "tags", "brand", "category", "season", "specs", "estimated_delivery", "sale_price", "purchase_price", "discount", "shipping_cost", "max_shipping_products", "min_shipping_products", "free_shipping", "sold", "view", "stock", "likes", "shares", "rating", "brand_warranty", "brand_wrt_duration", "seller_warranty", "seller_wrt_duration", "created_at", "updated_at") SELECT "id", "sku", "name", "description", "overview", "features", "highlights", "thumbnail", "video", "published", "featured", "fetched", "h_variants", "active_variants", "seo_title", "seo_description", "seo_tags", "og_img", "tags", "brand", "category", "season", "specs", "estimated_delivery", "sale_price", "purchase_price", "discount", "shipping_cost", "max_shipping_products", "min_shipping_products", "free_shipping", "sold", "view", "stock", "likes", "shares", "rating", "brand_warranty", "brand_wrt_duration", "seller_warranty", "seller_wrt_duration", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `__new_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text,
	`purchase_price` real DEFAULT 0,
	`sale_price` real DEFAULT 0,
	`discount` integer DEFAULT 0,
	`stock` integer DEFAULT 0,
	`sku` text DEFAULT '',
	`order` integer DEFAULT 0,
	`active` integer DEFAULT true,
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_variants`("id", "product", "purchase_price", "sale_price", "discount", "stock", "sku", "order", "active", "created_at", "updated_at") SELECT "id", "product", "purchase_price", "sale_price", "discount", "stock", "sku", "order", "active", "created_at", "updated_at" FROM `variants`;--> statement-breakpoint
DROP TABLE `variants`;--> statement-breakpoint
ALTER TABLE `__new_variants` RENAME TO `variants`;--> statement-breakpoint
CREATE TABLE `__new_stocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text,
	`variant` integer,
	`quantity` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stocks`("id", "product", "variant", "quantity", "created_at", "updated_at") SELECT "id", "product", "variant", "quantity", "created_at", "updated_at" FROM `stocks`;--> statement-breakpoint
DROP TABLE `stocks`;--> statement-breakpoint
ALTER TABLE `__new_stocks` RENAME TO `stocks`;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`payment` text DEFAULT 'Cash On Delivery',
	`payment_method` text DEFAULT 'Cash On Delivery' NOT NULL,
	`lines` integer DEFAULT 0 NOT NULL,
	`sale_price` real DEFAULT 0 NOT NULL,
	`purchase_price` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`extra_price` real DEFAULT 0 NOT NULL,
	`shipping_cost` real DEFAULT 0 NOT NULL,
	`total_price` real DEFAULT 0 NOT NULL,
	`date` text DEFAULT (datetime('now')) NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`pending` text DEFAULT '',
	`processing` text DEFAULT '',
	`shipped` text DEFAULT '',
	`delivered` text DEFAULT '',
	`canceled` text DEFAULT '',
	`rejected` text DEFAULT 'rejected_at',
	`return` text DEFAULT 'return',
	`Confirmed` integer DEFAULT false,
	`Paid` integer DEFAULT false,
	`is_confirmed` integer DEFAULT false NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	`name` text(100) DEFAULT '' NOT NULL,
	`phone` text(50) DEFAULT '' NOT NULL,
	`email` text(254),
	`country` text DEFAULT 'Pakistan' NOT NULL,
	`province` text DEFAULT '' NOT NULL,
	`district` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`address` text(250) DEFAULT '' NOT NULL,
	`zip_code` text(50) DEFAULT '',
	`location` text DEFAULT 'home' NOT NULL,
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "user", "payment", "payment_method", "lines", "sale_price", "purchase_price", "discount", "extra_price", "shipping_cost", "total_price", "date", "status", "pending", "processing", "shipped", "delivered", "canceled", "rejected", "return", "Confirmed", "Paid", "is_confirmed", "is_paid", "name", "phone", "email", "country", "province", "district", "city", "address", "zip_code", "location", "created_at", "updated_at") SELECT "id", "user", "payment", "payment_method", "lines", "sale_price", "purchase_price", "discount", "extra_price", "shipping_cost", "total_price", "date", "status", "pending", "processing", "shipped", "delivered", "canceled", "rejected", "return", "Confirmed", "Paid", "is_confirmed", "is_paid", "name", "phone", "email", "country", "province", "district", "city", "address", "zip_code", "location", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE TABLE `__new_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '',
	`description` text DEFAULT '',
	`discount` integer NOT NULL,
	`active` integer DEFAULT false,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_offers`("id", "name", "description", "discount", "active", "start_date", "end_date", "created_at", "updated_at") SELECT "id", "name", "description", "discount", "active", "start_date", "end_date", "created_at", "updated_at" FROM `offers`;--> statement-breakpoint
DROP TABLE `offers`;--> statement-breakpoint
ALTER TABLE `__new_offers` RENAME TO `offers`;--> statement-breakpoint
CREATE TABLE `__new_offerProducts` (
	`id` text PRIMARY KEY NOT NULL,
	`offer_id` text NOT NULL,
	`product_id` text NOT NULL,
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_offerProducts`("id", "offer_id", "product_id", "created_at", "updated_at") SELECT "id", "offer_id", "product_id", "created_at", "updated_at" FROM `offerProducts`;--> statement-breakpoint
DROP TABLE `offerProducts`;--> statement-breakpoint
ALTER TABLE `__new_offerProducts` RENAME TO `offerProducts`;--> statement-breakpoint
CREATE TABLE `__new_slider` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`layout` text DEFAULT '',
	`button_text` text DEFAULT '',
	`description` text DEFAULT '',
	`button_color` text DEFAULT 'neutral',
	`category` integer,
	`product` text,
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_slider`("id", "label", "image", "layout", "button_text", "description", "button_color", "category", "product", "created_at", "updated_at") SELECT "id", "label", "image", "layout", "button_text", "description", "button_color", "category", "product", "created_at", "updated_at" FROM `slider`;--> statement-breakpoint
DROP TABLE `slider`;--> statement-breakpoint
ALTER TABLE `__new_slider` RENAME TO `slider`;--> statement-breakpoint
CREATE TABLE `__new_return_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`country` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`street` text DEFAULT '' NOT NULL,
	`postal_Code` text DEFAULT '' NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`method` text DEFAULT '',
	`status` text DEFAULT 'requested' NOT NULL,
	`notes` text DEFAULT '',
	`created_at` text DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`order`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_return_orders`("id", "order", "name", "email", "phone", "country", "city", "street", "postal_Code", "reason", "method", "status", "notes", "created_at", "updated_at") SELECT "id", "order", "name", "email", "phone", "country", "city", "street", "postal_Code", "reason", "method", "status", "notes", "created_at", "updated_at" FROM `return_orders`;--> statement-breakpoint
DROP TABLE `return_orders`;--> statement-breakpoint
ALTER TABLE `__new_return_orders` RENAME TO `return_orders`;