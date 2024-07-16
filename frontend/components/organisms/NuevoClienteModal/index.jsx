'use client';

import React from 'react';
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './NuevoClienteModal.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export default function NuevoClienteModal({ isOpen, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({name:'',rfc:'', direccion:'',tipo_situacion_fiscal:'', phone:'',  email:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");

  return (
    <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .min(3, "El nombre es muy corto")
            .required("El nombre es requerido"),
          rfc: Yup.string()
            .min(11, "El rfc debe tener minimo 11 digitos")
            .required("El rfc es requerido"),
          direccion: Yup.string()
            .min(3, "El código postal es muy corto")
            .required("El código postal es requerida"),
          tipo_situacion_fiscal: Yup.string()
            .min(3, "El tipo de situación fiscal es muy corto")
            .required("El tipo de situación fiscal es requerido"),
          phone: Yup.string()
            .min(3, "El teléfono es muy corto"),
          email: Yup.string()
            .email("El email es incorrecto"),
        })}
        onSubmit={(values, actions) => {
          const user_id = localStorage.getItem('user_id');
          const scriptURL = "http://localhost:3001/api/v1/clientes";
          const name = values.name;
          const rfc = values.rfc;
          const direccion = values.direccion;
          const tipo_situacion_fiscal = values.tipo_situacion_fiscal;
          const phone = values.phone;
          const email = values.email;
          const data = {name, rfc, direccion, tipo_situacion_fiscal, phone, email,user_id};
          setLoading(true);

          setInitialValues(({name:'',rfc:'', direccion:'',tipo_situacion_fiscal:'', phone:'',  email:''}));

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
              setTextError("Los datos del cliente fueron guardados");
              setInitialValues(({name:'',rfc:'', direccion:'',tipo_situacion_fiscal:'', phone:'',  email:''}));
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
        }) => {
          return (
            <>
              {showAlert?(<p className={`${styles.message} ${typeOfMessage==="success"?styles.success:null} slideLeft`}><strong>Message:</strong><br />{textError}</p>):null}

              <Modal
                  open={isOpen}
                  onClose={onClose}
                  className={styles.Modal}
                  title="Agregar cliente">
 
                <Form id="formAddPatient" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Agregar cliente</h2>
                  <TextField
                    placeholder="Nombre"
                    required
                    id="name"
                    label="Nombre"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Rfc"
                    required
                    id="rfc"
                    label="Rfc"
                    name="rfc"
                    value={values.rfc}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Código postal"
                    required
                    id="direccion"
                    label="Código postal"
                    name="direccion"
                    value={values.direccion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Tipo de situación fiscal"
                    required
                    id="tipo_situacion_fiscal"
                    label="Tipo de situación fiscal"
                    name="tipo_situacion_fiscal"
                    value={values.tipo_situacion_fiscal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Teléfono"
                    id="phone"
                    label="Teléfono"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    placeholder="Email"
                    id="email"
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  {(errors.name || errors.rfc || errors.direccion || errors.tipo_situacion_fiscal || errors.phone || errors.email)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
                        {errors.name? (<p>{errors.name}</p>):null}
                        {errors.rfc? (<p>{errors.rfc}</p>):null}
                        {errors.direccion? (<p>{errors.direccion}</p>):null}
                        {errors.tipo_situacion_fiscal? (<p>{errors.tipo_situacion_fiscal}</p>):null}
                        {errors.phone? (<p>{errors.phone}</p>):null}
                        {errors.email? (<p>{errors.email}</p>):null}
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
