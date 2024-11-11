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
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function NuevoReporteModal({ isOpen, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  //const [initialValues, setInitialValues] = useState(({rfccontribuyente:localStorage.getItem('rfccontribuyente'),rfcrepresentantelegal:localStorage.getItem('rfcrepresentantelegal'), rfcproveedor:localStorage.getItem('rfcproveedor'),caracter:'permisionario', modalidadpermiso:'PER45', permiso_id:localStorage.getItem('permiso_id'),  claveinstalacion:'CMN-0001',descripcioninstalacion:'CMN-Comercialización',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'PR12',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',fechayhoraestamedicionmes:'',usuarioresponsable:localStorage.getItem('nameUser'),tipoevento:'5',descripcionevento:'Consulta Informacion',fecha_inicio:'',fecha_terminacion:''}));
  const [initialValues, setInitialValues] = useState(({rfccontribuyente:'',rfcrepresentantelegal:'', rfcproveedor:'',caracter:'permisionario', modalidadpermiso:'PER45', permiso_id:'',  claveinstalacion:'CMN-0001',descripcioninstalacion:'CMN-Comercialización',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'PR12',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',fechayhoraestamedicionmes:'',usuarioresponsable:'',tipoevento:'5',descripcionevento:'Consulta Informacion',fecha_inicio:'',fecha_terminacion:''}));
  const [typeOfMessage, setTypeOfMessage] = React.useState("error");
  const [listPermisos,setListPermisos] = React.useState([]);
  const [fechaInicioReporte,setFechaInicioReporte] = React.useState("");
  const [fechaTerminacionReporte,setFechaTerminacionReporte] = React.useState("");
  let meses = [31,28,31,30,31,30,31,31,30,31,30,31];
  
  // Establecer encabezados para la descarga
  
    const obtenerPermiso = (permiso_id) => {
      for(let j=0; j<listPermisos.length;j++)
      {
        if(parseInt(listPermisos[j].permiso_id)===parseInt(permiso_id))
          return listPermisos[j].permiso;
      }
      return "";
    }

    const descargarJSON = async (dataJson,nombre_archivo) => {
      const zip = new JSZip();
      const archivo = nombre_archivo+".json";

      /*const jsonData = new Blob([JSON.stringify(dataJson)], { type: 'application/json;charset=utf-8' });
      const jsonURL = URL.createObjectURL(jsonData);
      const link = document.createElement('a');
      link.href = jsonURL;
      link.download = `${archivo}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);*/

      const jsonString = JSON.stringify(dataJson, null, 2);
      zip.file(archivo, jsonString);

      try {
        const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
        saveAs(content, nombre_archivo+".zip");
      } catch (err) {
        console.error("Error al generar el ZIP:", err);
      }
    }

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
          console.log("data.listPermisos",data.listPermisos);

          let {
            caracter,
            modalidadpermiso,
            claveinstalacion,
            descripcioninstalacion,
            numeropozos,
            numerotanques,
            numeroductosentradasalida,
            numeroductostransportedistribucion,
            numerodispensarios
          } = data.listPermisos[parseInt(localStorage.getItem('permiso_id'))-1];

          setInitialValues(({rfccontribuyente:localStorage.getItem('rfccontribuyente'),rfcrepresentantelegal:localStorage.getItem('rfcrepresentantelegal'), rfcproveedor:localStorage.getItem('rfcproveedor'),caracter, modalidadpermiso, permiso_id:localStorage.getItem('permiso_id'),  claveinstalacion,descripcioninstalacion,numeropozos,numerotanques,numeroductosentradasalida,numeroductostransportedistribucion,numerodispensarios,claveproducto:'PR12',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',fechayhoraestamedicionmes:'',usuarioresponsable:localStorage.getItem('nameUser'),tipoevento:'5',descripcionevento:'Consulta Informacion',fecha_inicio:'',fecha_terminacion:''}));
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
      const scriptURL = "http://44.212.165.114/:3001/api/v1/compras/"+user_id+"/listPermisoNulosCompras/"+fecha_inicio+"/"+fecha_terminacion+""; 

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

          //alert(folios)

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
      const scriptURL = "http://44.212.165.114/:3001/api/v1/ingresos/"+user_id+"/listPermisoNulosVentas/"+fecha_inicio+"/"+fecha_terminacion; 
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

    const cambioPermiso = (e) => {
      let {
        caracter,
        modalidadpermiso,
        claveinstalacion,
        descripcioninstalacion,
        numeropozos,
        numerotanques,
        numeroductosentradasalida,
        numeroductostransportedistribucion,
        numerodispensarios
      } = listPermisos[parseInt(e.target.value)-1];

      setInitialValues(({rfccontribuyente:localStorage.getItem('rfccontribuyente'),rfcrepresentantelegal:localStorage.getItem('rfcrepresentantelegal'), rfcproveedor:localStorage.getItem('rfcproveedor'),caracter, modalidadpermiso, permiso_id:localStorage.getItem('permiso_id'),  claveinstalacion,descripcioninstalacion,numeropozos,numerotanques,numeroductosentradasalida,numeroductostransportedistribucion,numerodispensarios,claveproducto:'PR12',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',fechayhoraestamedicionmes:'',usuarioresponsable:localStorage.getItem('nameUser'),tipoevento:'5',descripcionevento:'Consulta Informacion',fecha_inicio:'',fecha_terminacion:''}));
    }

    const handleChange = () => {
      
    }

    const onChangeDate = (item) => {
      if(item!==null) {
        let anio = item.$y;
        let mes = item.$M+1;
        let diaBisiesto = mes==2?anio%4===0?1:0:0;
        let diasMes = meses[mes-1]+diaBisiesto;
        mes = mes<10?("0"+mes):mes;
        let fechaIni = anio+"-"+mes+"-01";
        let fechaFin = anio+"-"+mes+"-"+diasMes;

        setFechaInicioReporte(fechaIni)
        setFechaTerminacionReporte(fechaFin);

        /*alert(fechaIni+" "+fechaFin);
        alert(new Date(fechaIni)+" "+new Date(fechaFin))
        alert(new Date(fechaFin+"T23:59:00"))*/
      }
    };

    useEffect(() => {
      data();
    }, []);
  return (
    <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
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
          /*fechayhoraestamedicionmes: Yup.date()
            .required("Fecha y hora esta mediciones mes"),*/
          usuarioresponsable: Yup.string()
            .min(3, "El usuario responsable es muy corto")
            .required("El usuario responsable es requerido"),
          tipoevento: Yup.number()
            .min(1, "El tipo de evento debe tener minimo 1 digito")
            .required("El tipo de evento es requerido"),
          descripcionevento: Yup.string()
            .min(3, "La descripción del evento es muy corto")
            .required("La descripción del evento es requerido"),
          fecha_reporte: Yup.date()
            .required("Fecha del reporte"),
          /*fecha_inicio: Yup.date()
            .required("Fecha de inicio"),
          fecha_terminacion: Yup.date()
            .required("Fecha de terminación"),*/
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
          const scriptURL = "http://44.212.165.114/:3001/api/v1/reportes";
          const numpermiso =  obtenerPermiso(values.permiso_id);
          const fechayhoraestamedicionmes = new Date(fechaTerminacionReporte+"T23:59:00");
          const fecha_inicio = new Date(fechaInicioReporte);
          const fecha_terminacion = new Date(fechaTerminacionReporte);

          const data = {...values,user_id,tipo_reporte_id,numpermiso,fechayhoraestamedicionmes,fecha_inicio,fecha_terminacion};
          setLoading(true);

          //setInitialValues(({version:'',rfccontribuyente:'',rfcrepresentantelegal:'', rfcproveedor:'',caracter:'', modalidadpermiso:'', numpermiso:'',  claveinstalacion:'',descripcioninstalacion:'',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'',composdepropanoengaslp:'',composdebutanoengaslp:'',fechayhoraestamedicionmes:'',usuarioresponsable:localStorage.getItem('nameUser'),tipoevento:'5',descripcionevento:'Consulta Informacion',fecha_inicio:'',fecha_terminacion:''}));
          console.log("data v",data);

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
              descargarJSON(data.dataJson,data.nombre_archivo);

              setTypeOfMessage("success");
              setTextError("Los datos del reporte fueron guardados");
              setInitialValues(({rfccontribuyente:localStorage.getItem('rfccontribuyente'),rfcrepresentantelegal:localStorage.getItem('rfcrepresentantelegal'), rfcproveedor:localStorage.getItem('rfcproveedor'),caracter:'permisionario', modalidadpermiso:'PER45', permiso_id:localStorage.getItem('permiso_id'),  claveinstalacion:'CMN-0001',descripcioninstalacion:'CMN-Comercialización',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'PR12',composdepropanoengaslp:'60.0',composdebutanoengaslp:'40.0',fechayhoraestamedicionmes:'',usuarioresponsable:localStorage.getItem('nameUser'),tipoevento:'5',descripcionevento:'Consulta Informacion',fecha_inicio:'',fecha_terminacion:''}));
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
                  {/* <TextField
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
                  /> */}
                  <div style={{display:"none"}}>
                    <NativeSelect
                      className={`Fecha ${styles.select2} ${styles.Mr}`}
                      required
                      value={values.permiso_id}
                      onChange={handleChange}
                      onBlur={cambioPermiso}
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
                      className={`InputModal ${styles.Mr}`}
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
                      className={`InputModal`}
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
                  {/* <TextField
                    className={`InputModal ${styles.Mr}`}
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
                  /> */}



                  {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                  </LocalizationProvider> */}



                  {/* <TextField
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
                  /> */}
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

                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        required
                        className={`InputModal Fecha ${styles.Mr}`}
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
                        className={`InputModal Fecha`}
                        placeholder="Fecha terminación reporte"
                        label="Fecha terminación reporte"
                        id="fecha_terminacion"
                        name="fecha_terminacion"
                        onChange={(value) => {
                          setFieldValue('fecha_terminacion', value, true);
                        }}
                      />
                    </LocalizationProvider> */}
                  </div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      views={['month','year']}
                      required
                      className={` Fecha`}
                      placeholder="Fecha del reporte"
                      label="Fecha del reporte"
                      id="fecha_reporte"
                      name="fecha_reporte"
                      onChange={(value) => {
                        setFieldValue('fecha_reporte', value, true);
                        onChangeDate(value)
                      }}

                      // onChange={onChangeDate}
                    />
                  </LocalizationProvider>

                  {(errors.rfccontribuyente || errors.rfcrepresentantelegal || errors.rfcproveedor || errors.caracter || errors.modalidadpermiso || errors.permiso_id || errors.claveinstalacion|| errors.descripcioninstalacion|| errors.numeropozos|| errors.numerotanques|| errors.numeroductosentradasalida|| errors.numeroductostransportedistribucion|| errors.numerodispensarios|| errors.claveproducto|| errors.composdepropanoengaslp || errors.composdebutanoengaslp ||  errors.usuarioresponsable || errors.tipoevento || errors.descripcionevento || errors.fecha_reporte)?(<div className={styles.errors}>
                        <p><strong>Errores:</strong></p>
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
                        {/* {errors.fechayhoraestamedicionmes? (<p>{errors.fechayhoraestamedicionmes}</p>):null} */}
                        {errors.usuarioresponsable? (<p>{errors.usuarioresponsable}</p>):null}
                        {errors.tipoevento? (<p>{errors.tipoevento}</p>):null}
                        {errors.descripcionevento? (<p>{errors.descripcionevento}</p>):null}
                        {errors.fecha_reporte? (<p>{errors.fecha_reporte}</p>):null}
                        {/* {errors.fecha_terminacion? (<p>{errors.fecha_terminacion}</p>):null} */}
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
