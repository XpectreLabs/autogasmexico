'use client';

import React, { useState,useEffect } from 'react';
import styles from './index.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import NativeSelect from '@mui/material/NativeSelect';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Seleccionar_permiso() {
  const router = useRouter();
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [permiso,setPermiso] = useState("3");
  const [listPermisos,setListPermisos] = useState([]);

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function getListPermiso() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://54.242.89.171:3001/api/v1/cat-permisos/"+user_id+"/permisos";    //setLoading(true);

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


  const onChangePermiso = (tipo) =>{
    setPermiso(tipo.target.value)
  }

  const btnSeleccionar = () =>{
    localStorage.setItem('permiso_id', permiso);
    localStorage.setItem('permiso', listPermisos[permiso-1].permiso);
    router.push("/compras");
  }
  //loadingData===false?data():null;

  useEffect(() => {
    getListPermiso();
  }, []);
  return (
    <main className={styles.main} style={{ opacity: 1 }}>
      <Navbar activeMain="12" />

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
          <p style={{color: "#327065", fontSize:"18px", paddingTop:"50px", textAlign: "center"}}><strong>Selecciona el permiso con el que deseas trabajar</strong></p>
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
                        if(permiso.permiso_id===3)
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
      <Grid item xs={2}></Grid>
      <Grid item xs={10}>
        <div className={styles.btns}>
          <input
            className={styles.btn}
            type="submit"
            value="Seleccionar"
            onClick={()=>btnSeleccionar()}
          />
        </div>
      </Grid>
        
    </main>
  );
}
