/*
  Warnings:

  - You are about to drop the column `permiso` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `permiso` on the `proveedores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "abastecimientos" ADD COLUMN     "permiso" VARCHAR(100);

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "permiso";

-- AlterTable
ALTER TABLE "proveedores" DROP COLUMN "permiso";

-- AlterTable
ALTER TABLE "ventas" ADD COLUMN     "permiso_id" SMALLINT;

-- CreateTable
CREATE TABLE "cat_permisos" (
    "permiso_id" SMALLSERIAL NOT NULL,
    "permiso" VARCHAR(100) NOT NULL,

    CONSTRAINT "cat_permisos_pkey" PRIMARY KEY ("permiso_id")
);

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "fk_permiso_id_fk_permiso_id_venta" FOREIGN KEY ("permiso_id") REFERENCES "cat_permisos"("permiso_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
