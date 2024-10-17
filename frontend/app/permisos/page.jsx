'use client';

import React, { useState,useEffect } from 'react';
import styles from './index.module.css';
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import NativeSelect from '@mui/material/NativeSelect';
import dayjs from 'dayjs';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({nombre_permiso:'', inventario_inicial:'' ,caracter: '',modalidadpermiso: '',claveinstalacion: '',descripcioninstalacion: '',numeropozos: '',numerotanques: '',numeroductosentradasalida: '',numeroductostransportedistribucion: '',numerodispensarios:  '',claveidentificaciontanque:  '',localizacionyodescripciontanque:  '',valornumericocapacidadtotaltanque:  '',valornumericocapacidadoperativatanque:  '',valornumericocapacidadutiltanque: '',valornumericocapacidadfondajetanque: '',valornumericovolumenminimooperacion:  '',estadotanque: '',sistemamediciontanque: '',localizodescripsistmediciontanque: '', incertidumbremedicionsistmediciontanque: ''}));
  const [loadingData, setLoadingData] = React.useState(false);
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [showCambio,setShowCambio] = React.useState(true);
  const [listPermisos,setListPermisos] = useState([]);

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function obtenerFecha(fecha) {
    let fechaA = fecha+"";
        fechaA = fechaA.substring(0,10);
    return fechaA;
  } 

  function getListPermiso() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://localhost:3001/api/v1/cat-permisos/"+user_id+"/permisos";    //setLoading(true);

    fetch(scriptURL, {
      method: 'GET',
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

        //delete values.id;
        /*et listInfo = data.listPermisos[0];
        delete listInfo.permiso_id;
        delete listInfo.permiso;*/

        for(let j=0; j<data.listPermisos.length; j++) {
          data.listPermisos[j].vigenciacalibraciontanque = dayjs(obtenerFecha(data.listPermisos[j].vigenciacalibraciontanque));
          data.listPermisos[j].vigenciacalibracionsistmediciontanque = dayjs(obtenerFecha(data.listPermisos[j].vigenciacalibracionsistmediciontanque));
        }       

        setInitialValues(data.listPermisos[parseInt(localStorage.getItem('permiso_id'))-1]);
      }
      else if(data.message==="schema") {
        setTextError(data.error);
        setShowAlert(true);
      }
      else {
        setTextError(data.message);
        setShowAlert(true);
        Logout();
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

  /*function data() {
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
        setInitialValues(({firstname:""+data.dataUsuario[0]['firstname'], lastname:data.dataUsuario[0]['lastname'], email:data.dataUsuario[0]['email']?data.dataUsuario[0]['email']:''}));
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
  }*/

  const onChangePermiso = (tipo) =>{
    const permiso = tipo.target.value

    //alert(permiso);
    //alert(listPermisos[permiso]);
    console.log(listPermisos[permiso-1]);
    setInitialValues(listPermisos[permiso-1]);
    /*if(document.querySelector("input[name=fecha_desde]").value!==''){
      const permiso = tipo.target.value
      const anio = document.querySelector("input[name=fecha_desde]").value;
      setTipoPermiso(permiso);
      SetAnioC(anio)
      cargarDataPorPermiso(permiso,anio,mesC,diaC);
    }
    else {
      setTextError("Debe de seleccionar el año");
      setShowAlert(true);

      setTimeout(()=>{
        setShowAlert(false);
      },3000)
    }*/
  }

  //loadingData===false?data():null;

  useEffect(() => {
    getListPermiso();
  }, []);
  return (
    <main className={styles.main} style={{ opacity: 1 }}>
      <Navbar activeMain="8" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
          <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px", textAlign: "center"}}><strong>Permisos</strong></p>
            <Grid container spacing={0}>
              <Grid item xs={12} style={{marginTop: '25px', marginBottom: '0px'}} align="center">
                  <NativeSelect
                      className={`Fecha ${styles.select2}`}
                      style={{marginLeft:"20px"}}
                      required
                      onChange={onChangePermiso}
                      defaultValue={0}
                      inputProps={{
                        id:"permiso_id",
                        name:"permiso_id"
                      }}
                    >
                      {listPermisos.map((permiso) => {
                        return (
                          <option value={permiso.permiso_id} selected={permiso.permiso_id===parseInt(localStorage.getItem('permiso_id'))?true:false}>{permiso.permiso}</option>
                        );
                      })}
                  </NativeSelect>
                </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          nombre_permiso: Yup.string()
          .min(3, "El nombre del permiso es muy corto")
          .required("El nombre del permiso es requerido"),
          inventario_inicial: Yup.number()
          .required("El numero de pozos es requerido"),
          caracter: Yup.string()
            .min(3, "El caracter es muy corto")
            .required("El caracter es requerido"),
          modalidadpermiso: Yup.string()
            .min(3, "La modalidad permiso es muy corto")
            .required("La modalidad permiso es requerido"),
          claveinstalacion: Yup.string()
            .min(3, "La clave de instalación es muy corto")
            .required("La clave de instalación es requerido"),
          descripcioninstalacion: Yup.string()
            .min(3, "La descripción de instalación es muy corta")
            .required("La descripción de instalación es requerida"),
          numeropozos: Yup.number()
            .required("El numero de pozos es requerido"),
          numerotanques: Yup.number()
            .min(1, "El numero tanques tener minimo 1 digito")
            .required("El numero de tanques es requerido"),
          numeroductosentradasalida: Yup.number()
            .required("El numero de producto entrada salida es requerido"),
          numeroductostransportedistribucion: Yup.number()
            .required("El numero productos transporte distribución es requerido"),
          numerodispensarios: Yup.number()
            .required("El numero dispensarios es requerido"),
          claveidentificaciontanque: Yup.string()
            .min(3, "La clave identificación tanque es muy corto")
            .required("La clave identificación tanque es requerido"),
          localizacionyodescripciontanque: Yup.string()
            .min(3, "La localización y/o descripción tanque es muy corto")
            .required("La localización y/o descripción tanque es requerido"),
          vigenciacalibraciontanque: Yup.date()
            .required("Vigencia calibración tanque"),
          valornumericocapacidadtotaltanque: Yup.number()
            .required("El valor numerico de capacidad total tanque es requerido"),
          valornumericocapacidadoperativatanque: Yup.number()
            .required("El valor numerico de capacidad operativa tanque"),
          valornumericocapacidadutiltanque: Yup.number()
            .required("El valor numerico de capacidad util tanque es requerido"),
          valornumericocapacidadfondajetanque: Yup.number()
            .required("El valor numerico de capacidad fondaje tanque es requerido"),
          valornumericovolumenminimooperacion: Yup.number()
            .required("El valor numerico de volumen minimo operación  es requerido"),
          estadotanque: Yup.string()
            .required("El estado tanque es requerido"),
          sistemamediciontanque: Yup.string()
            .min(3, "El sistema medición tanque es muy corto")
            .required("El sistema medición tanque  es requerido"),
          localizodescripsistmediciontanque: Yup.string()
            .min(3, "La localiz o descripción sist medicion tanque es muy corto")
            .required("La localiz o descripción sist medicion tanque es requerido"),
          vigenciacalibracionsistmediciontanque: Yup.date()
            .required("Vigencia calibración tanque"),
          incertidumbremedicionsistmediciontanque: Yup.number()
            .required("La incertidumbre medición sist medición tanque es requerido"),           
        })}
        onSubmit={(values, actions) => {
          /*const scriptURL = "http://localhost:3001/api/v1/users/";
          const user_id = localStorage.getItem('user_id');
          const firstname = values.firstname;
          const lastname = values.lastname;
          const email = values.email;
          const data = {user_id,firstname, lastname, email};
          setLoading(true);*/


          //const user_id = parseInt(localStorage.getItem('user_id'));
          const scriptURL = "http://localhost:3001/api/v1/cat-permisos/";
          //delete values.id;
          //delete values.confirmPassword;
          delete values.permiso;
          delete values.active;
          const data = {...values};
          setLoading(true);
          console.log("data",data);


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
              setTextError("Tus datos de permiso fueron actualizados");
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
        }}
      >
        {({
          values ,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue
        }) => {
          return (
            <>
              <Grid item xs={2}>
              </Grid>
              <Grid item xs={10}>
                <div className={styles.center}>
                  {showAlert?(<p className={`${styles.message} ${typeOfMessage==="success"?styles.success:null} slideLeft`}><strong>Message:</strong><br />{textError}</p>):null}

                  <Form
                      name="form"
                      id="form"
                      method="post"
                      onSubmit={handleSubmit}
                      className={styles.form}
                  >
                  <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Nombre del permiso"
                      id="nombre_permiso"
                      label="Nombre del permiso"
                      name="nombre_permiso"
                      value={values.nombre_permiso}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Inventario inicial"
                      id="inventario_inicial"
                      label="Inventario inicial"
                      name="inventario_inicial"
                      value={values.inventario_inicial}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Carácter"
                      id="caracter"
                      label="Carácter"
                      name="caracter"
                      value={values.caracter}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Modalidad de permiso"
                      id="modalidadpermiso"
                      label="Modalidad de permiso"
                      name="modalidadpermiso"
                      value={values.modalidadpermiso}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />
                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Clave de instalación"
                      id="claveinstalacion"
                      label="Clave de instalación"
                      name="claveinstalacion"
                      value={values.claveinstalacion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Descripción de instalación"
                      id="descripcioninstalacion"
                      label="Descripción de instalación"
                      name="descripcioninstalacion"
                      value={values.descripcioninstalacion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />
                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Número de pozos"
                      id="numeropozos"
                      label="Número de pozos"
                      name="numeropozos"
                      value={values.numeropozos}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Número de tanques"
                      id="numerotanques"
                      label="Número de tanques"
                      name="numerotanques"
                      value={values.numerotanques}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Número ductos entrada salida"
                      id="numeroductosentradasalida"
                      label="Número ductos entrada salida"
                      name="numeroductosentradasalida"
                      value={values.numeroductosentradasalida}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Número ductos transparente distribución"
                      id="numeroductostransportedistribucion"
                      label="Número ductos transparente distribución"
                      name="numeroductostransportedistribucion"
                      value={values.numeroductostransportedistribucion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Número dispensarios"
                      id="numerodispensarios"
                      label="Número dispensarios"
                      name="numerodispensarios"
                      value={values.numerodispensarios}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Clave identificación tanque"
                      id="claveidentificaciontanque"
                      label="Clave identificación tanque"
                      name="claveidentificaciontanque"
                      value={values.claveidentificaciontanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />

                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Localización y/o descripción tanque"
                      id="localizacionyodescripciontanque"
                      label="Localización y/o descripción tanque"
                      name="localizacionyodescripciontanque"
                      value={values.localizacionyodescripciontanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        required
                        className={`InputModal Fecha`}
                        placeholder="Vigencia calibración tanque"
                        label="Vigencia calibración tanque"
                        id="vigenciacalibraciontanque"
                        name="vigenciacalibraciontanque"
                        //defaultValue={values.fecha_emision}
                        value={values.vigenciacalibraciontanque}
                        onChange={(value) => {
                          setFieldValue('vigenciacalibraciontanque', value, true);
                        }}
                      />
                    </LocalizationProvider>

                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Valor numerico de capacidad total tanque"
                      id="valornumericocapacidadtotaltanque"
                      label="Valor numerico de capacidad total tanque"
                      name="valornumericocapacidadtotaltanque"
                      value={values.numeroductostransportedistribucion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Valor numerico de capacidad operativa tanque"
                      id="valornumericocapacidadoperativatanque"
                      label="Valor numerico de capacidad operativa tanque"
                      name="valornumericocapacidadoperativatanque"
                      value={values.valornumericocapacidadoperativatanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />

                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Valor numerico de capacidad util tanque"
                      id="valornumericocapacidadutiltanque"
                      label="Valor numerico de capacidad util tanque"
                      name="valornumericocapacidadutiltanque"
                      value={values.valornumericocapacidadutiltanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />
                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Valor numerico de capacidad fondaje tanque"
                      id="valornumericocapacidadfondajetanque"
                      label="Valor numerico de capacidad fondaje tanque"
                      name="valornumericocapacidadfondajetanque"
                      value={values.valornumericocapacidadfondajetanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />

                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Valor numerico de volumen minimo operación"
                      id="valornumericovolumenminimooperacion"
                      label="Valor numerico de volumen minimo operación"
                      name="valornumericovolumenminimooperacion"
                      value={values.valornumericovolumenminimooperacion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />

                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Estado tanque"
                      id="estadotanque"
                      label="Estado tanque"
                      name="estadotanque"
                      value={values.estadotanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />

                    <TextField
                      className={`InputModal ${styles.Mr}`}
                      required
                      placeholder="Sistema medición tanque"
                      id="sistemamediciontanque"
                      label="Sistema medición tanque"
                      name="sistemamediciontanque"
                      value={values.sistemamediciontanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />

                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Localiz o descripción sist medicion tanque"
                      id="localizodescripsistmediciontanque"
                      label="Localiz o descripción sist medicion tanque"
                      name="localizodescripsistmediciontanque"
                      value={values.localizodescripsistmediciontanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        required
                        className={`InputModal Fecha ${styles.Mr}`}
                        placeholder="Vigencia calibración sist medicion tanque"
                        label="Vigencia calibración sist medicion tanque"
                        id="vigenciacalibracionsistmediciontanque"
                        name="vigenciacalibracionsistmediciontanque"
                        value={values.vigenciacalibracionsistmediciontanque}
                        //defaultValue={values.fecha_emision}
                        onChange={(value) => {
                          setFieldValue('vigenciacalibracionsistmediciontanque', value, true);
                        }}
                      />
                    </LocalizationProvider>

                    <TextField
                      className={`InputModal`}
                      required
                      placeholder="Incertidumbre medición sist medición tanque"
                      id="incertidumbremedicionsistmediciontanque"
                      label="Incertidumbre medición sist medición tanque"
                      name="incertidumbremedicionsistmediciontanque"
                      value={values.incertidumbremedicionsistmediciontanque}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      type='number'
                    />






                    {/* <label className={styles.lbl}><strong>Nombre:</strong></label>
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

                    <label className={styles.lbl}><strong>Usuario:</strong></label>
                    <TextField
                      placeholder="Usuario"
                      required
                      id="usuario"
                      name="usuario"
                      value={values.firstname}
                      size="small"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled="false"
                    />

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
                    /> */}

                    <div className={styles.errors}>
                        <p><strong>{(errors.nombre_permiso || errors.inventario_inicial || errors.caracter || errors.modalidadpermiso || errors.claveinstalacion || errors.descripcioninstalacion || errors.numeropozos || errors.numerotanques || errors.numeroductosentradasalida || errors.numeroductostransportedistribucion || errors.numerodispensarios || errors.claveidentificaciontanque || errors.localizacionyodescripciontanque || errors.vigenciacalibraciontanque || errors.valornumericocapacidadtotaltanque || errors.valornumericocapacidadoperativatanque || errors.valornumericocapacidadutiltanque || errors.valornumericocapacidadfondajetanque || errors.valornumericovolumenminimooperacion || errors.estadotanque || errors.sistemamediciontanque || errors.localizodescripsistmediciontanque || errors.vigenciacalibracionsistmediciontanque || errors.incertidumbremedicionsistmediciontanque)?`Errores:`:null}</strong></p>
                        {errors.nombre_permiso? (<p>{errors.nombre_permiso}</p>):null}
                        {errors.inventario_inicial? (<p>{errors.inventario_inicial}</p>):null}
                        {errors.caracter? (<p>{errors.caracter}</p>):null}
                        {errors.modalidadpermiso? (<p>{errors.modalidadpermiso}</p>):null}
                        {errors.claveinstalacion? (<p>{errors.claveinstalacion}</p>):null}
                        {errors.descripcioninstalacion? (<p>{errors.descripcioninstalacion}</p>):null}
                        {errors.numeropozos? (<p>{errors.numeropozos}</p>):null}
                        {errors.numerotanques? (<p>{errors.numerotanques}</p>):null}
                        {errors.numeroductosentradasalida? (<p>{errors.numeroductosentradasalida}</p>):null}
                        {errors.numeroductostransportedistribucion? (<p>{errors.numeroductostransportedistribucion}</p>):null}
                        {errors.numerodispensarios? (<p>{errors.numerodispensarios}</p>):null}
                        {errors.claveidentificaciontanque? (<p>{errors.claveidentificaciontanque}</p>):null}
                        {errors.localizacionyodescripciontanque? (<p>{errors.localizacionyodescripciontanque}</p>):null}
                        {errors.vigenciacalibraciontanque? (<p>{errors.vigenciacalibraciontanque}</p>):null}
                        {errors.valornumericocapacidadtotaltanque? (<p>{errors.valornumericocapacidadtotaltanque}</p>):null}
                        {errors.valornumericocapacidadoperativatanque? (<p>{errors.valornumericocapacidadoperativatanque}</p>):null}
                        {errors.valornumericocapacidadutiltanque? (<p>{errors.valornumericocapacidadutiltanque}</p>):null}
                        {errors.valornumericocapacidadfondajetanque? (<p>{errors.valornumericocapacidadfondajetanque}</p>):null}
                        {errors.valornumericovolumenminimooperacion? (<p>{errors.valornumericovolumenminimooperacion}</p>):null}
                        {errors.estadotanque? (<p>{errors.estadotanque}</p>):null}
                        {errors.sistemamediciontanque? (<p>{errors.sistemamediciontanque}</p>):null}
                        {errors.localizodescripsistmediciontanque? (<p>{errors.localizodescripsistmediciontanque}</p>):null}
                        {errors.vigenciacalibracionsistmediciontanque? (<p>{errors.vigenciacalibracionsistmediciontanque}</p>):null}
                        {errors.incertidumbremedicionsistmediciontanque? (<p>{errors.incertidumbremedicionsistmediciontanque}</p>):null}
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
