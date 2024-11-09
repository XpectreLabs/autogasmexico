'use client';
import React from "react";
import TextField from '@mui/material/TextField';
import styles from './login.module.css'
import { useRouter } from 'next/navigation';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export const Login = ({setPage}:{setPage:Function}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");

  return (
    <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .min(3, "El nombre de usuario es corto")
            .required("El usuario es requerido"),

          password: Yup.string()
            .min(3, "La contraseña es corta")
            .required("La contraseña es requerida"),
        })}
        onSubmit={(values, actions) => {
          const scriptURL = "http://54.242.89.171:3001/api/v1/auth/login";
          const username = values.username;
          const password = values.password;
          const data = {username, password};
          setLoading(true);

          fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
              'Content-Type': 'application/json'
            }
          })
          .then((resp) => resp.json())
          .then(function(data) {
            if(data.message==="success") {
              setShowAlert(false);
              console.log("data",data)
              localStorage.setItem('user_id', JSON.stringify(data.user_id));
              localStorage.setItem('nameUser', data.name);
              localStorage.setItem('isInicial', data.isInicial)
              localStorage.setItem('type_user', data.type_user);
              localStorage.setItem('rfccontribuyente', data.rfccontribuyente);
              localStorage.setItem('rfcproveedor', data.rfcproveedor);
              localStorage.setItem('rfcrepresentantelegal', data.rfcrepresentantelegal);
              localStorage.setItem('token',  data.token);
              localStorage.setItem('permiso_id', '3');
              localStorage.setItem('permiso', "LP/22811/COM/2019");

              if(data.isInicial)
                router.push("/compras");
              else
                router.push("/panel_configuracion");

              setTimeout(()=> {
                setLoading(false);
              },500)
            }
            else if(data.message==="Los datos de acceso son incorrectos") {
              setTextError(data.message);
              setShowAlert(true);
            }
            else {
              setTextError(data.error);
              setShowAlert(true);
            }
            setTimeout(()=>{setShowAlert(false)},3000)
          })
          .catch(error => {
            console.log(error.message);
            console.error('Error!', error.message);
          });
        }}
      >
        {({
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => {
          return (
            <>
              <div  className='fadeIn'>
                <div>
                  <figure className={styles.Logo}>
                    <img src="img/logo.jpg" alt="" />
                  </figure>
                </div>

                {showAlert?(<p className={`${styles.message} slideLeft`}><strong>Error:</strong><br />{textError}</p>):null}

                  <Form
                      name="form"
                      id="form"
                      method="post"
                      onSubmit={handleSubmit}
                    >
                    <TextField
                      placeholder="Usuario"
                      required
                      id="username"
                      label="Usuario"
                      name="username"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <TextField
                      placeholder="Contraseña"
                      type="password"
                      required
                      id="password"
                      label="Contraseña"
                      name="password"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div>
                        <p><strong>{(errors.username || errors.password)?`Errores:`:null}</strong></p>
                        {errors.username? (<p>{errors.username}</p>):null}
                        {errors.password? (<p>{errors.password}</p>):null}
                    </div>

                    <div>
                      <CircularProgress  className={loading?'Loading show':'Loading'}/>
                    </div>

                    <input
                      className={styles.Btn}
                      type="submit"
                      value="Entrar"
                    />
                  </Form>

                  <a onClick={ ()=> {setPage("2"); }} className={styles.Link}>Recuperar contraseña</a>

                </div>
              </>
            );
        }}
    </Formik>
  );
};
