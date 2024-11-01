'use client';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import NativeSelect from '@mui/material/NativeSelect';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PermisoTipo1 from './PermisoTipo1.jsx';
import PermisoTipo2 from './PermisoTipo2.jsx';
import PermisoTipo3 from './PermisoTipo3.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Inventarios() {
  const router = useRouter();
  const [showAlert,setShowAlert] = useState(false);
  const [textError,setTextError] = useState("");
  const [listPermisos,setListPermisos] = useState([]);
  const [tipoPermiso,setTipoPermiso] = useState("1");
  const [listTipo1,setListTipo1] = useState([]);
  const [listTipo2,setListTipo2] = useState([]);
  const [listTipo3,setListTipo3] = useState([]);
  const [anioC,SetAnioC] = useState("");
  const [mesC,SetMesC] = useState(0);
  const [diaC,SetDiaC] = useState(0);
  const [fechaC,setFechaC] = useState(null);

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



  function cargarDataPorPermiso(permiso_id,anio, mesEnvio=0, diaEnvio=0) {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://localhost:3001/api/v1/inventarios/"+user_id+"/inventarios/"+permiso_id+"/"+anio+"/"+mesEnvio+"/"+diaEnvio;

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
        if(permiso_id==="1") {
          setListTipo1(data.listInventario)
        }
        else if(permiso_id==="2") {
          setListTipo2(data.listInventario)
        }
        else if(permiso_id==="3") {
          setListTipo3(data.listInventario)
        }
        //setListPermisos(data.listPermisos);
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

  const onChangePermiso = (tipo) =>{
    if(document.querySelector("input[name=fecha_desde]").value!==''){
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
    }
  }

  const onChangeDate = (item) => {
    const anio = item?item.$y:"";

    if(anio!=='')
    {
      const permiso = document.querySelector("#permiso_id").value;
      setTipoPermiso(permiso+"");
      SetAnioC(anio);
      cargarDataPorPermiso(permiso,anio,mesC,diaC);
    }
	};


  const onChangeDateMes = (item) => {
    const permiso = document.querySelector("#permiso_id").value;
    const anio = parseInt(document.querySelector("input[name=fecha_desde]").value);

    console.log("mes",item);
    if(item!==null) {
      const mes = parseInt(item.$M+"")+1;

      if(!isNaN(anio)) {
        SetMesC(mes);
        setTipoPermiso(permiso+"");
        SetAnioC(anio);

        const mesCC = mes<10?("0"+mes):mes;
        const fechaCN = dayjs(anio+"-"+mesCC+"-01");

        console.log(fechaCN);
        SetDiaC(0);
        setFechaC(fechaCN);
        cargarDataPorPermiso(permiso,anio,mes,0);
      }
      else
        alert("Debe de ingresar año");
    }
    else {
      !isNaN(anio)?cargarDataPorPermiso(permiso,anio):null;
      SetMesC(0);
    }
  };


  const onChangeDateDia = (item) => {
    const permiso = document.querySelector("#permiso_id").value;
    const anio = parseInt(document.querySelector("input[name=fecha_desde]").value);

    if(item!==null) {
      const dia = parseInt(item.$D+"");

      if(!isNaN(anio)&&mesC!==0) {
        SetDiaC(dia);
        setTipoPermiso(permiso+"");
        SetAnioC(anio);
        cargarDataPorPermiso(permiso,anio,mesC,dia);
      }
      else
        alert("Debe de ingresar año y mes");
    }
    else {
      !isNaN(anio)?cargarDataPorPermiso(permiso,anio,mesC):null;
      SetDiaC(0);

      if(mesC!==0) {
        const mesCC = mesC<10?("0"+mesC):mesC;
        const fechaCN = dayjs(anio+"-"+mesCC+"-01");
        console.log("R",fechaCN);
        setTimeout(()=> {
          setFechaC(fechaCN);
          setFechaC(fechaCN);
        },800)
      }
      else
        setFechaC(null);

    }
  };

  useEffect(() => {
    getListPermiso();
  }, []);

  return (
    <main
      className={styles.main}
    >
      <Navbar activeMain="7" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px"}}><strong>Inventarios</strong></p>
            <Grid container spacing={0}>
              <Grid item xs={2}> </Grid>

              <Grid item xs={3} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
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
                      {/* {listPermisos.map((permiso) => {
                        return (
                          <option value={permiso.permiso_id} selected={permiso.permiso_id===1?true:false}>{permiso.permiso}</option>
                        
                        );
                      })} */} 
                      <option value={localStorage.getItem('permiso_id')}>{localStorage.getItem('permiso')}</option>
                  </NativeSelect>
                </Grid>

                <Grid item xs={1}> </Grid>

                <Grid item xs={1} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
                  <div className={`${styles.ItemFecha}`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        className='fechaDesde'
                        required
                        placeholder="Año"
                        label="Año"
                        id="fecha_desde"
                        name="fecha_desde"
                        //defaultValue={values.fecha_emision}
                        onChange={onChangeDate}
                        views={['year']}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>

                <Grid item xs={1} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
                  <div className={`${styles.ItemFecha}`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        className='fechaDesde'
                        required
                        placeholder="Mes"
                        label="Mes"
                        id="fechaMes"
                        name="fechaMes"
                        //defaultValue={values.fecha_emision}
                        onChange={onChangeDateMes}
                        views={['month']}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>
                <Grid item xs={1} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
                  <div className={`${styles.ItemFecha}`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        className='fechaDesde'
                        required
                        placeholder="Dia"
                        label="Dia"
                        id="fechaDia"
                        name="fechaDia"
                        defaultValue={fechaC!=null?fechaC:null}
                        value={fechaC!=null?fechaC:null}
                        onChange={onChangeDateDia}
                        views={['day']}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      {tipoPermiso==="1"?<PermisoTipo1 cargarDataPorPermiso={cargarDataPorPermiso} listTipo1={listTipo1} anioC={anioC} mesC={mesC} diaC={diaC} />:tipoPermiso==="2"?<PermisoTipo2 cargarDataPorPermiso={cargarDataPorPermiso} listTipo2={listTipo2}  anioC={anioC} mesC={mesC} diaC={diaC} />:<PermisoTipo3  cargarDataPorPermiso={cargarDataPorPermiso} listTipo3={listTipo3}  listTipo2={listTipo2} anioC={anioC} mesC={mesC} diaC={diaC} />}

    </main>
  );
}
