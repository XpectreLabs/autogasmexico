-- AlterTable
ALTER TABLE "cat_permisos" ALTER COLUMN "permiso" DROP NOT NULL,
ALTER COLUMN "permiso" SET DATA TYPE VARCHAR(150);