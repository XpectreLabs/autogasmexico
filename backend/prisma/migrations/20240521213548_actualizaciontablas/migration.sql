/*
  Warnings:

  - You are about to drop the column `valornumerico` on the `abastecimientos` table. All the data in the column will be lost.
  - You are about to drop the column `valornumerico` on the `ventas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "abastecimientos" DROP COLUMN "valornumerico";

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "permiso" DROP NOT NULL;

-- AlterTable
ALTER TABLE "proveedores" ALTER COLUMN "permiso" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ventas" DROP COLUMN "valornumerico";
