'use client';

import React from "react";
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import styles from './recovery.module.css';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export const Recovery = ({setPage}:{setPage:Function}) => {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");

  return (
    <Formik
        initialValues={{
          email:"",
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email("The email es incorrect")
            .required("The email is requiered"),
        })}
        onSubmit={(values, actions) => {
          const scriptURL = "http://localhost:3001/api/v1/users/email";
          const email = values.email;
          const data = {email};
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
            setLoading(false);
            setTypeOfMessage("error");

            if(data.message==="success") {
              console.log(data)
              localStorage.setItem('id_user_change', JSON.stringify(data.user_id));
              setTypeOfMessage("success");
              setTextError("We have sent you an email");
              setShowAlert(true);
              setTimeout(()=>{setPage(4)},3000)
            }
            else if(data.message==="schema") {
              setTextError(data.error);
              setShowAlert(true);
            }
            else {
              setTextError(data.message);
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

          const regresar="<- Regresar"
          return (
          <>
            <div className='fadeIn'>
              <a onClick={ ()=> { setPage("1");} } className={styles.Link}>{regresar}</a>
              <div>
                <figure className={styles.Logo}>
                  <img src="img/logo.jpg" alt="" />
                </figure>
              </div>

              {showAlert?(<p className={`${styles.message} ${typeOfMessage==="success"?styles.success:null} slideLeft`}><strong>Message:</strong><br />{textError}</p>):null}

                <Form
                  name="form"
                  id="form"
                  method="post"
                  onSubmit={handleSubmit}
                >
                  <TextField
                    placeholder="Email"
                    required
                    id="email"
                    label="Email"
                    name="email"
                    size="small"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <div>
                    <p><strong>{(errors.email)?`Errores:`:null}</strong></p>
                    {errors.email? (<p>{errors.email}</p>):null}
                  </div>

                  <div>
                    <CircularProgress className={loading?'Loading show':'Loading'}/>
                  </div>

                  <Button
                    variant="outlined"
                    type="submit"
                    className={styles.Btn}
                  >
                    Recuperar
                  </Button>
                </Form>
              </div>
            </>
        );
      }}
    </Formik>
  );
};
