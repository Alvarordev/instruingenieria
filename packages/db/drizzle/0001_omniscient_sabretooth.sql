ALTER TABLE `products` ADD `tagline` text;--> statement-breakpoint
ALTER TABLE `products` ADD `specs` text;--> statement-breakpoint
ALTER TABLE `products` ADD `applications` text;--> statement-breakpoint
ALTER TABLE `products` ADD `ficha_tecnica_url` text;--> statement-breakpoint
ALTER TABLE `services` ADD `category_id` integer REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `services` ADD `items` text;