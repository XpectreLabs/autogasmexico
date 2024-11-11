'use client';

import React from 'react';
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './Index.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export default function NuevoUsuarioModal({ isOpen, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({firstName:'',lastName:'', email:'',rfccontribuyente:'',username:'',password:'',confirmPassword:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");

  return (
    <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          firstName: Yup.string()
            .min(3, "El nombre es muy corto")
            .required("El nombre es requerido"),
          lastName: Yup.string()
            .min(3, "Los apellidos tener minimo 3 digitos")
            .required("Los apellidos es requerido"),
          email: Yup.string()
            .email("El email es incorrecto"),
          rfccontribuyente: Yup.string()
            .min(10, "El Rfc del contribuyente es muy corto")
            .required("El  Rfc del contribuyente es requerido"),
          username: Yup.string()
          .required("El nombre de usuario es requerido"),
          password: Yup.string()
            .min(3, "La contraseña es muy corto")
            .required("La contraseña es requerida"),
          confirmPassword:  Yup.string()
            .oneOf([Yup.ref('password')],"Las contraseñas y la repetición de contraseña deben ser las mismas.")
            .min(3, 'La contraseña de confirmación debe tener un mínimo de 3 caracteres.')
            .required("Se requiere la confirmación de contraseña."),
        })}
        onSubmit={(values, actions) => {
          const user_id = localStorage.getItem('user_id');
          const scriptURL = "http://44.212.165.114:3001/api/v1/usuarios";
          /*const name = values.name;
          const rfc = values.rfc;
          const direccion = values.direccion;
          const tipo_situacion_fiscal = values.tipo_situacion_fiscal;
          const permiso = values.permiso+"";
          const phone = values.phone;
          const email = values.email;*/
          delete values.confirmPassword;
          const data = {...values};
          setLoading(true);
          console.log(data);

          //setInitialValues(({firstName:'',lastName:'', email:'',username:'',password:'',confirmPassword:''}));

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
              setTextError("Los datos del usuario fueron guardados");
              setInitialValues(({firstName:'',lastName:'', email:'',username:'',password:'',confirmPassword:''}));
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
                  title="Agregar usuario">
 
                <Form id="formAddPatient" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Agregar usuario</h2>
                  <TextField
                    placeholder="Nombre"
                    required
                    id="firstName"
                    label="Nombre"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Apellidos"
                    required
                    id="lastName"
                    label="Apellidos"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
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
                  <TextField
                    placeholder="RFC Contribuyente"
                    required
                    label="RFC Contribuyente"
                    id="rfccontribuyente"
                    value={values.rfccontribuyente}
                    name="rfccontribuyente"
                    size="small"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <TextField
                    placeholder="Nombre de usuario"
                    id="username"
                    label="Nombre de usuario"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  <TextField
                    placeholder="Contraseña"
                    id="password"
                    label="Contraseña"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='password'
                  />
                  <TextField
                    placeholder="Confirmación de la contraseña"
                    type="Password"
                    equired
                    id="confirmPassword"
                    label="Confirmación de la contraseña"
                    name="confirmPassword"
                    size="small"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {(errors.firstName || errors.lastName || errors.email || errors.rfccontribuyente || errors.username || errors.password || errors.confirmPassword)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
                        {errors.firstName? (<p>{errors.firstName}</p>):null}
                        {errors.lastName? (<p>{errors.lastName}</p>):null}
                        {errors.email? (<p>{errors.email}</p>):null}
                        {errors.rfccontribuyente? (<p>{errors.rfccontribuyente}</p>):null}
                        {errors.username? (<p>{errors.username}</p>):null}
                        {errors.password? (<p>{errors.password}</p>):null}
                        {errors.confirmPassword? (<p>{errors.confirmPassword}</p>):null}
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
