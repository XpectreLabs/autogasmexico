'use client';

import React from "react";
import TextField from '@mui/material/TextField';
import styles from './changePassword.module.css';
import { useRouter } from 'next/navigation';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export const ChangePassword = ({setPage}:{setPage:Function}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [intentos, setIntentos] = React.useState(0);
  //alert(localStorage.getItem('email_user'));
  return (
    <Formik
        initialValues={{
          recoveryCode: "",
          password: "",
          confirmPassword:"",
        }}
        validationSchema={Yup.object().shape({
          recoveryCode: Yup.string()
            .min(8, "El código de recuperación tiene un mínimo de 8 caracteres.")
            .required("*El código de recuperación es requerido"),
          password: Yup.string()
            .min(8, "La contraseña debe tener un mínimo de 8 caracteres.")
            .required("*La nueva contraseña es requerida"),
          confirmPassword:  Yup.string()
            .oneOf([Yup.ref('password')],"La contraseña y la repetición de contraseña deben ser las mismas.")
            .min(3, 'La confirmación de la contraseña debe tener un mínimo de 8 caracteres.')
            .required("* La confirmación de la contraseña es requerida."),
        })}
        onSubmit={(values, actions) => {
          const scriptURL = "http://localhost:3001/api/v1/usuarios/changePassword";
          const recoveryCode = values.recoveryCode;
          const password = values.password;
          const id_user_change = localStorage.getItem('id_user_change');
          let clave = localStorage.getItem('clave');
          const data = { recoveryCode, id_user_change, password, clave };
          setLoading(true);

          fetch(scriptURL, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers:{
              'Content-Type': 'application/json'
            }
          })
          .then((resp) => resp.json())
          .then(function(data) {
            setLoading(false);
            setTypeOfMessage("error");

            if(data.message==="success") {
              setTypeOfMessage("success");
              setTextError("La contraseña se ha cambiado");
              setShowAlert(true);
              setTimeout(()=>{setPage("1")},3000)
            }
            else if(data.message==="schema") {
              setTextError(data.error);
              setShowAlert(true);

              setTimeout(()=>{setShowAlert(false)},3000)
            }
            else {
              setTextError(data.message);
              if(intentos>2) {
                setTextError("Haz superado el número de intentos");
                setTimeout(()=>{setPage("1")},3000)
              }
              else
                setIntentos(intentos+1);
              
              setShowAlert(true);

              setTimeout(()=>{setShowAlert(false)},3000)
            }
            //setTimeout(()=>{setShowAlert(false)},3000)
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
              <div className='fadeIn'>
                <a onClick={ ()=> { setPage("1");} } className={styles.Link}>{"<"} Regresar</a>

                <div>
                  <figure className={styles.Logo}>
                    <img src="img/logo.jpg" alt="" />
                  </figure>
                </div>

                {showAlert?(<p className={`${styles.message} ${typeOfMessage==="success"?styles.success:null} slideLeft`}><strong>Mensaje:</strong><br />{textError}</p>):null}

                <Form
                  className={styles.form}
                  name="form"
                  id="form"
                  method="post"
                  onSubmit={handleSubmit}
                >
                    <TextField
                      placeholder="Código de recuperación"
                      required
                      id="recoveryCode"
                      label="Código de recuperación"
                      name="recoveryCode"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <TextField
                      placeholder="Nueva contraseña"
                      type="Password"
                      required
                      id="password"
                      label="Nueva contraseña"
                      name="password"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    <TextField
                      placeholder="Confirmación la contraseña"
                      type="Password"
                      required
                      id="confirmPassword"
                      label="Confirmación la contraseña"
                      name="confirmPassword"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    <div>
                        <p><strong>{(errors.recoveryCode || errors.password || errors.confirmPassword)?`Errores:`:null}</strong></p>
                        {errors.recoveryCode? (<p>{errors.recoveryCode}</p>):null}
                        {errors.password? (<p>{errors.password}</p>):null}
                        {errors.confirmPassword? (<p>{errors.confirmPassword}</p>):null}
                    </div>

                    <div>
                      <CircularProgress  className={loading?'Loading show':'Loading'}/>
                    </div>

                    <input
                      className={styles.Btn}
                      type="submit"
                      value="Cambiar"
                    />
                  </Form>
                </div>
              </>
              );
          }}
      </Formik>
  );
};
