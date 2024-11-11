'use client';

import React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import styles from './EditarCompra.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import NativeSelect from '@mui/material/NativeSelect';
import * as Yup from "yup";
import dayjs from 'dayjs';

export default function EditarPermisoModal({ isOpen, onClose, abastecimientoData,abastecimientoIdd }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [listPermisos,setListPermisos] = React.useState([]);


  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://44.212.165.114:3001/api/v1/cat-permisos/"+user_id+"/permisos";    //setLoading(true);

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
      console.log("data r",data);
      if(data.message==="success") {
        setListPermisos(data.listPermisos);
      }
      else if(data.message==="schema") {
        setTextError(data.error);
        setShowAlert(true);
      }
      else {
        setTextError(data.message);
        setShowAlert(true);
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

  const convertirFecha = (fecha) => {
    return (fecha.substr(6,4)+"-"+fecha.substr(3,2)+"-"+fecha.substr(0,2))
  }

  if(abastecimientoData.fecha_emision!==undefined){
    abastecimientoData.fecha_emision = dayjs(convertirFecha(abastecimientoData.fecha_emision2));
    abastecimientoData.permiso_id=abastecimientoData.permiso_id?abastecimientoData.permiso_id:'3';
    // abastecimientoData.permiso_id=abastecimientoData.permiso_id?abastecimientoData.permiso_id:localStorage.getItem('permiso_id');
  }

  useEffect(() => {
    data();
  }, []);

  console.log("Dta",abastecimientoData);
  return (
    <Formik
        enableReinitialize={true}
        initialValues={{...abastecimientoData}}
        validationSchema={Yup.object().shape({
          permiso_id:Yup.number()
            .required("El permiso es requerido"),
        })}
        onSubmit={(values, actions) => {
          const tipo_modena_id = 1;
          const scriptURL = "http://44.212.165.114:3001/api/v1/compras";
          const abastecimiento_id = abastecimientoIdd;
          delete values.id;
          delete values.fecha_emision2;
          delete values.importe2;
          delete values.preciounitario2;
          delete values.preciovent2;
          delete values.ivaaplicado2;
          delete values.proveedores;
          delete values.proveedor;
          delete values.kilos;
          delete values.permisos;
          delete values.permisoComprador;
          delete values.permiso;
          delete values.permiso_cre;

          const data = {...values,abastecimiento_id,tipo_modena_id};
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
              setTextError("El permiso comprador fue actualizado");
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
                  title="Editar permiso"
              >
                <Form id="formAddCompra" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Editar permiso</h2>

                  <NativeSelect
                    className={`Fecha ${styles.select2}`}
                    required
                    value={values.permiso_id}
                    onChange={handleChange}
                    defaultValue={values.permiso_id}
                    inputProps={{
                      id:"permiso_id",
                      name:"permiso_id"
                    }}
                  >
                    <option aria-label="None" value="">Permiso venta *</option>
                    {listPermisos.map((permiso) => {
                      return (
                        <option value={permiso.permiso_id} selected={permiso.permiso_id===abastecimientoData.permiso_id?true:false}>{permiso.permiso}</option>
                      );
                    })}
                  </NativeSelect>


                  {(errors.permiso_id)?(<div className={styles.errors}>
                        <p><strong>Error:</strong></p>
                        {errors.permiso_id? (<p>{errors.permiso_id}</p>):null}
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
