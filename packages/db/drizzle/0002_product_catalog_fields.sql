ALTER TABLE `products` ADD `sku` text;--> statement-breakpoint
ALTER TABLE `products` ADD `model` text;--> statement-breakpoint
ALTER TABLE `products` ADD `gallery_urls` text;--> statement-breakpoint
ALTER TABLE `products` ADD `warranty` text;--> statement-breakpoint
ALTER TABLE `products` ADD `in_stock` integer DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);
