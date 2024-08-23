'use client';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useRouter } from 'next/navigation';
import NativeSelect from '@mui/material/NativeSelect';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PermisoTipo1 from './PermisoTipo1';
import PermisoTipo2 from './PermisoTipo2';
import PermisoTipo3 from './PermisoTipo3';
import dayjs from 'dayjs';

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
    /*
    if(item!==null) {
      let anio = item.$y;
      let mes = item.$M+1;
      let diaBisiesto = mes==2?anio%4===0?1:0:0;
      let diasMes = meses[mes-1]+diaBisiesto;
      mes = mes<10?("0"+mes):mes;
      let fechaIni = "01/"+mes+"/"+anio;
      let fechaFin = diasMes+"/"+mes+"/"+anio;

      setTimeout(()=>{
        const fechaInicio = convertDate(fechaIni);
        const fechaHasta = convertDate(fechaFin);
        let listResult = [];

        if(!isNaN(fechaInicio)&&!isNaN(fechaHasta)) {
          console.log("Aux",comprasAux);
          for(let j=0;j<comprasAux.length;j++) {
            //const dateEmi = convertDate(new Date((""+comprasAux[j].fecha_emision)).toLocaleDateString('en-GB'));
            const ff = comprasAux[j].fecha_emision+"";
            const dateEmi = convertDate(ff.substr(8,2)+"/"+ff.substr(5,2)+"/"+ff.substr(0,4));

            if(fechaInicio!==fechaHasta) {
              if(dateEmi>=fechaInicio&&dateEmi<=fechaHasta)
                listResult.push(comprasAux[j]);
            }
            else {
              if(fechaInicio===dateEmi)
                listResult.push(comprasAux[j]);
            }
          }
          setCompras(listResult);
        }
        else
          setCompras(listResult);

        setTimeout(()=> {
          cargarTotales(listResult);
        },500);
      },1000)
    }
    else
    {
      setCompras(comprasAux);
      setTimeout(()=> {
        cargarTotales(comprasAux);
      },500);
    }*/
	};


  const onChangeDateMes = (item) => {
    const permiso = document.querySelector("#permiso_id").value;
    const anio = parseInt(document.querySelector("input[name=fecha_desde]").value);

    if(item!==null) {
      const mes = parseInt(item.$M+"")+1;

      if(!isNaN(anio)) {
        SetMesC(mes);
        setTipoPermiso(permiso+"");
        SetAnioC(anio);

        const mesCC = mes<10?("0"+mes):mes;
        //let diaO = document.querySelector("input[name=fechaDia]").value;
        //diaO = diaO?diaO:"01";
        const fechaCN = dayjs(anio+"-"+mesCC+"-01");

        console.log(fechaCN);
        SetDiaC(0);
        //setFechaC(null);
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

    //console.log(item);
    //alert(item.$D+" mes -> "+mesC);

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
      <Grid container spacing={2} className={styles.BorderBottom}>
        <Grid item xs={2}>
          <Item className={styles.DeleteBorder}>
            <figure className={styles.Logo}>
              <img src="img/logo.jpg" alt="" />
            </figure>
          </Item>
        </Grid>
        <Grid item xs={10}>
          <Item className={styles.DeleteBorder}>
            <Grid container spacing={2}>
              <Grid item xs={11} align="left">
                <Navbar activeMain="7" />
              </Grid>
              <Grid item xs={1} align="right">
                <Paper sx={{ width: 320, maxWidth: '100%' }}>
                  <MenuList  className={styles.ListNav}>
                    <MenuItem className={styles.BtnLogIn}>
                      <div
                        role="button"
                        onClick={() => {
                          localStorage.setItem('user_id', "");
                          localStorage.setItem('token', "");
                          router.push('/');
                        }}
                      >
                        <ListItemIcon>
                          <PowerSettingsNewIcon fontSize="small" />
                        </ListItemIcon>
                      </div>
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px"}}><strong>Inventarios</strong></p>
            <Grid container spacing={0}>
              <Grid item xs={3}> </Grid>
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
                      {listPermisos.map((permiso) => {
                        return (
                          <option value={permiso.permiso_id} selected={permiso.permiso_id===1?true:false}>{permiso.permiso}</option>
                        );
                      })}
                    </NativeSelect>
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
