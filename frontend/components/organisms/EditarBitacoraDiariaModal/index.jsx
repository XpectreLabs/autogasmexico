'use client';

import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './Index.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

 
export default function EditarBitacoraDiariaModal({ isOpen, onClose, bitacoraData,bitacoraIdd }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");

  console.log("Dta",bitacoraData);
  return (
    <Formik
        enableReinitialize={true}
        initialValues={{...bitacoraData}}
        validationSchema={Yup.object().shape({
          nota: Yup.string()
            .min(3, "La nota es muy corto")
            .required("La nota es requerido"),
        })}
        onSubmit={(values, actions) => {
          const scriptURL = "http://54.242.89.171:3001/api/v1/bitacoras";
          const bitacora_inventario_id = bitacoraIdd;
          //const id = bitacoraIdd;
          delete values.id;
          delete values.mes;
          delete values.inventarioInicial;
          delete values.compras;
          delete values.ventas;
          delete values.inventarioFinal;
          delete values.inventarioFisico;
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
                    {(errors.nota)?(<div className={styles.errors}>
                      <p><strong>Errores:</strong></p>
                      {errors.nota? (<p>{errors.nota}</p>):null}
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
