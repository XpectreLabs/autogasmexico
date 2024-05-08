'use client';

import React from 'react';
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './EditPatientModal.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import * as Yup from "yup";

export default function EditPatientModal({ isOpen, onClose,patientData,patientIdd }) {
  console.log(patientData);
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({firstName:'',lastName:'', email:' ', phone:'', ssn:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");

  return (
    <Formik
        enableReinitialize={true}
        initialValues={{...patientData}}
        validationSchema={Yup.object().shape({
          firstName: Yup.string()
            .min(3, "The first name is short")
            .required("The first name is requiered"),
          lastName: Yup.string()
            .min(3, "The last name is short")
            .required("The last name is requiered"),
          email: Yup.string()
            .email("The email es incorrect")
            .required("The email is requiered"),
          phone: Yup.string()
            .min(3, "The phone is short")
            .required("The phone is requiered"),
          ssn: Yup.string()
            .min(3, "The ssn is short")
            .required("The ssn is requiered"),
        })}
        onSubmit={(values, actions) => {
          const id = localStorage.getItem('user_id');
          const scriptURL = "http://localhost:3001/api/v1/patients/";
          const patient_id = patientIdd;
          const firstName = values.firstName;
          const lastName = values.lastName;
          const email = values.email;
          const phone = values.phone+"";
          const ssn = values.ssn;
          const data = {patient_id,firstName, lastName, email, phone, ssn,id};
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
              setTypeOfMessage("success");
              setTextError("Data has been updated");
              setInitialValues(({firstName:'',lastName:'', email:' ', phone:'', ssn:''}));
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
                  title="Add a Patient">
 
                <Form id="formAddPatient" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Edit a Patient</h2>
                  <TextField
                    placeholder="SSN"
                    required
                    id="ssn"
                    label="SSN"
                    name="ssn"
                    value={values.ssn}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="First Name"
                    required
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Last Name"
                    required
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    placeholder="Phone"
                    required
                    id="phone"
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    placeholder="Email"
                    required
                    id="email"
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  {(errors.firstName || errors.lastName || errors.email || errors.phone || errors.ssn)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
                        {errors.firstName? (<p>{errors.firstName}</p>):null}
                        {errors.lastName? (<p>{errors.lastName}</p>):null}
                        {errors.email? (<p>{errors.email}</p>):null}
                        {errors.phone? (<p>{errors.phone}</p>):null}
                        {errors.ssn? (<p>{errors.ssn}</p>):null}
                    </div>):null}

                    <div className={styles.ContentLoadding}>
                      <CircularProgress  className={loading?'Loading show':'Loading'}/>
                    </div>

                  <div className={styles.btns}>
                    <Button className={styles.btn} variant="outlined" type="submit">Save</Button>
                  </div>
                </Form>
              </Modal>
              </>
            );
          }}
      </Formik>
  );
}
