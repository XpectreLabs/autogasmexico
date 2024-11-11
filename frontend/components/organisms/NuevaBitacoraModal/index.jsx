'use client';

import React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './Index.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export default function NuevaBitacoraModal({ isOpen, onClose, fecha_reporte,cargarDataPorPermiso,anio,permiso_id,tipo_bitacora,mes,dia }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({nota:'',diferencia:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");

  console.log(fecha_reporte)

  return (
    <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          nota: Yup.string()
            .min(3, "La nota es muy corto")
            .required("La nota es requerido"),
          diferencia: Yup.number()
            .min(1, "La diferencia debe tener minimo 1 digito")
            .required("La diferencia es requerida"),
          //fecha_reporte: Yup.date()
            //.required("* Fecha de reporte"),
        })}
        onSubmit={(values, actions) => {
          const user_id = localStorage.getItem('user_id');
          const scriptURL = "http://44.212.165.114:3001/api/v1/bitacoras";
          /*const folio = values.name;
          const rfc = values.rfc;
          const direccion = values.direccion;
          const tipo_situacion_fiscal = values.tipo_situacion_fiscal;
          const permiso = values.permiso+"";
          const phone = values.phone;
          const email = values.email;*/
          const data = {...values,user_id, fecha_reporte,tipo_bitacora,permiso_id};
          setLoading(true);

          //setInitialValues(({proveedor_id:'',folio:'',fecha_emision:'', cantidad:'',concepto:'', densidad:'', permiso:'', preciounitario:'', importe:'',  ivaaplicado:'',cfdi:'',tipoCfdi:'',preciovent:'',aclaracion:'',tipocomplemento:'',unidaddemedida:'UM03'}));
          console.log("v",data);
          fetch(scriptURL, {
            method: 'POST',
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
              setTextError("Los datos de la bitacora fueron guardados");
              setInitialValues(({nota:'', diferencia:''}));
              setShowAlert(true);
              cargarDataPorPermiso(permiso_id,anio,mes,dia)

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
                  title="Agregar bitacora"
              >
                <Form id="formAddCompra" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Agregar bitacora</h2>
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
                  {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      required
                      className={`InputModal Fecha `}
                      placeholder="Fecha de reporte"
                      label="Fecha de reporte"
                      id="fecha_reporte"
                      name="fecha_reporte"
                      //defaultValue={values.fecha_emision}
                      onChange={(value) => {
                        setFieldValue('fecha_reporte', value, true);
                      }}
                    />
                  </LocalizationProvider> */}

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
