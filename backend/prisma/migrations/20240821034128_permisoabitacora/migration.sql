-- AlterTable
ALTER TABLE "bitacoras_inventario" ADD COLUMN     "permiso_id" SMALLINT;

-- AddForeignKey
ALTER TABLE "bitacoras_inventario" ADD CONSTRAINT "fk_permiso_id_fk_permiso_id_bitacora" FOREIGN KEY ("permiso_id") REFERENCES "cat_permisos"("permiso_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
