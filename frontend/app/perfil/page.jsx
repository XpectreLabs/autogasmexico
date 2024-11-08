'use client';

import React, { useState } from 'react';
import styles from './perfil.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useRouter } from 'next/navigation';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({firstname:'', lastname:'', email:''}));
  const [loadingData, setLoadingData] = React.useState(false);
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [showCambio,setShowCambio] = React.useState(true);

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://localhost:3001/api/v1/usuarios/"+user_id+"/usuario";    //setLoading(true);

    fetch(scriptURL, {
      method: 'GET',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(data) {
      console.log("data",data);
      if(data.message==="success") {
        setLoadingData(true);
        setInitialValues(({firstname:""+data.dataUsuario[0]['firstname'], lastname:data.dataUsuario[0]['lastname'],rfccontribuyente:data.dataUsuario[0]['rfccontribuyente'], rfcrepresentantelegal: data.dataUsuario[0]['rfcrepresentantelegal'],rfcproveedor: data.dataUsuario[0]['rfcproveedor'], username: data.dataUsuario[0]['username'], email:data.dataUsuario[0]['email']?data.dataUsuario[0]['email']:''}));
        setShowAlert(false);
      }
      else if(data.message==="schema") {
        setTextError(data.error);
        setShowAlert(true);
        setTimeout(()=>{
          Logout();
        },3200)
      }
      else {
        setTextError(data.message);
        setShowAlert(true);
        setTimeout(()=>{
          Logout();
        },3200)
      }

      setTimeout(()=>{
        setShowAlert(false);
      },3000)
    })
    .catch(error => {
      console.log(error.message);
      console.error('Error!', error.message);
    });
  }

  loadingData===false?data():null;

  return (
    <main className={styles.main} style={{ opacity: 1 }}>
      {/* <Navbar activeMain="5" /> */}
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          firstname: Yup.string()
            .min(3, "El nombre es muy corto")
            .required("El nombre es requerido"),
          lastname: Yup.string()
            .min(3, "Los apellidos tener minimo 3 digitos")
            .required("Los apellidos es requerido"),
          rfccontribuyente: Yup.string()
            .min(10, "El Rfc del contribuyente es muy corto")
            .required("El  Rfc del contribuyente es requerido"),
          rfcrepresentantelegal: Yup.string()
            .min(10, "El Rfc del representante legal es muy corto")
            .required("El Rfc del representante legal es requerido"),
          rfcproveedor: Yup.string()
            .min(10, "El Rfc del proveedor es muy corto")
            .required("El Rfc del proveedor es requerido"),
          email: Yup.string()
            .email("El email es incorrecto"),
          password: Yup.string()
            .min(3, "La contraseña es muy corto"),
          confirmPassword:  Yup.string()
            .oneOf([Yup.ref('password')],"Las contraseñas y la repetición de contraseña deben ser las mismas.")
            .min(3, 'La contraseña de confirmación debe tener un mínimo de 3 caracteres.')
        })}
        onSubmit={(values, actions) => {
          /*const scriptURL = "http://localhost:3001/api/v1/users/";
          const user_id = localStorage.getItem('user_id');
          const firstname = values.firstname;
          const lastname = values.lastname;
          const email = values.email;
          const data = {user_id,firstname, lastname, email};
          setLoading(true);*/


          const user_id = parseInt(localStorage.getItem('user_id'));
          const scriptURL = "http://localhost:3001/api/v1/usuarios";
          delete values.id;
          delete values.confirmPassword;
          delete values.username;
          const data = {...values,user_id};
          setLoading(true);

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

              localStorage.setItem('isSavePerfil', true)

              if(localStorage.getItem("isSavePermiso")&&localStorage.getItem("isSavePerfil")){
                localStorage.setItem('isInicial', true)
                //router.push('/compras');
              }

              setTypeOfMessage("success");
              setTextError("Tus datos de acceso fueron actualizados");
              setShowAlert(true);
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

          /*fetch(scriptURL, {
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
            setShowAlert(true);
            setTypeOfMessage("error");

            if(data.message==="success") {
              setTypeOfMessage("success");
              setTextError("Date edited👌");
              setShowAlert(true);
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
            setTimeout(()=>{setShowAlert(false)},4000)
          })
          .catch(error => {
            console.log(error.message);
            console.error('Error!', error.message);
          });*/
        }}
      >
        {({
          values ,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => {
          return (
            <>
              <Grid item xs={2}>
              </Grid>
              <Grid item xs={10}>
                {/* <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px", textAlign: "center"}}><strong>Usuario maestro</strong></p> */}
                <div className={styles.center}>
                  {showAlert?(<p className={`${styles.message} ${typeOfMessage==="success"?styles.success:null} slideLeft`}><strong>Message:</strong><br />{textError}</p>):null}

                  <Form
                      name="form"
                      id="form"
                      method="post"
                      onSubmit={handleSubmit}
                      className={styles.form}
                  >
                    {/* <p>Razones social</p> */}

                    <Grid container spacing={2}>
                      <Grid item xs={6} align="center">
                          <label className={styles.lbl}><strong>RFC Contribuyente:</strong></label>
                        <TextField
                          placeholder="RFC Contribuyente"
                          required
                          id="rfccontribuyente"
                          value={values.rfccontribuyente}
                          name="rfccontribuyente"
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        <label className={styles.lbl}><strong>RFC Representante legal:</strong></label>
                        <TextField
                          placeholder="RFC Representante legal"
                          required
                          id="rfcrepresentantelegal"
                          value={values.rfcrepresentantelegal}
                          name="rfcrepresentantelegal"
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Grid>

                      <Grid item xs={6} align="center">
                        <label className={styles.lbl}><strong>RFC proveedor:</strong></label>
                        <TextField
                          placeholder="RFC proveedor"
                          required
                          id="rfcproveedor"
                          value={values.rfcproveedor}
                          name="rfcproveedor"
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Grid>
                    </Grid>
                    

                    <Grid container spacing={2}>
                      <Grid item xs={6} align="center">
                        <label className={styles.lbl}><strong>Nombre:</strong></label>
                        <TextField
                          placeholder="Nombre"
                          required
                          id="firstname"
                          name="firstname"
                          value={values.firstname}
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        <label className={styles.lbl}><strong>Email:</strong></label>
                        <TextField
                          placeholder="email"
                          id="email"
                          value={values.email}
                          name="email"
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Grid>

                      <Grid item xs={6} align="center">
                        <label className={styles.lbl}><strong>Apellidos:</strong></label>
                        <TextField
                          placeholder="Apellidos"
                          required
                          id="lastname"
                          value={values.lastname}
                          name="lastname"
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <label className={styles.lbl}><strong>Usuario:</strong></label>
                        <TextField
                          placeholder="Usuario"
                          required
                          id="username"
                          name="username"
                          value={values.username}
                          size="small"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled="false"
                        />
                      </Grid>
                      
                    </Grid>
                    

                    
                    
                    

                    
                    

                    <div style={{textAlign:'left', marginBottom: '10px'}}>
                      <FormControlLabel  control={<Checkbox id="cbCambiar" name="cbCambiar" onClick={()=>{setShowCambio(!showCambio)}} />} label="Cambiar datos de acceso:" />
                    </div>

                    <label className={styles.lbl}><strong>Nueva contraseña:</strong></label>
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

                    <label className={styles.lbl}><strong>Repite la contraseña:</strong></label>
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

                    <div className={styles.errors}>
                        <p><strong>{(errors.firstname || errors.lastname || errors.email || errors.rfccontribuyente || errors.rfcrepresentantelegal || errors.rfcproveedor)?`Errores:`:null}</strong></p>
                        {errors.firstname? (<p>{errors.firstname}</p>):null}
                        {errors.lastname? (<p>{errors.lastname}</p>):null}
                        {errors.email? (<p>{errors.email}</p>):null}
                        {errors.rfccontribuyente? (<p>{errors.rfccontribuyente}</p>):null}
                        {errors.rfcrepresentantelegal? (<p>{errors.rfcrepresentantelegal}</p>):null}
                        {errors.rfcproveedor? (<p>{errors.rfcproveedor}</p>):null}
                    </div>

                    <div>
                      <CircularProgress  className={loading?'Loading show':'Loading'}/>
                    </div>

                    <div className={styles.btns}>
                      <input
                        className={styles.btn}
                        type="submit"
                        value="Actualizar"
                      />
                    </div>
                  </Form>
                </div>
            </Grid>
            </>
          );
        }}
      </Formik>
    </main>
  );
}
