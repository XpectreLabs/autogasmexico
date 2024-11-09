'use client';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './proveedores.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import NuevoProveedorModal from '@/components/organisms/NuevoProveedorModal';
import EditarProveedorModal from '@/components/organisms/EditarProveedorModal';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


export default function Proveedores() {
  const router = useRouter();
  const [proveedores, setProveedores ] = useState([]);
  const [proveedoresAux, setProveedoresAux ] = useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");

  const [isAgregarProveedorModalOpen, setIsAgregarProveedorModalOpen] = useState(false);
  const [isEditProveedorModalOpen, setIsEditProveedortModalOpen] = useState(false);
  const [proveedorToEdit, setProveedorToEdit] = useState({});
  const [proveedorIdd, setProveedorIdd] = useState(0);

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://54.242.89.171:3001/api/v1/proveedores/"+user_id+"/proveedores";

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
      console.log(data);
      if(data.message==="success") {
        setLoadingData(true);
        setLoading(false);
        setProveedores(data.listProveedores);
        setProveedoresAux(data.listProveedores);
      }
      else if(data.message==="schema") {
        setTextError(data.error);
        setShowAlert(true);
        setTimeout(()=>{
          Logout();
        },3500)
      }
      else {
        setTextError(data.message);
        setShowAlert(true);
        setTimeout(()=>{
          Logout();
        },3500)
      }

      setTimeout(()=>{
        setShowAlert(false);
      },3400)
    })
    .catch(error => {
      console.log(error.message);
      console.error('Error!', error.message);
    });
  }


  function deleteProveedor(proveedor_id) {
    const scriptURL = "http://54.242.89.171:3001/api/v1/proveedores/";
    fetch(scriptURL, {
      method: 'DELETE',
      body: JSON.stringify({ proveedor_id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(dataL) {
      if(dataL.message==="success") {
        setTextError("El proveedor fue eliminado");
        setShowAlert(true);
        data();
      }
      else if(dataL.message==="schema") {
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
  }

  const columns = localStorage.getItem('type_user')==="1"?[
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 2 ,
    },
    {
      field: 'rfc',
      headerName: 'RFC',
      flex: 1.2,
    },
    {
      field: 'direccion',
      headerName: 'Dirección',
      flex: 1.2,
    },
    {
      field: 'tipo_situacion_fiscal',
      headerName: 'Tipo de situación fiscal',
      type: 'tel',
      flex: 1.5,
    },
    {
      field: 'permiso_cre',
      headerName: 'Permiso CRE',
      sortable: false,
      flex: 1.2,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: false,
      flex: 2,
    },
    {
      field: 'edit',
      headerName: '',
      sortable: false,
      flex: 0.4,
      renderCell: (params) => (
        <CreateIcon
          className={styles.btnAccion}
          onClick={() => {
            setProveedorIdd(params.row.proveedor_id)
            setProveedorToEdit(params.row);
            setIsEditProveedortModalOpen(true);
          }}
        />
      ),
    },
    {
      field: 'delete',
      headerName: '',
      sortable: false,
      flex: 0.4,
      renderCell: (params) => (
        <DeleteIcon
          className={styles.btnAccion}
          onClick={() => {
            if(confirm("¿Desea borrar este proveedor?"))
              deleteProveedor(params.row.proveedor_id);
          }}
        />
      ),
    },
  ]:[
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 2 ,
    },
    {
      field: 'rfc',
      headerName: 'RFC',
      flex: 1.2,
    },
    {
      field: 'direccion',
      headerName: 'Dirección',
      flex: 1.2,
    },
    {
      field: 'tipo_situacion_fiscal',
      headerName: 'Tipo de situación fiscal',
      type: 'tel',
      flex: 1.5,
    },
    {
      field: 'permiso_cre',
      headerName: 'Permiso CRE',
      sortable: false,
      flex: 1.2,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: false,
      flex: 2,
    }
  ];


  useEffect(() => {
    loadingData===false?data():null;
  }, []);

  return (
    <main
      className={styles.main}
    >
      <Navbar activeMain="0" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px"}}><strong>Lista de proveedores</strong></p>
            <Grid container spacing={0}>
              <Grid item xs={7} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
                <Paper
                  component="form"
                  sx={{ p: '1px 4px', display: 'flex', alignItems: 'center', width: 400, height: '40px', border: '1px solid #848484' }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Buscar"
                    inputProps={{ 'aria-label': 'Buscar' }}
                    onChange={(query) => {
                      const sear=query.target.value;
                      if(proveedoresAux.length>0) {
                        let listResult = [];
                        for(let j=0;j<proveedoresAux.length;j++) {
                          let busqueda = (proveedoresAux[j].name + " " + proveedoresAux[j].rfc + " " +  proveedoresAux[j].permiso_cre + " " + proveedoresAux[j].email).toLowerCase();
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(proveedoresAux[j]);
                        }
                        setProveedores(listResult);
                      }
                     }}
                  />
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item xs={5} align="right">
                {localStorage.getItem('type_user')==="1"?(
                  <Button
                  variant="outlined"
                  className={styles.agregarProveedorButton}
                  onClick={() => {
                    setIsAgregarProveedorModalOpen(true);
                  }}
                >
                  <span>+</span> Agregar proveedor
                </Button>
                ):null}
                
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <DataGrid
        rows={proveedores.map((proveedor) => ({
          id: proveedor.proveedor_id,
          proveedor_id: proveedor.proveedor_id,
          name: proveedor.name,
          rfc: proveedor.rfc,
          direccion: proveedor.direccion?proveedor.direccion:"Sin dirección",
          tipo_situacion_fiscal: proveedor.tipo_situacion_fiscal,
          permiso_cre: proveedor.permiso_cre?proveedor.permiso_cre:"Sin permiso",
          email: proveedor.email?proveedor.email:"Sin email",
        }))}
        columns={columns}
        initialState={{
          pagination: {
             paginationModel: {
              pageSize: 100,
            },
          },
        }}
        pageSizeOptions={[20]}
        disableRowSelectionOnClick
      />
      {Object.keys(proveedores).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}


      <div className={styles.ContentLoadding}>
        <CircularProgress  className={loading?'Loading show':'Loading'}/>
      </div>

      <div>
      <NuevoProveedorModal
        isOpen={isAgregarProveedorModalOpen}
        onClose={() => {
          setIsAgregarProveedorModalOpen(false);
          data();
        }}
      />

      <EditarProveedorModal
        proveedorIdd={proveedorIdd}
        proveedorData={proveedorToEdit}
        isOpen={isEditProveedorModalOpen}
        onClose={() => {
          setIsEditProveedortModalOpen(false);
          data();
        }}
      />
    </div>


    </main>
  );
}
