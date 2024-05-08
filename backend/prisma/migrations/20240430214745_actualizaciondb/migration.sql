-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(120) NOT NULL,
    "password" VARCHAR(120) NOT NULL,
    "email" VARCHAR(150),
    "date" DATE,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "proveedor_id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "rfc" VARCHAR(30) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "tipo_situacion_fiscal" VARCHAR(255) NOT NULL,
    "permiso" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(200),
    "user_id" INTEGER,
    "date" DATE,
    "active" SMALLINT,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("proveedor_id")
);

-- CreateTable
CREATE TABLE "clients" (
    "client_id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "rfc" VARCHAR(30) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "tipo_situacion_fiscal" VARCHAR(255) NOT NULL,
    "permiso" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(200),
    "user_id" INTEGER NOT NULL,
    "date" DATE,
    "active" SMALLINT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "abastecimientos" (
    "abastecimiento_id" SERIAL NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "folio" VARCHAR(100) NOT NULL,
    "serie" VARCHAR(100),
    "folio_fiscal" VARCHAR(150),
    "fecha_emision" DATE NOT NULL,
    "fecha_timbrado" DATE,
    "lugar_expedicion" VARCHAR(150),
    "exportacion" VARCHAR(150),
    "uso" VARCHAR(150),
    "cantidad" INTEGER NOT NULL,
    "unidad" VARCHAR(150),
    "concepto" VARCHAR(600) NOT NULL,
    "preciounitario" REAL NOT NULL,
    "importe" REAL NOT NULL,
    "ivaaplicado" INTEGER NOT NULL,
    "tipo_modena_id" SMALLINT NOT NULL,
    "condicion_pago_id" SMALLINT,
    "cfdi" VARCHAR(150) NOT NULL,
    "tipoCfdi" VARCHAR(100) NOT NULL,
    "preciovent" REAL NOT NULL,
    "aclaracion" VARCHAR(300) NOT NULL,
    "tipocomplemento" VARCHAR(100) NOT NULL,
    "valornumerico" REAL NOT NULL,
    "unidaddemedida" VARCHAR(60) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "active" SMALLINT NOT NULL,

    CONSTRAINT "abastecimientos_pkey" PRIMARY KEY ("abastecimiento_id")
);

-- CreateTable
CREATE TABLE "tipos_monedas" (
    "tipo_modena_id" SMALLSERIAL NOT NULL,
    "tipo_modena" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_monedas_pkey" PRIMARY KEY ("tipo_modena_id")
);

-- CreateTable
CREATE TABLE "condiciones_pagos" (
    "condicion_pago_id" SMALLSERIAL NOT NULL,
    "condicion_pago" VARCHAR(100) NOT NULL,

    CONSTRAINT "condiciones_pagos_pkey" PRIMARY KEY ("condicion_pago_id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "venta_id" SERIAL NOT NULL,
    "folio" VARCHAR(100) NOT NULL,
    "serie" VARCHAR(100) NOT NULL,
    "folio_fiscal" VARCHAR(150) NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "fecha_timbrado" DATE NOT NULL,
    "lugar_expansion" VARCHAR(150) NOT NULL,
    "exportacion" VARCHAR(150) NOT NULL,
    "uso" VARCHAR(150) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidad" VARCHAR(150) NOT NULL,
    "concepto" VARCHAR(600) NOT NULL,
    "preciounitario" REAL NOT NULL,
    "importe" REAL NOT NULL,
    "ivaaplicado" INTEGER NOT NULL,
    "tipo_modena_id" SMALLINT NOT NULL,
    "condicion_pago_id" SMALLINT,
    "cfdi" VARCHAR(150) NOT NULL,
    "tipoCfdi" VARCHAR(100) NOT NULL,
    "preciovent" REAL NOT NULL,
    "aclaracion" VARCHAR(300) NOT NULL,
    "tipocomplemento" VARCHAR(100) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "active" SMALLINT,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("venta_id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "reporte_id" SERIAL NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "rfccontribuyente" VARCHAR(30) NOT NULL,
    "rfcrepresentantelegal" VARCHAR(30) NOT NULL,
    "rfcproveedor" VARCHAR(30) NOT NULL,
    "caracter" VARCHAR(100) NOT NULL,
    "modalidadpermiso" VARCHAR(100) NOT NULL,
    "numpermiso" VARCHAR(100) NOT NULL,
    "claveinstalacion" VARCHAR(100) NOT NULL,
    "descripcioninstalacion" VARCHAR(100) NOT NULL,
    "numeropozos" SMALLINT NOT NULL,
    "numerotanques" SMALLINT NOT NULL,
    "numeroductosentradasalida" SMALLINT NOT NULL,
    "numeroductostransportedistribucion" SMALLINT NOT NULL,
    "numerodispensarios" SMALLINT NOT NULL,
    "claveproducto" VARCHAR(50) NOT NULL,
    "composdepropanoengaslp" REAL NOT NULL,
    "composdebutanoengaslp" REAL NOT NULL,
    "volumenexistenciasees" REAL NOT NULL,
    "fechayhoraestamedicionmes" DATE NOT NULL,
    "numeroregistro" INTEGER NOT NULL,
    "usuarioresponsable" VARCHAR(150) NOT NULL,
    "tipoevento" INTEGER NOT NULL,
    "descripcionevento" VARCHAR(255) NOT NULL,
    "tipo_reporte_id" SMALLINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "active" SMALLINT,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("reporte_id")
);

-- CreateTable
CREATE TABLE "tipos_reporte" (
    "tipo_reporte_id" SMALLSERIAL NOT NULL,
    "tipo_reporte" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_reporte_pkey" PRIMARY KEY ("tipo_reporte_id")
);

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "fk_user_id_client" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "abastecimientos" ADD CONSTRAINT "fk_proveedor_id" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("proveedor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "abastecimientos" ADD CONSTRAINT "fk_user_id_abastecimiento" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "abastecimientos" ADD CONSTRAINT "fk_tipo_modena_id" FOREIGN KEY ("tipo_modena_id") REFERENCES "tipos_monedas"("tipo_modena_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "abastecimientos" ADD CONSTRAINT "fk_condicion_pago_id" FOREIGN KEY ("condicion_pago_id") REFERENCES "condiciones_pagos"("condicion_pago_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "fk_user_id_venta" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "fk_tipo_modena_id_fk_user_id_venta" FOREIGN KEY ("tipo_modena_id") REFERENCES "tipos_monedas"("tipo_modena_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "fk_condicion_pago_id_fk_user_id_venta" FOREIGN KEY ("condicion_pago_id") REFERENCES "condiciones_pagos"("condicion_pago_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "fk_user_id_reporte" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "fk_tipo_reporte_id_report" FOREIGN KEY ("tipo_reporte_id") REFERENCES "tipos_reporte"("tipo_reporte_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
