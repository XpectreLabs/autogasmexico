-- AlterTable
ALTER TABLE "abastecimientos" ADD COLUMN     "permiso_id" SMALLINT;

-- AddForeignKey
ALTER TABLE "abastecimientos" ADD CONSTRAINT "fk_permiso_id_fk_permiso_id_compras" FOREIGN KEY ("permiso_id") REFERENCES "cat_permisos"("permiso_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
