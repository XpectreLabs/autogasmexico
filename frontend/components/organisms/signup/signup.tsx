'use client';

import React from "react";
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import styles from './signup.module.css';
import { useRouter } from 'next/navigation';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export const Signup = ({setPage}:{setPage:Function}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");

  return (
    <Formik
        initialValues={{
          username: "",
          firstName: "",
          lastName: "",
          email:"",
          password: "",
          confirmPassword:"",
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .min(3, "The username have a minimum of 3 characters")
            .required("The username is requiered"),
          firstName: Yup.string()
            .min(3, "The first name must have a minimum of 3 characters.")
            .required("The first name is requiered"),
          lastName: Yup.string()
            .min(3, "The last name must have a minimum of 3 characters.")
            .required("The last name is requiered"),
          email: Yup.string()
            .email("The email es incorrect")
            .required("The email is requiered"),
          password: Yup.string()
            .min(3, "The password must have a minimum of 3 characters.")
            .required("The password is requiered"),
          confirmPassword:  Yup.string()
            .oneOf([Yup.ref('password')],"Passwords and password repeat must be the same.")
            .min(3, 'The confirm password must have a minimum of 3 characters.')
            .required("* The confirm password is requiered."),
        })}
        onSubmit={(values, actions) => {
          const scriptURL = "http://44.212.165.114:3001/api/v1/users/";
          const username = values.username;
          const firstName = values.firstName;
          const lastName = values.lastName;
          const email = values.email;
          const password = values.password;
          const data = {username, firstName, lastName, email, password};
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

            if(data.message==="success") {
              setShowAlert(false);
              localStorage.setItem('user_id', JSON.stringify(data.user_id));
              localStorage.setItem('token',  data.token);
              router.push("/patients")
            }
            else {
              setTextError(data.error);
              setShowAlert(true);
            }
            setTimeout(()=>{setShowAlert(false)},3000)
          })
          .catch(error => {
            //console.log(error.message);
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
                <a onClick={ ()=> { setPage("1");} } className={styles.Link}>Back</a>

                <div>
                  <figure className={styles.Logo}>
                    <img src="https://assets.website-files.com/640e73434d6821d825eadf94/640e8406f661a7392010e264_Vectors-Wrapper.svg" alt="" />
                  </figure>
                </div>

                {showAlert?(<p className={`${styles.message} slideLeft`}><strong>Error:</strong><br />{textError}</p>):null}

                <Form
                  className={styles.form}
                  name="form"
                  id="form"
                  method="post"
                  onSubmit={handleSubmit}
                >
                    <TextField
                      placeholder="Username"
                      required
                      id="username"
                      label="Username"
                      name="username"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <TextField
                      placeholder="First Name"
                      required
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <TextField
                      placeholder="Last Name"
                      required
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
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
                    <TextField
                      placeholder="Password"
                      type="Password"
                      required
                      id="password"
                      label="Password"
                      name="password"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    <TextField
                      placeholder="Repeat password"
                      type="Password"
                      required
                      id="confirmPassword"
                      label="Confirm password"
                      name="confirmPassword"
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    <div>
                        <p><strong>{(errors.username || errors.firstName || errors.lastName || errors.email || errors.password || errors.confirmPassword)?`Errores:`:null}</strong></p>
                        {errors.username? (<p>{errors.username}</p>):null}
                        {errors.firstName? (<p>{errors.firstName}</p>):null}
                        {errors.lastName? (<p>{errors.lastName}</p>):null}
                        {errors.email? (<p>{errors.email}</p>):null}
                        {errors.password? (<p>{errors.password}</p>):null}
                        {errors.confirmPassword? (<p>{errors.confirmPassword}</p>):null}
                    </div>

                    <div>
                      <CircularProgress  className={loading?'Loading show':'Loading'}/>
                    </div>

                    <input
                      className={styles.Btn}
                      type="submit"
                      value="Sign Up"
                    />
                  </Form>
                </div>
              </>
              );
          }}
      </Formik>
  );
};
