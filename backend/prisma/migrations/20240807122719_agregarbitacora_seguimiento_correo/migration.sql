-- CreateTable
CREATE TABLE "bitacoras_inventario" (
    "bitacora_inventario_id" SERIAL NOT NULL,
    "nota" VARCHAR(500) NOT NULL,
    "diferencia" REAL NOT NULL,
    "fecha_reporte" DATE NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "active" SMALLINT NOT NULL,

    CONSTRAINT "bitacoras_inventario_pkey" PRIMARY KEY ("bitacora_inventario_id")
);

-- CreateTable
CREATE TABLE "seguimiento_facturas_correo" (
    "seguimiento_id" SERIAL NOT NULL,
    "folio" VARCHAR(100),
    "cfdi" VARCHAR(150),
    "tipo_status" SMALLINT NOT NULL,
    "nota" VARCHAR(100),
    "tipo_factura_id" SMALLINT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "seguimiento_facturas_correo_pkey" PRIMARY KEY ("seguimiento_id")
);

-- AddForeignKey
ALTER TABLE "bitacoras_inventario" ADD CONSTRAINT "fk_user_id_bitacora" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
