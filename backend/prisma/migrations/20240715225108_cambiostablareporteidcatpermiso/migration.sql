/*
  Warnings:

  - You are about to drop the column `numpermiso` on the `reportes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reportes" DROP COLUMN "numpermiso",
ADD COLUMN     "permiso_id" SMALLINT;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "fk_permiso_id_fk_permiso_id_reporte" FOREIGN KEY ("permiso_id") REFERENCES "cat_permisos"("permiso_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
