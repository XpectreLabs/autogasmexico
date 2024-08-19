/*
  Warnings:

  - Added the required column `tipo_bitacora` to the `bitacoras_inventario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bitacoras_inventario" ADD COLUMN     "tipo_bitacora" SMALLINT NOT NULL,
ALTER COLUMN "diferencia" DROP NOT NULL;
