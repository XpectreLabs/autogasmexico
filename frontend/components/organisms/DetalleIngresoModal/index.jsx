'use client';

import React from 'react';
import styles from './DetalleIngreso.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";

export default function DetalleIngresoModal({ isOpen, onClose, ventaData }) {
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
                  title="Editar ingreso"
              >
                <Form id="formEditIngreso" className={styles.form}>
                  <h2 className={styles.Title}>Detalle del venta</h2>

                  <div className={styles.Texts}>
                    <div>
                      <p><strong>Folio:</strong></p>
                      <p>{ventaData.folio}</p>
                    </div>

                    <div>
                      <p><strong>Fecha de emisión:</strong></p>
                      <p>{ventaData.fecha_emision2}</p>
                    </div>

                    <div>
                      <p><strong>Cantidad:</strong></p>
                      <p>{ventaData.cantidad}</p>
                    </div>

                    <div>
                      <p><strong>Unidad de medida:</strong></p>
                      <p>{ventaData.unidaddemedida}</p>
                    </div>

                    <div>
                      <p><strong>Concepto:</strong></p>
                      <p>{ventaData.concepto}</p>
                    </div>

                    <div>
                      <p><strong>Precio unitario:</strong></p>
                      <p>{ventaData.preciounitario2}</p>
                    </div>
                    <div>
                      <p><strong>Importe:</strong></p>
                      <p>{ventaData.importe2}</p>
                    </div>

                    <div>
                      <p><strong>Iva aplicado:</strong></p>
                      <p>{ventaData.ivaaplicado2}</p>
                    </div>
                    <div>
                      <p><strong>Precio ingreso:</strong></p>
                      <p>{ventaData.preciovent2}</p>
                    </div>

                    <div>
                      <p><strong>CFDI:</strong></p>
                      <p>{ventaData.cfdi}</p>
                    </div>
                    <div>
                      <p><strong>Tipo CFDI:</strong></p>
                      <p>{ventaData.tipoCfdi}</p>
                    </div>

                    <div>
                      <p><strong>Aclaración:</strong></p>
                      <p>{ventaData.aclaracion}</p>
                    </div>
                    <div>
                      <p><strong>Tipo de complemento:</strong></p>
                      <p>{ventaData.tipocomplemento}</p>
                    </div>

                    <div>
                      <p><strong>Cliente:</strong></p>
                      <p>{ventaData.cliente}</p>
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
