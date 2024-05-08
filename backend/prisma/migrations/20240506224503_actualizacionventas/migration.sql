/*
  Warnings:

  - You are about to drop the column `lugar_expansion` on the `ventas` table. All the data in the column will be lost.
  - Added the required column `client_id` to the `ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidaddemedida` to the `ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valornumerico` to the `ventas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ventas" DROP COLUMN "lugar_expansion",
ADD COLUMN     "client_id" INTEGER NOT NULL,
ADD COLUMN     "lugar_expedicion" VARCHAR(150),
ADD COLUMN     "unidaddemedida" VARCHAR(60) NOT NULL,
ADD COLUMN     "valornumerico" REAL NOT NULL,
ALTER COLUMN "serie" DROP NOT NULL,
ALTER COLUMN "folio_fiscal" DROP NOT NULL,
ALTER COLUMN "fecha_timbrado" DROP NOT NULL,
ALTER COLUMN "exportacion" DROP NOT NULL,
ALTER COLUMN "uso" DROP NOT NULL,
ALTER COLUMN "unidad" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "fk_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
