'use client';

import React from 'react';
import styles from './DetalleCompra.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";


export default function DetalleCompraModal({ isOpen, onClose, abastecimientoData,abastecimientoIdd }) {

  console.log("Dta",abastecimientoData);
  return (
    <Formik>
        {({
        }) => {
          return (
            <>
              <Modal
                  open={isOpen}
                  onClose={onClose}
                  className={styles.Modal}
                  title="Editar compra"
              >
                <Form id="formAddCompra" className={styles.form}>
                  <h2 className={styles.Title}>Detalle de la compra</h2>

                  <div className={styles.Texts}>
                    <div>
                      <p><strong>Folio:</strong></p>
                      <p>{abastecimientoData.folio}</p>
                    </div>

                    <div>
                      <p><strong>Fecha de emisión:</strong></p>
                      <p>{abastecimientoData.fecha_emision2}</p>
                    </div>

                    <div>
                      <p><strong>Cantidad:</strong></p>
                      <p>{abastecimientoData.cantidad}</p>
                    </div>

                    <div>
                      <p><strong>Unidad de medida:</strong></p>
                      <p>{abastecimientoData.unidaddemedida}</p>
                    </div>

                    <div>
                      <p><strong>Concepto:</strong></p>
                      <p>{abastecimientoData.concepto}</p>
                    </div>

                    <div>
                      <p><strong>Precio unitario:</strong></p>
                      <p>{abastecimientoData.preciounitario2}</p>
                    </div>
                    <div>
                      <p><strong>Importe:</strong></p>
                      <p>{abastecimientoData.importe2}</p>
                    </div>

                    <div>
                      <p><strong>Iva aplicado:</strong></p>
                      <p>{abastecimientoData.ivaaplicado2}</p>
                    </div>
                    <div>
                      <p><strong>Precio compra:</strong></p>
                      <p>{abastecimientoData.importe2}</p>
                    </div>
                    <div>
                      <p><strong>Densidad:</strong></p>
                      <p>{abastecimientoData.densidad}</p>
                    </div>
                    <div>
                      <p><strong>CFDI:</strong></p>
                      <p>{abastecimientoData.cfdi}</p>
                    </div>
                    <div>
                      <p><strong>Tipo CFDI:</strong></p>
                      <p>{abastecimientoData.tipoCfdi}</p>
                    </div>

                    <div>
                      <p><strong>Aclaración:</strong></p>
                      <p>{abastecimientoData.aclaracion}</p>
                    </div>

                    <div>
                      <p><strong>Tipo de complemento:</strong></p>
                      <p>{abastecimientoData.tipocomplemento}</p>
                    </div>

                    <div>
                      <p><strong>Proveedor:</strong></p>
                      <p>{abastecimientoData.proveedor}</p>
                    </div>
                  </div>
                </Form>
              </Modal>
              </>
            );
          }}
      </Formik>
  );
}
