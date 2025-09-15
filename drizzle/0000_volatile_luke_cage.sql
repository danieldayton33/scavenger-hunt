CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authenticator` (
	`credentialID` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`credentialPublicKey` varchar(255) NOT NULL,
	`counter` int NOT NULL,
	`credentialDeviceType` varchar(255) NOT NULL,
	`credentialBackedUp` boolean NOT NULL,
	`transports` varchar(255),
	CONSTRAINT `authenticator_pk` PRIMARY KEY(`userId`,`credentialID`),
	CONSTRAINT `authenticator_credentialID_uq` UNIQUE(`credentialID`)
);
--> statement-breakpoint
CREATE TABLE `hunt_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`huntId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`hint` text,
	`imageUrl` varchar(1024),
	`lat` decimal(10,7) NOT NULL,
	`lng` decimal(10,7) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hunt_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hunt_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`huntId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hunt_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_hunt_user` UNIQUE(`huntId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `scavenger_hunts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`startAt` datetime NOT NULL,
	`endAt` datetime NOT NULL,
	`createdBy` varchar(255) NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scavenger_hunts_id` PRIMARY KEY(`id`),
	CONSTRAINT `scavenger_hunts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `sessions_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`huntId` int NOT NULL,
	`itemId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`imageUrl` varchar(1024),
	`comment` text,
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`accuracyMeters` decimal(8,2),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_hunt_item_user` UNIQUE(`huntId`,`itemId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3),
	`image` varchar(1024),
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verification_tokens_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `authenticator` ADD CONSTRAINT `authenticator_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunt_items` ADD CONSTRAINT `hunt_items_huntId_scavenger_hunts_id_fk` FOREIGN KEY (`huntId`) REFERENCES `scavenger_hunts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunt_participants` ADD CONSTRAINT `hunt_participants_huntId_scavenger_hunts_id_fk` FOREIGN KEY (`huntId`) REFERENCES `scavenger_hunts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hunt_participants` ADD CONSTRAINT `hunt_participants_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scavenger_hunts` ADD CONSTRAINT `scavenger_hunts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_huntId_scavenger_hunts_id_fk` FOREIGN KEY (`huntId`) REFERENCES `scavenger_hunts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_itemId_hunt_items_id_fk` FOREIGN KEY (`itemId`) REFERENCES `hunt_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `provider_providerAccountId_idx` ON `accounts` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE INDEX `authenticator_userId_idx` ON `authenticator` (`userId`);--> statement-breakpoint
CREATE INDEX `items_by_hunt_idx` ON `hunt_items` (`huntId`);--> statement-breakpoint
CREATE INDEX `participants_by_user_idx` ON `hunt_participants` (`userId`);--> statement-breakpoint
CREATE INDEX `hunts_by_window_idx` ON `scavenger_hunts` (`startAt`,`endAt`);--> statement-breakpoint
CREATE INDEX `hunts_by_creator_idx` ON `scavenger_hunts` (`createdBy`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `sub_by_hunt_idx` ON `submissions` (`huntId`);--> statement-breakpoint
CREATE INDEX `sub_by_user_idx` ON `submissions` (`userId`);--> statement-breakpoint
CREATE INDEX `sub_hunt_submit_idx` ON `submissions` (`huntId`,`submittedAt`,`id`);--> statement-breakpoint
CREATE INDEX `verification_tokens_token_idx` ON `verification_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `verification_tokens_identifier_idx` ON `verification_tokens` (`identifier`);