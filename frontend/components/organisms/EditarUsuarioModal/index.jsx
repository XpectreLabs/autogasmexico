'use client';

import React from 'react';
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './Index.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import * as Yup from "yup";

export default function EditarUsuarioModal({ isOpen, onClose, userData,userIdd }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({firstname:'',lastname:'', email:'',username:'',password:'',confirmPassword:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [showCambio,setShowCambio] = React.useState(true);

  userData.email = userData.email==="Sin email"?"":userData.email;

  return (
    <Formik
        enableReinitialize={true}
        initialValues={{...userData}}
        validationSchema={Yup.object().shape({
          firstname: Yup.string()
            .min(3, "El nombre es muy corto")
            .required("El nombre es requerido"),
          lastname: Yup.string()
            .min(3, "Los apellidos tener minimo 3 digitos")
            .required("Los apellidos es requerido"),
          email: Yup.string()
            .email("El email es incorrecto"),
          password: Yup.string()
            .min(3, "La contraseña es muy corto"),
          confirmPassword:  Yup.string()
            .oneOf([Yup.ref('password')],"Las contraseñas y la repetición de contraseña deben ser las mismas.")
            .min(3, 'La contraseña de confirmación debe tener un mínimo de 3 caracteres.')
        })}
        onSubmit={(values, actions) => {
          const user_id = localStorage.getItem('user_id');
          const scriptURL = "http://localhost:3001/api/v1/usuarios";
          /*const name = values.name;
          const rfc = values.rfc;
          const direccion = values.direccion;
          const tipo_situacion_fiscal = values.tipo_situacion_fiscal;
          const permiso = values.permiso+"";
          const phone = values.phone;
          const email = values.email;*/
          delete values.id;
          delete values.confirmPassword;
          delete values.username;
          delete values.date;
          const data = {...values};
          setLoading(true);
          console.log(data);

          //setInitialValues(({firstname:'',lastname:'', email:'',username:'',password:'',confirmPassword:''}));

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
              setTextError("Los datos del usuario fueron editados");
              setInitialValues(({firstname:'',lastname:'', email:'',username:'',password:'',confirmPassword:''}));
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
                  title="Editar usuario">
 
                <Form id="formAddPatient" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Editar usuario</h2>
                  <TextField
                    placeholder="Nombre"
                    required
                    id="firstname"
                    label="Nombre"
                    name="firstname"
                    value={values.firstname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Apellidos"
                    required
                    id="lastname"
                    label="Apellidos"
                    name="lastname"
                    value={values.lastname}
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
                    placeholder="Nombre de usuario"
                    id="username"
                    label="Nombre de usuario"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled="true"
                    size="small"
                  />

                    <div style={{color: '#000',textAlign:'left', marginBottom: '10px'}}>
                      <FormControlLabel  control={<Checkbox id="cbCambiar" name="cbCambiar" onClick={()=>{setShowCambio(!showCambio)}} />} label="Cambiar contraseña:" />
                    </div>

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
                    disabled={showCambio}
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
                    disabled={showCambio}
                  />
                  {(errors.firstname || errors.lastname || errors.email || errors.username || errors.password || errors.confirmPassword)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
                        {errors.firstname? (<p>{errors.firstname}</p>):null}
                        {errors.lastname? (<p>{errors.lastname}</p>):null}
                        {errors.email? (<p>{errors.email}</p>):null}
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
