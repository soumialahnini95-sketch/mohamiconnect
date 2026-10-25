CREATE TABLE `lawyer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`city` enum('Casablanca','Rabat','Marrakech','Tanger') NOT NULL,
	`specialty` enum('Droit de la famille / Divorce','Droit du travail','Droit des affaires','Immobilier','Pénal') NOT NULL,
	`subscriptionActive` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lawyer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `lawyer_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `legal_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('Droit de la famille / Divorce','Droit du travail','Droit des affaires','Immobilier','Pénal') NOT NULL,
	`city` enum('Casablanca','Rabat','Marrakech','Tanger') NOT NULL,
	`description` text NOT NULL,
	`contactName` varchar(120) NOT NULL,
	`contactPhone` varchar(40) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_leads_id` PRIMARY KEY(`id`)
);
