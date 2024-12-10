CREATE TYPE "account_role" AS ENUM (
  'admin',
  'freelancer',
  'client'
);

CREATE TYPE "job_status" AS ENUM (
  'open',
  'in_progress',
  'completed',
  'closed',
  'cancelled'
);

CREATE TYPE "proposal_status" AS ENUM (
  'pending',
  'in_progress',
  'rejected',
  'completed',
  'cancelled'
);

CREATE TYPE "milestone_status" AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'paid'
);

CREATE TYPE "payment_status" AS ENUM (
  'pending',
  'completed',
  'failed'
);

CREATE TYPE "notification_type" AS ENUM (
  'proposal_submitted',
  'proposal_accepted',
  'proposal_rejected',
  'milestone_completed',
  'payment_received',
  'message_received',
  'review_received',
  'badge_earned',
  'withdrawal_requested',
  'withdrawal_processed'
);

CREATE TYPE "withdrawal_status" AS ENUM (
  'pending',
  'processed'
);

CREATE TYPE "withdrawal_payment_method" AS ENUM (
  'bank_transfer',
  'paypal',
  'ewallet'
);

CREATE TABLE "accounts" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "first_name" VARCHAR(255) NOT NULL,
  "last_name" VARCHAR(255) NOT NULL,
  "username" VARCHAR(255) UNIQUE NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "profile_picture" VARCHAR(255),
  "is_banned" BOOLEAN NOT NULL DEFAULT false,
  "role" account_role NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "freelancers" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "bio" VARCHAR(1023),
  "balance" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "account_id" INTEGER NOT NULL
);

CREATE TABLE "skills" (
  "freelancer_id" INTEGER,
  "name" VARCHAR(255),
  PRIMARY KEY ("freelancer_id", "name")
);

CREATE TABLE "previous_works" (
  "freelancer_id" INTEGER,
  "order" INTEGER,
  "title" VARCHAR(255) NOT NULL,
  "description" VARCHAR(1000) NOT NULL,
  "url" VARCHAR(255),
  PRIMARY KEY ("freelancer_id", "order")
);

CREATE TABLE "jobs" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "status" job_status NOT NULL DEFAULT 'open',
  "budget" DECIMAL(16,2) NOT NULL,
  "duration" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "category_id" INTEGER,
  "client_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "proposals" (
  "job_id" INTEGER,
  "freelancer_id" INTEGER,
  "status" proposal_status NOT NULL DEFAULT 'pending',
  "cover_letter" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  PRIMARY KEY ("job_id", "freelancer_id")
);

CREATE TABLE "milestones" (
  "job_id" INTEGER,
  "freelancer_id" INTEGER,
  "order" INTEGER,
  "status" milestone_status NOT NULL DEFAULT 'pending',
  "name" VARCHAR(255) NOT NULL,
  "duration" INTEGER NOT NULL,
  "amount" DECIMAL(16,2) NOT NULL,
  PRIMARY KEY ("job_id", "freelancer_id", "order")
);

CREATE TABLE "payments" (
  "stripe_id" INTEGER NOT NULL,
  "status" payment_status NOT NULL DEFAULT 'pending',
  "job_id" INTEGER NOT NULL,
  "freelancer_id" INTEGER NOT NULL,
  "milestone_order" INTEGER NOT NULL,
  "client_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  PRIMARY KEY ("job_id", "freelancer_id", "milestone_order")
);

CREATE TABLE "badges" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "icon" VARCHAR(255) NOT NULL
);

CREATE TABLE "categories" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" VARCHAR(255) NOT NULL
);

CREATE TABLE "notifications" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "type" notification_type NOT NULL,
  "message" VARCHAR(255) NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "account_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "withdrawals" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "status" withdrawal_status NOT NULL DEFAULT 'pending',
  "amount" DECIMAL(16,2) NOT NULL,
  "payment_method" withdrawal_payment_method NOT NULL,
  "payment_username" VARCHAR(255) NOT NULL,
  "requested_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "freelancer_id" INTEGER NOT NULL
);

CREATE TABLE "reviews" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "rating" DECIMAL(2,1) NOT NULL,
  "comment" VARCHAR(255),
  "job_id" INTEGER NOT NULL,
  "freelancer_id" INTEGER NOT NULL,
  "account_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "messages" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "message" TEXT NOT NULL,
  "attachment_path" VARCHAR(255),
  "job_id" INTEGER NOT NULL,
  "freelancer_id" INTEGER NOT NULL,
  "sent_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "badge_freelancer" (
  "badge_id" INTEGER,
  "freelancer_id" INTEGER,
  "earned_at" TIMESTAMP NOT NULL DEFAULT (now()),
  PRIMARY KEY ("badge_id", "freelancer_id")
);

ALTER TABLE "badge_freelancer" ADD FOREIGN KEY ("badge_id") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "badge_freelancer" ADD FOREIGN KEY ("freelancer_id") REFERENCES "freelancers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "skills" ADD FOREIGN KEY ("freelancer_id") REFERENCES "freelancers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "previous_works" ADD FOREIGN KEY ("freelancer_id") REFERENCES "freelancers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "freelancers" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "proposals" ADD FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "proposals" ADD FOREIGN KEY ("freelancer_id") REFERENCES "freelancers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("job_id", "freelancer_id") REFERENCES "proposals" ("job_id", "freelancer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages" ADD FOREIGN KEY ("job_id", "freelancer_id") REFERENCES "proposals" ("job_id", "freelancer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "milestones" ADD FOREIGN KEY ("job_id", "freelancer_id") REFERENCES "proposals" ("job_id", "freelancer_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" ADD FOREIGN KEY ("job_id", "freelancer_id", "milestone_order") REFERENCES "milestones" ("job_id", "freelancer_id", "order") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD FOREIGN KEY ("client_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "withdrawals" ADD FOREIGN KEY ("freelancer_id") REFERENCES "freelancers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "jobs" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "jobs" ADD FOREIGN KEY ("client_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;


INSERT INTO "accounts" ("first_name", "last_name", "username", "email", "password", "role") 
VALUES ('admin','1','admin','admin@example.com','$2b$10$xNb2FgHuAHY/AiaHdsdpVevhaQwYFbhbnNrXICSqCjDSE71fbnUgK','admin');

INSERT INTO "categories" ("name", "description")
VALUES ('Web Development','Web Development'),
       ('Mobile Development','Mobile Development'),
       ('Game Development','Game Development'),
       ('Data Science','Data Science'),
       ('Machine Learning','Machine Learning'),
       ('Artificial Intelligence','Artificial Intelligence'),
       ('Cybersecurity','Cybersecurity'),
       ('Blockchain','Blockchain'),
       ('DevOps','DevOps'),
       ('Cloud Computing','Cloud Computing');
