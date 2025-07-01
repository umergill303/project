CREATE TABLE `about` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '',
	`logo` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `cart_product` (
	`id` text PRIMARY KEY NOT NULL,
	`cart` text,
	`product` text,
	`qty` integer DEFAULT 10 NOT NULL,
	`variant` integer,
	`done` integer DEFAULT false,
	FOREIGN KEY (`cart`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`guest` text,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `carts_guest_unique` ON `carts` (`guest`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '',
	`logo` text DEFAULT '',
	`featured` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`unread` integer DEFAULT true,
	`name` text DEFAULT '',
	`email` text DEFAULT '',
	`phone` integer NOT NULL,
	`subject` text DEFAULT '',
	`message` text DEFAULT '',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `coupons` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `products` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`brand`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '',
	`order` integer DEFAULT 0,
	`product` text,
	`attribute_type` text DEFAULT 'Button',
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attribute` integer NOT NULL,
	`name` text NOT NULL,
	`hint` text DEFAULT '',
	`color` text DEFAULT '',
	`image` text DEFAULT '',
	`order` integer DEFAULT 0,
	FOREIGN KEY (`attribute`) REFERENCES `attributes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `variant_options` (
	`variant` integer,
	`option` integer,
	PRIMARY KEY(`variant`, `option`),
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`option`) REFERENCES `options`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text,
	`purchase_price` real DEFAULT 0,
	`sale_price` real DEFAULT 0,
	`discount` integer DEFAULT 0,
	`stock` integer DEFAULT 0,
	`sku` text DEFAULT '',
	`order` integer DEFAULT 0,
	`active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`product` text,
	`variant` text,
	`guest` text,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `stocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text,
	`variant` integer,
	`quantity` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `order_products` (
	`id` text PRIMARY KEY NOT NULL,
	`order` text NOT NULL,
	`product` text NOT NULL,
	`variant` text,
	`name` text DEFAULT '' NOT NULL,
	`thumbnail` text DEFAULT '' NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`sale_price` real DEFAULT 0 NOT NULL,
	`purchase_price` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`shipping_cost` real DEFAULT 0 NOT NULL,
	`is_returned` integer DEFAULT false NOT NULL,
	`return_reason` text DEFAULT '',
	FOREIGN KEY (`order`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '',
	`description` text DEFAULT '',
	`discount` integer NOT NULL,
	`active` integer DEFAULT false,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `offerProducts` (
	`id` text PRIMARY KEY NOT NULL,
	`offer_id` text NOT NULL,
	`product_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `slider` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`layout` text DEFAULT '',
	`button_text` text DEFAULT '',
	`description` text DEFAULT '',
	`button_color` text DEFAULT 'neutral',
	`category` integer,
	`product` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `return_orders` (
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`order`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `return_order_products` (
	`id` text PRIMARY KEY NOT NULL,
	`return` text NOT NULL,
	`product` text NOT NULL,
	`variant` text,
	`quantity` integer DEFAULT 0,
	`sale_price` real DEFAULT 0,
	`discount` integer DEFAULT 0,
	`purchase_price` real DEFAULT 0,
	`shipping_cost` real DEFAULT 0,
	`thumbnail` text DEFAULT '',
	`name` text DEFAULT '',
	`variant_name` text DEFAULT '',
	`variant_color` text DEFAULT '',
	`variant_image` text DEFAULT '',
	`variant_options` text DEFAULT '',
	FOREIGN KEY (`return`) REFERENCES `return_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pageSeo` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
