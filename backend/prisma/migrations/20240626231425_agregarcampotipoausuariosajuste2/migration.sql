/*
  Warnings:

  - Made the column `type_user` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "type_user" SET NOT NULL,
ALTER COLUMN "type_user" SET DEFAULT 2;
