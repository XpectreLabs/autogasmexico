'use client';

import React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './Index.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import NativeSelect from '@mui/material/NativeSelect';
import * as Yup from "yup";
import dayjs from 'dayjs';

 
export default function EditarBitacoraModal({ isOpen, onClose, bitacoraData,bitacoraIdd }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({proveedor_id:'',folio:'',fecha_emision:'', cantidad:'',concepto:'', densidad:'', permiso:'', preciounitario:'', importe:'',  ivaaplicado:'',cfdi:'',tipoCfdi:'',preciovent:'',aclaracion:'',tipocomplemento:'',unidaddemedida:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [listPermisos,setListPermisos] = React.useState([]);


  console.log("Dta",bitacoraData);
  return (
    <Formik
        enableReinitialize={true}
        initialValues={{...bitacoraData}}
        validationSchema={Yup.object().shape({
          nota: Yup.string()
            .min(3, "La nota es muy corto")
            .required("La nota es requerido"),
          diferencia: Yup.number()
            .min(1, "La diferencia debe tener minimo 1 digito")
            .required("La diferencia es requerida"),
        })}
        onSubmit={(values, actions) => {
          const scriptURL = "http://localhost:3001/api/v1/bitacoras";
          const bitacora_inventario_id = bitacoraIdd;
          //const id = bitacoraIdd;
          delete values.id;
          delete values.mes;
          delete values.inventarioInicial;
          delete values.compras;
          delete values.ventas;
          delete values.inventarioFinal;
          delete values.inventarioFisico;
          delete values.porcentajeDiferencia;
          delete values.fecha;
          /*const folio = values.name;
          const rfc = values.rfc;
          const direccion = values.direccion;
          const tipo_situacion_fiscal = values.tipo_situacion_fiscal;
          const permiso = values.permiso+"";
          const phone = values.phone;
          const email = values.email;*/
          const data = {...values,bitacora_inventario_id};
          console.log(data);
          setLoading(true);

          console.log("v",data);
          fetch(scriptURL, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': "Bearer "+localStorage.getItem('token'),
            },
          })
          .then((resp) => resp.json())
          .then(function(data) {
            setLoading(false);
            setTypeOfMessage("error");

            if(data.message==="success") {
              setTypeOfMessage("success");
              setTextError("Los datos de la bitacora fueron actualizados");
              setShowAlert(true);

              setTimeout(()=>{onClose();},2000)
            }
            else if(data.message==="schema") {
              setTextError(data.error);
              setShowAlert(true);
            }
            else {
              setTextError(data.message);
              setShowAlert(true);
              setTimeout(()=>{
                Logout();
              },3200)
            }
            setTimeout(()=>{setShowAlert(false);},3000)
          })
          .catch(error => {
            console.log(error.message);
            console.error('Error!', error.message);
          });
        }}
      >
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue
        }) => {
          return (
            <>
              {showAlert?(<p className={`${styles.message} ${typeOfMessage==="success"?styles.success:null} slideLeft`}><strong>Message:</strong><br />{textError}</p>):null}

              <Modal
                  open={isOpen}
                  onClose={onClose}
                  className={styles.Modal}
                  title="Editar bitacora"
              >
                <Form id="formAddCompra" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Editar bitacora</h2>
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    placeholder="Nota"
                    required
                    id="nota"
                    label="Nota"
                    name="nota"
                    value={values.nota}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Litros de diferencia"
                    id="diferencia"
                    label="Litros de diferencia"
                    name="diferencia"
                    value={values.diferencia}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />

                    {(errors.nota || errors.diferencia)?(<div className={styles.errors}>
                      <p><strong>Errores:</strong></p>
                      {errors.nota? (<p>{errors.nota}</p>):null}
                      {errors.diferencia? (<p>{errors.diferencia}</p>):null}
                      {/* {errors.fecha_reporte? (<p>{errors.fecha_reporte}</p>):null} */}
                    </div>):null}

                    <div className={styles.ContentLoadding}>
                      <CircularProgress  className={loading?'Loading show':'Loading'}/>
                    </div>

                  <div className={styles.btns}>
                    <Button className={styles.btn} variant="outlined" type="submit">Guardar</Button>
                  </div>
                </Form>
              </Modal>
              </>
            );
          }}
      </Formik>
  );
}