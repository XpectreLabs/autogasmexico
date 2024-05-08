/*
  Warnings:

  - Added the required column `fecha_inicio` to the `reportes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_terminacion` to the `reportes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reportes" ADD COLUMN     "fecha_inicio" DATE NOT NULL,
ADD COLUMN     "fecha_terminacion" DATE NOT NULL,
ALTER COLUMN "tipo_reporte_id" DROP NOT NULL;
