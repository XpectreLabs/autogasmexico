'use client';

import React from 'react';
import styles from './Index.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";

export default function DetalleReporteModal({ isOpen, onClose, reporteData }) {
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
                  <h2 className={styles.Title}>Detalle del reporte</h2>

                  <div className={styles.Texts}>
                    <div>
                      <p><strong>Versión:</strong></p>
                      <p>{reporteData.version}</p>
                    </div>

                    <div>
                      <p><strong>Rfc contribuyente:</strong></p>
                      <p>{reporteData.rfccontribuyente}</p>
                    </div>

                    <div>
                      <p><strong>Rfc de representante legal:</strong></p>
                      <p>{reporteData.rfcrepresentantelegal}</p>
                    </div>

                    <div>
                      <p><strong>Rfc de proveedor:</strong></p>
                      <p>{reporteData.rfcproveedor}</p>
                    </div>

                    <div>
                      <p><strong>Carácter:</strong></p>
                      <p>{reporteData.caracter}</p>
                    </div>

                    <div>
                      <p><strong>Modalidad de permiso:</strong></p>
                      <p>{reporteData.modalidadpermiso}</p>
                    </div>
                    <div>
                      <p><strong>Número de permiso:</strong></p>
                      <p>{reporteData.numpermiso}</p>
                    </div>

                    <div>
                      <p><strong>Clave de instalación:</strong></p>
                      <p>{reporteData.claveinstalacion}</p>
                    </div>
                    <div>
                      <p><strong>Descripción de instalación:</strong></p>
                      <p>{reporteData.descripcioninstalacion}</p>
                    </div>
                    <div>
                      <p><strong>Número de pozos:</strong></p>
                      <p>{reporteData.numeropozos}</p>
                    </div>
                    <div>
                      <p><strong>Número de tanques:</strong></p>
                      <p>{reporteData.numerotanques}</p>
                    </div>

                    <div>
                      <p><strong>Número ductos entrada salida:</strong></p>
                      <p>{reporteData.numeroductosentradasalida}</p>
                    </div>
                    <div>
                      <p><strong>Número ductos transparente distribución:</strong></p>
                      <p>{reporteData.numeroductostransportedistribucion}</p>
                    </div>

                    <div>
                      <p><strong>Número dispensarios:</strong></p>
                      <p>{reporteData.numerodispensarios}</p>
                    </div>

                    <div>
                      <p><strong>Clave producto:</strong></p>
                      <p>{reporteData.claveproducto}</p>
                    </div>
                    <div>
                      <p><strong>Compos de propano en gas lp:</strong></p>
                      <p>{reporteData.composdepropanoengaslp}</p>
                    </div>
                    <div>
                      <p><strong>Compos de butano en gas lp:</strong></p>
                      <p>{reporteData.composdebutanoengaslp}</p>
                    </div>
                    <div>
                      <p><strong>Volumen de existencia mensual:</strong></p>
                      <p>{reporteData.volumenexistenciasees}</p>
                    </div>
                    <div>
                      <p><strong>Fecha y hora de estas mediciones:</strong></p>
                      <p>{reporteData.fechayhoraestamedicionmes}</p>
                    </div>
                    <div>
                      <p><strong>Número de registro:</strong></p>
                      <p>{reporteData.numeroregistro}</p>
                    </div>
                    <div>
                      <p><strong>Usuario responsable:</strong></p>
                      <p>{reporteData.usuarioresponsable}</p>
                    </div>
                    <div>
                      <p><strong>Tipo evento:</strong></p>
                      <p>{reporteData.tipoevento}</p>
                    </div>
                    <div>
                      <p><strong>Descripción de evento:</strong></p>
                      <p>{reporteData.descripcionevento}</p>
                    </div>
                    <div>
                      <p><strong>Fecha inicio reporte:</strong></p>
                      <p>{reporteData.fecha_inicio2}</p>
                    </div>
                    <div>
                      <p><strong>Fecha terminación reporte:</strong></p>
                      <p>{reporteData.fecha_terminacion2}</p>
                    </div>
                    <div></div>

                  </div>
                </Form>
              </Modal>
              </>
            );
          }}
      </Formik>
  );
}
