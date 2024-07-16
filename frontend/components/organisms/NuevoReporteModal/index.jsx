'use client';

import React from 'react';
import { useState,useEffect } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styles from './NuevoIngreso.module.css';
import Modal from '@mui/material/Modal';
import { Formik, Form } from "formik";
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import NativeSelect from '@mui/material/NativeSelect';
import * as Yup from "yup";

export default function NuevoReporteModal({ isOpen, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [initialValues, setInitialValues] = useState(({version:'1.0',rfccontribuyente:'AME050309Q32',rfcrepresentantelegal:'IAJA7201074W4', rfcproveedor:'APR9609194H4',caracter:'permisionario', modalidadpermiso:'PER45', permiso_id: 1,  claveinstalacion:'CMN-0001',descripcioninstalacion:'CMN-Comercialización',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',volumenexistenciasees:'',fechayhoraestamedicionmes:'',numeroregistro:'',usuarioresponsable:'',tipoevento:'',descripcionevento:'',fecha_inicio:'',fecha_terminacion:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [listPermisos,setListPermisos] = React.useState([]);

    const obtenerPermiso = (permiso_id) => {
      for(let j=0; j<listPermisos.length;j++)
      {
        if(parseInt(listPermisos[j].permiso_id)===parseInt(permiso_id))
          return listPermisos[j].permiso;
      }
      return "";
    }

    const descargarJSON = (dataJson) => {
      const jsonData = new Blob([JSON.stringify(dataJson)], { type: 'application/json' });
      const jsonURL = URL.createObjectURL(jsonData);
      const link = document.createElement('a');
      const fecha = new Date().toLocaleString('en-GB', {hour12: false,}).replaceAll("/","").replaceAll(",","").replaceAll(":","").replaceAll(" ","");

      link.href = jsonURL;
      link.download = `${fecha}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function data() {
      const user_id = localStorage.getItem('user_id');
      const scriptURL = "http://localhost:3001/api/v1/cat-permisos/"+user_id+"/permisos";    //setLoading(true);

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

    async function getObtenerListaDeComprasSinPermisos(fecha_inicio,fecha_terminacion) {
      const user_id = localStorage.getItem('user_id');
      const scriptURL = "http://localhost:3001/api/v1/compras/"+user_id+"/listPermisoNulosCompras/"+fecha_inicio+"/"+fecha_terminacion+""; 

      let folios = "";

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
          for(let j=0; j<data.listComprasSinPermisos.length; j++) {
            if(j===0)
              folios = "Folio(s) de compra: "+ data.listComprasSinPermisos[j].folio;
            else
              folios += "," + data.listComprasSinPermisos[j].folio;
          }

          alert(folios)

          return folios;
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

    async function getObtenerListaDeVentasSinPermisos(fecha_inicio,fecha_terminacion) {
      const user_id = localStorage.getItem('user_id');
      const scriptURL = "http://localhost:3001/api/v1/ingresos/"+user_id+"/listPermisoNulosVentas/"+fecha_inicio+"/"+fecha_terminacion; 
      let folios = "";

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
        console.log("data Ventas",data);
        if(data.message==="success") {
          for(let j=0; j<data.listIngresosSinPermisos.length; j++) {
            if(j===0)
              folios = "Folio(s) de venta: "+ data.listIngresosSinPermisos[j].folio;
            else
              folios += "," + data.listIngresosSinPermisos[j].folio;
          }

          return folios;
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
    }, []);
  return (
    <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          version: Yup.string()
            .min(3, "El folio es muy corto")
            .required("El folio es requerido"),
          rfccontribuyente: Yup.string()
            .min(10, "El Rfc del contribuyente es muy corto")
            .required("El  Rfc del contribuyente es requerido"),
          rfcrepresentantelegal: Yup.string()
            .min(10, "El Rfc del representante legal es muy corto")
            .required("El Rfc del representante legal es requerido"),
          rfcproveedor: Yup.string()
            .min(10, "El Rfc del proveedor es muy corto")
            .required("El Rfc del proveedor es requerido"),
          caracter: Yup.string()
            .min(3, "El caracter es muy corto")
            .required("El caracter es requerido"),
          modalidadpermiso: Yup.string()
            .min(3, "La modalidad permiso es muy corto")
            .required("La modalidad permiso es requerido"),
          permiso_id:Yup.number()
            .required("El permiso es requerido"),
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
          claveproducto: Yup.string()
            .min(3, "La clave producto es muy corto")
            .required("La clave producto es requerida"),
          composdepropanoengaslp: Yup.number()
            .min(1, "El compos de propano en gas lp debe tener minimo 1 digito")
            .required("El compos de propano en gas lp  es requerido"),
          composdebutanoengaslp: Yup.number()
            .min(1, "El compos de butano en gas lp debe tener minimo 1 digito")
            .required("El compos de butano en gas lp es requerido"),
          volumenexistenciasees: Yup.number()
            .required("El volumen existencias es requerido"),
          fechayhoraestamedicionmes: Yup.date()
            .required("Fecha y hora esta mediciones mes"),
          numeroregistro: Yup.number()
            .min(1, "El numero de registro debe tener minimo 1 digito")
            .required("El numero de registro  es requerido"),
          usuarioresponsable: Yup.string()
            .min(3, "El usuario responsable es muy corto")
            .required("El usuario responsable es requerido"),
          tipoevento: Yup.number()
            .min(1, "El tipo de evento debe tener minimo 1 digito")
            .required("El tipo de evento es requerido"),
          descripcionevento: Yup.string()
            .min(3, "La descripción del evento es muy corto")
            .required("La descripción del evento es requerido"),
          fecha_inicio: Yup.date()
            .required("Fecha de inicio"),
          fecha_terminacion: Yup.date()
            .required("Fecha de terminación"),
        })}
         onSubmit={async(values, actions) => {
          /*dataJson.Version=values.version;
          dataJson.RfcContribuyente=values.rfccontribuyente;
          dataJson.RfcRepresentanteLegal=values.rfcrepresentantelegal;
          dataJson.RfcProveedor=values.rfcproveedor;
          dataJson.Caracter=values.caracter;
          dataJson.ModalidadPermiso=values.modalidadpermiso;
          dataJson.NumPermiso=values.numpermiso;
          dataJson.ClaveInstalacion=values.claveinstalacion;
          dataJson.DescripcionInstalacion=values.DescripcionInstalacion;
          dataJson.NumeroPozos=values.numeropozos;
          dataJson.NumeroTanques=values.numerotanques;
          dataJson.NumeroDuctosEntradaSalida=values.numeroductosentradasalida;
          dataJson.NumeroDuctosTransporteDistribucion=values.numeroductostransportedistribucion;
          dataJson.NumeroDispensarios=values.numerodispensarios;
          dataJson.FechaYHoraReporteMes=new Date();
          dataJson.ClaveProducto=values.claveproducto;
          dataJson.ComposDePropanoEnGasLP=values.composdepropanoengaslp;
          dataJson.ComposDeButanoEnGasLP=values.composdebutanoengaslp;
          dataJson.VolumenExistenciasMes=values.volumenexistenciasees;
          dataJson.FechaYHoraEstaMedicionMes=values.fechayhoraestamedicionmes;
          dataJson.NumeroRegistro=values.numeroregistro;
          dataJson.FechaYHoraEvento=new Date();
          dataJson.UsuarioResponsable=values.usuarioresponsable;
          dataJson.TipoEvento=values.tipoevento;
          dataJson.DescripcionEvento=values.descripcionevento;
          dataJson.=values.;*/
          /*const user_id = localStorage.getItem('user_id');
          const tipo_reporte_id   = 1;
          const numpermiso =  obtenerPermiso(values.permiso_id);
          const data = {...values,user_id,tipo_reporte_id,numpermiso};
          console.log("Da",data);
          
          const foliosCompras = await getObtenerListaDeComprasSinPermisos(dayjs(values.fecha_inicio).format("YYYY-MM-DD"),dayjs(values.fecha_terminacion).format("YYYY-MM-DD"));
          const foliosVentas = await getObtenerListaDeVentasSinPermisos(dayjs(values.fecha_inicio).format("YYYY-MM-DD"),dayjs(values.fecha_terminacion).format("YYYY-MM-DD"));

          if(foliosCompras!==""&&foliosVentas!=="") {
          }
          else {
            alert("Ja");
            setTextError("No puede generar el reporte los siguiente folios no tienen permisos: "+foliosCompras+" "+foliosVentas);
            setShowAlert(true);
            setTimeout(()=>{
              setShowAlert(false);
            },6200)
          }*/

          const user_id = localStorage.getItem('user_id');
          const tipo_reporte_id  = 1;
          const scriptURL = "http://localhost:3001/api/v1/reportes";
          const numpermiso =  obtenerPermiso(values.permiso_id);
          const data = {...values,user_id,tipo_reporte_id,numpermiso};
          setLoading(true);

          //setInitialValues(({version:'',rfccontribuyente:'',rfcrepresentantelegal:'', rfcproveedor:'',caracter:'', modalidadpermiso:'', numpermiso:'',  claveinstalacion:'',descripcioninstalacion:'',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'',composdepropanoengaslp:'',composdebutanoengaslp:'',volumenexistenciasees:'',fechayhoraestamedicionmes:'',numeroregistro:'',usuarioresponsable:'',tipoevento:'',descripcionevento:'',fecha_inicio:'',fecha_terminacion:''}));
          console.log("v",data);

          fetch(scriptURL, {
            method: 'POST',
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
              console.log("dataRe",data);
              descargarJSON(data.dataJson);

              setTypeOfMessage("success");
              setTextError("Los datos del reporte fueron guardados");
              setInitialValues(({version:'1.0',rfccontribuyente:'AME050309Q32',rfcrepresentantelegal:'IAJA7201074W4', rfcproveedor:'APR9609194H4',caracter:'permisionario', modalidadpermiso:'PER45', permiso_id: 1,  claveinstalacion:'CMN-0001',descripcioninstalacion:'CMN-Comercialización',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',volumenexistenciasees:'',fechayhoraestamedicionmes:'',numeroregistro:'',usuarioresponsable:'',tipoevento:'',descripcionevento:'',fecha_inicio:'',fecha_terminacion:''}));
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
                  title="Nuevo reporte"
              >
                <Form id="formNewReport" className={styles.form} onSubmit={handleSubmit}>
                  <h2 className={styles.Title}>Nuevo reporte</h2>
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    placeholder="Versión"
                    required
                    id="version"
                    label="Versión"
                    name="version"
                    value={values.version}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal`}
                    placeholder="Rfc contribuyente"
                    required
                    id="rfccontribuyente"
                    label="Rfc contribuyente"
                    name="rfccontribuyente"
                    value={values.rfccontribuyente}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    placeholder="Rfc de representante legal"
                    required
                    id="rfcrepresentantelegal"
                    label="Rfc de representante legal"
                    name="rfcrepresentantelegal"
                    value={values.rfcrepresentantelegal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  <TextField
                    className={`InputModal`}
                    placeholder="Rfc de proveedor"
                    required
                    id="rfcproveedor"
                    label="Rfc de proveedor"
                    name="rfcproveedor"
                    value={values.rfcproveedor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
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
                  <NativeSelect
                    className={`Fecha ${styles.select2}`}
                    required
                    value={values.permiso_id}
                    onChange={handleChange}
                    defaultValue={0}
                    inputProps={{
                      id:"permiso_id",
                      name:"permiso_id"
                    }}
                  >
                    <option aria-label="None" value="">Número de permiso *</option>
                    {listPermisos.map((permiso) => {
                      return (
                        <option value={permiso.permiso_id}>{permiso.permiso}</option>
                      );
                    })}
                  </NativeSelect>


                <TextField
                    className={`InputModal`}
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
                    className={`InputModal ${styles.Mr}`}
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
                    className={`InputModal`}
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
                    className={`InputModal ${styles.Mr}`}
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
                    className={`InputModal`}
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
                    className={`InputModal ${styles.Mr}`}
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
                    className={`InputModal`}
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
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Clave producto"
                    id="claveproducto"
                    label="Clave producto"
                    name="claveproducto"
                    value={values.claveproducto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Compos de propano en gas lp"
                    id="composdepropanoengaslp"
                    label="Compos de propano en gas lp"
                    name="composdepropanoengaslp"
                    value={values.composdepropanoengaslp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Compos de butano en gas lp"
                    id="composdebutanoengaslp"
                    label="Compos de butano en gas lp"
                    name="composdebutanoengaslp"
                    value={values.composdebutanoengaslp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Volumen de existencia mensual"
                    id="volumenexistenciasees"
                    label="Volumen de existencia mensual"
                    name="volumenexistenciasees"
                    value={values.volumenexistenciasees}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                      <DateTimePicker
                        className={`AjusteFecha`}
                        placeholder="Fecha y hora de estas mediciones"
                        label="Fecha y hora de estas mediciones"
                        id="fechayhoraestamedicionmes"
                        name="fechayhoraestamedicionmes"
                        //defaultValue={values.fecha_emision}
                        onChange={(value) => {
                          setFieldValue('fechayhoraestamedicionmes', value, true);
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>

                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Número de registro"
                    id="numeroregistro"
                    label="Número de registro"
                    name="numeroregistro"
                    value={values.numeroregistro}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    type='number'
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Usuario responsable"
                    id="usuarioresponsable"
                    label="Usuario responsable"
                    name="usuarioresponsable"
                    value={values.usuarioresponsable}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal`}
                    required
                    placeholder="Tipo evento"
                    id="tipoevento"
                    label="Tipo evento"
                    name="tipoevento"
                    value={values.tipoevento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />
                  <TextField
                    className={`InputModal ${styles.Mr}`}
                    required
                    placeholder="Descripción de evento"
                    id="descripcionevento"
                    label="Descripción de evento"
                    name="descripcionevento"
                    value={values.descripcionevento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      required
                      className={`InputModal Fecha`}
                      placeholder="Fecha inicio reporte"
                      label="Fecha inicio reporte"
                      id="fecha_inicio"
                      name="fecha_inicio"
                      //defaultValue={values.fecha_emision}
                      onChange={(value) => {
                        setFieldValue('fecha_inicio', value, true);
                      }}
                    />
                  </LocalizationProvider>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      required
                      className={`InputModal Fecha ${styles.Mr}`}
                      placeholder="Fecha terminación reporte"
                      label="Fecha terminación reporte"
                      id="fecha_terminacion"
                      name="fecha_terminacion"
                      //defaultValue={values.fecha_emision}
                      onChange={(value) => {
                        setFieldValue('fecha_terminacion', value, true);
                      }}
                    />
                  </LocalizationProvider>


                  {(errors.version || errors.rfccontribuyente || errors.rfcrepresentantelegal || errors.rfcproveedor || errors.caracter || errors.modalidadpermiso || errors.permiso_id || errors.claveinstalacion|| errors.descripcioninstalacion|| errors.numeropozos|| errors.numerotanques|| errors.numeroductosentradasalida|| errors.numeroductostransportedistribucion|| errors.numerodispensarios|| errors.claveproducto|| errors.composdepropanoengaslp || errors.composdebutanoengaslp || errors.volumenexistenciasees || errors.fechayhoraestamedicionmes || errors.numeroregistro || errors.usuarioresponsable || errors.tipoevento || errors.descripcionevento || errors.fecha_inicio || errors.fecha_terminacion)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
                        {errors.version? (<p>{errors.version}</p>):null}
                        {errors.rfccontribuyente? (<p>{errors.rfccontribuyente}</p>):null}
                        {errors.rfcrepresentantelegal? (<p>{errors.rfcrepresentantelegal}</p>):null}
                        {errors.rfcproveedor? (<p>{errors.rfcproveedor}</p>):null}
                        {errors.caracter? (<p>{errors.caracter}</p>):null}
                        {errors.modalidadpermiso? (<p>{errors.modalidadpermiso}</p>):null}
                        {errors.permiso_id? (<p>{errors.permiso_id}</p>):null}
                        {errors.claveinstalacion? (<p>{errors.claveinstalacion}</p>):null}
                        {errors.descripcioninstalacion? (<p>{errors.descripcioninstalacion}</p>):null}
                        {errors.numeropozos? (<p>{errors.numeropozos}</p>):null}
                        {errors.numerotanques? (<p>{errors.numerotanques}</p>):null}
                        {errors.numeroductosentradasalida? (<p>{errors.numeroductosentradasalida}</p>):null}
                        {errors.numeroductostransportedistribucion? (<p>{errors.numeroductostransportedistribucion}</p>):null}
                        {errors.numerodispensarios? (<p>{errors.numerodispensarios}</p>):null}
                        {errors.claveproducto? (<p>{errors.claveproducto}</p>):null}
                        {errors.composdepropanoengaslp? (<p>{errors.composdepropanoengaslp}</p>):null}
                        {errors.composdebutanoengaslp? (<p>{errors.composdebutanoengaslp}</p>):null}
                        {errors.volumenexistenciasees? (<p>{errors.volumenexistenciasees}</p>):null}
                        {errors.fechayhoraestamedicionmes? (<p>{errors.fechayhoraestamedicionmes}</p>):null}
                        {errors.numeroregistro? (<p>{errors.numeroregistro}</p>):null}
                        {errors.usuarioresponsable? (<p>{errors.usuarioresponsable}</p>):null}
                        {errors.tipoevento? (<p>{errors.tipoevento}</p>):null}
                        {errors.descripcionevento? (<p>{errors.descripcionevento}</p>):null}
                        {errors.fecha_inicio? (<p>{errors.fecha_inicio}</p>):null}
                        {errors.fecha_terminacion? (<p>{errors.fecha_terminacion}</p>):null}
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
