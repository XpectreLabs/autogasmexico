'use client';

import React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './EditarIngreso.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import NativeSelect from '@mui/material/NativeSelect';
import * as Yup from "yup";
import dayjs from 'dayjs'; 


export default function EditarIngresoModal({ isOpen, onClose, ventaData,ventaIdd }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [listPermisos,setListPermisos] = React.useState([]); 
  const [initialValues, setInitialValues] = useState(({client_id:'', permiso_id:'',folio:'',fecha_emision:'', cantidad:'',concepto:'', preciounitario:'', importe:'',  ivaaplicado:'',cfdi:'',tipoCfdi:'',preciovent:'',aclaracion:'',tipocomplemento:'',unidaddemedida:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [listaClientes,setListaClientes] = React.useState([]);

  const convertirFecha = (fecha) => {
    return (fecha.substr(6,4)+"-"+fecha.substr(3,2)+"-"+fecha.substr(0,2))
  }

  if(ventaData.fecha_emision!==undefined){
    ventaData.fecha_emision = dayjs(convertirFecha(ventaData.fecha_emision2));
  }

  console.log("Dta",ventaData);

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://44.212.165.114/:3001/api/v1/cat-permisos/"+user_id+"/permisos";    //setLoading(true);

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
        setTimeout(()=>{
          //Logout();
        },3200)
      }
      else {
        setTextError(data.message);
        setShowAlert(true);
        setTimeout(()=>{
          //Logout();
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

  function listClientes() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://44.212.165.114/:3001/api/v1/clientes/"+user_id+"/listaclientes";    //setLoading(true);

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
        console.log("data.listClientes",data.listClientes);
        setListaClientes(data.listClientes);
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

  useEffect(() => {
    data();
    listClientes();
  }, []);

  return (
    <Formik
        enableReinitialize={true}
        initialValues={{...ventaData}}
        validationSchema={Yup.object().shape({
          folio: Yup.string()
            .min(3, "El folio es muy corto")
            .required("El folio es requerido"),
          fecha_emision: Yup.date()
            .required("* Fecha de emisión"),
          cantidad: Yup.number()
            .min(1, "La cantidad debe tener minimo 1 digito")
            .required("La cantidad es requerido"),
          concepto: Yup.string()
            .min(3, "El concepto es muy corto")
            .required("El concepto es requerida"),
          preciounitario: Yup.number()
          .min(1, "El precio unitario debe tener minimo 1 digito")
          .required("El precio unitario es requerido"),
          importe: Yup.number()
          .min(1, "El importe debe tener minimo 1 digito")
          .required("El importe es requerido"),
          ivaaplicado: Yup.number()
          .min(1, "El iva aplicado debe tener minimo 1 digito")
          .required("El iva aplicado es requerido"),
          cfdi: Yup.string()
            .min(3, "El cfdi es muy corto")
            .required("El cfdi es requerido"),
          tipoCfdi: Yup.string()
            .min(3, "El tipo de cfdi es muy corto")
            .required("El tipo de cfdi es requerido"),
          preciovent: Yup.number()
            .min(1, "El precio de compra debe tener minimo 1 digito")
            .required("El precio de compra es requerido"),
          aclaracion: Yup.string()
            .min(3, "La aclaración es muy corto")
            .required("La aclaración de compra es requerido"),
          tipocomplemento: Yup.string()
            .min(3, "El tipo de complemento es muy corto")
            .required("El tipo de complemento es requerido"),
          unidaddemedida: Yup.string()
            .min(3, "La unidad de medida es muy corto")
            .required("La unidad de medida es requerido"),
          permiso_id:Yup.number()
            .required("El permiso es requerido"),
          client_id:Yup.number()
            .required("El cliente es requerido"),
        })}
        onSubmit={(values, actions) => {
          const tipo_modena_id = 1;
          const scriptURL = "http://44.212.165.114/:3001/api/v1/ingresos";
          const venta_id = ventaIdd;
          delete values.id;
          delete values.fecha_emision2;
          delete values.importe2;
          delete values.preciounitario2;
          delete values.preciovent2;
          delete values.ivaaplicado2;
          delete values.cliente;
          delete values.clients;
          delete values.permisos;
          delete values.permiso;
          /*const folio = values.name;
          const rfc = values.rfc;
          const direccion = values.direccion;
          const tipo_situacion_fiscal = values.tipo_situacion_fiscal;
          const permiso = values.permiso+"";
          const phone = values.phone;
          const email = values.email;*/
          const data = {...values,venta_id,tipo_modena_id};
          setLoading(true);

          setInitialValues(({client_id:'', permiso_id:'',folio:'',fecha_emision:'', cantidad:'',concepto:'', preciounitario:'', importe:'',  ivaaplicado:'',cfdi:'',tipoCfdi:'',preciovent:'',aclaracion:'',tipocomplemento:'',unidaddemedida:''}));
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
              setTextError("Los datos del ingreso fueron actualizados");
              setInitialValues(({client_id:'', permiso_id:'', folio:'',fecha_emision:'', cantidad:'',concepto:'', preciounitario:'', importe:'',  ivaaplicado:'',cfdi:'',tipoCfdi:'',preciovent:'',aclaracion:'',tipocomplemento:'',unidaddemedida:''}));
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
                //Logout();
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
                  title="Editar venta"
              >
                <Form id="formEditIngreso" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Editar venta</h2>
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    placeholder="Folio"
                    required
                    id="folio"
                    label="Folio"
                    name="folio"
                    value={values.folio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      required
                      className={`InputModal Fecha `}
                      placeholder="Fecha de emisión"
                      label="Fecha de emisión"
                      id="fecha_emision"
                      name="fecha_emision"
                      defaultValue={dayjs(values.fecha_emision)}
                      onChange={(value) => {
                        setFieldValue('fecha_emision', value, true);
                      }}
                    />
                  </LocalizationProvider>
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Cantidad"
                    id="cantidad"
                    label="Cantidad"
                    name="cantidad"
                    value={values.cantidad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Unidad de medida"
                    id="unidaddemedida"
                    label="Unidad de medida"
                    name="unidaddemedida"
                    value={values.unidaddemedida}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Concepto"
                    id="concepto"
                    label="Concepto"
                    name="concepto"
                    value={values.concepto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Precio unitario"
                    id="preciounitario"
                    label="Precio unitario"
                    name="preciounitario"
                    value={values.preciounitario}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />

                <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Importe"
                    id="importe"
                    label="Importe"
                    name="importe"
                    value={values.importe}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Iva aplicado"
                    id="ivaaplicado"
                    label="Iva aplicado"
                    name="ivaaplicado"
                    value={values.ivaaplicado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Precio de ingreso"
                    id="preciovent"
                    label="Precio de ingreso"
                    name="preciovent"
                    value={values.preciovent}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
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
                    <option aria-label="None" value="">Permiso *</option>
                    {listPermisos.map((permiso) => {
                      return (
                        <option value={permiso.permiso_id} selected={permiso.permiso_id===ventaData.permiso_id?true:false}>{permiso.permiso}</option>
                      );
                    })}
                  </NativeSelect>
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Cfdi"
                    id="cfdi"
                    label="Cfdi"
                    name="cfdi"
                    value={values.cfdi}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Tipo de cfdi"
                    id="tipoCfdi"
                    label="Tipo de cfdi"
                    name="tipoCfdi"
                    value={values.tipoCfdi}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Aclaración"
                    id="aclaracion"
                    label="Aclaración"
                    name="aclaracion"
                    value={values.aclaracion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Tipo complemento"
                    id="tipocomplemento"
                    label="Tipo complemento"
                    name="tipocomplemento"
                    value={values.tipocomplemento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                <NativeSelect
                  className={` Fecha ${styles.select}`}
                  required
                  value={values.client_id}
                  onChange={handleChange}
                  defaultValue={values.client_id}
                  inputProps={{
                    id:"client_id",
                    name:"client_id"
                  }}
                >
                  <option aria-label="None" value="">Cliente *</option>
                  <option value={1}>PETREOS</option>
                  <option value={2}>GAS DE APAN SA DE CV</option>

                  {listaClientes.map((cliente) => {
                      return (
                        <option value={cliente.client_id} selected={cliente.client_id===ventaData.client_id?true:false}>{cliente.name}</option>
                      );
                    })}
                </NativeSelect>

                  {(errors.client_id || errors.folio || errors.fecha_emision || errors.cantidad || errors.concepto || errors.preciounitario || errors.importe|| errors.ivaaplicado|| errors.cfdi|| errors.tipoCfdi|| errors.preciovent|| errors.aclaracion|| errors.tipocomplemento || errors.unidaddemedida || errors.permiso_id)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
                        {errors.folio? (<p>{errors.folio}</p>):null}
                        {errors.fecha_emision? (<p>{errors.fecha_emision}</p>):null}
                        {errors.cantidad? (<p>{errors.cantidad}</p>):null}
                        {errors.concepto? (<p>{errors.concepto}</p>):null}
                        {errors.preciounitario? (<p>{errors.preciounitario}</p>):null}
                        {errors.importe? (<p>{errors.importe}</p>):null}
                        {errors.ivaaplicado? (<p>{errors.ivaaplicado}</p>):null}
                        {errors.cfdi? (<p>{errors.cfdi}</p>):null}
                        {errors.tipoCfdi? (<p>{errors.tipoCfdi}</p>):null}
                        {errors.preciovent? (<p>{errors.preciovent}</p>):null}
                        {errors.aclaracion? (<p>{errors.aclaracion}</p>):null}
                        {errors.tipocomplemento? (<p>{errors.tipocomplemento}</p>):null}
                        {errors.unidaddemedida? (<p>{errors.unidaddemedida}</p>):null}
                        {errors.client_id? (<p>{errors.client_id}</p>):null}
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
