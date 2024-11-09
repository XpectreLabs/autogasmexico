'use client';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './clientes.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import NuevoClienteModal from '@/components/organisms/NuevoClienteModal';
import EditarClienteModal from '@/components/organisms/EditarClienteModal';

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


export default function Clientes() {
  const router = useRouter();
  const [clientes, setClientes ] = useState([]);
  const [clientesAux, setClientesAux ] = useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");

  const [isAgregarClienteModalOpen, setIsAgregarClienteModalOpen] = useState(false);
  const [isEditClienteModalOpen, setIsEditPClienteModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState({});
  const [clienteIdd, setClienteIdd] = useState(0);
  const [typeUser,setTypeUser] = useState("1");

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://54.242.89.171:3001/api/v1/clientes/"+user_id+"/clientes";

    console.log(scriptURL);
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
        setClientes(data.listClientes);
        setClientesAux(data.listClientes);
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

  function deleteCliente(client_id) {
    const scriptURL = "http://54.242.89.171:3001/api/v1/clientes/";
    fetch(scriptURL, {
      method: 'DELETE',
      body: JSON.stringify({ client_id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(dataL) {
      if(dataL.message==="success") {
        setTextError("El cliente fue eliminado");
        setShowAlert(true);
        data();
      }
      else if(dataL.message==="schema") {
        setTextError(data.error);
        setShowAlert(true);
      }
      else {
        setTextError(dataL.message);
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

  const columns = typeUser==="1"?[
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1.2,
    },
    {
      field: 'rfc',
      headerName: 'RFC',
      flex: 1.2,
    },
    {
      field: 'direccion',
      headerName: 'Código postal',
      flex: 1.2,
    },
    {
      field: 'tipo_situacion_fiscal',
      headerName: 'Tipo de situación fiscal',
      type: 'tel',
      flex: 1.5,
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
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
            setClienteIdd(params.row.client_id);
            setClienteToEdit(params.row);
            setIsEditPClienteModalOpen(true);
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
            if(confirm("¿Desea borrar este cliente?"))
              deleteCliente(params.row.client_id);
          }}
        />
      ),
    },
  ]:[
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1.2,
    },
    {
      field: 'rfc',
      headerName: 'RFC',
      flex: 1.2,
    },
    {
      field: 'direccion',
      headerName: 'Código postal',
      flex: 1.2,
    },
    {
      field: 'tipo_situacion_fiscal',
      headerName: 'Tipo de situación fiscal',
      type: 'tel',
      flex: 1.5,
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
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
    setTypeUser(localStorage.getItem('type_user'));
  }, []);
  return (
    <main
      className={styles.main}
    >
      <Navbar activeMain="1" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px"}}><strong>Lista de clientes</strong></p>
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
                      if(clientesAux.length>0) {
                        let listResult = [];
                        for(let j=0;j<clientesAux.length;j++) {
                          let busqueda = (clientesAux[j].name + " " + clientesAux[j].rfc + " " + clientesAux[j].phone + " " + clientesAux[j].email).toLowerCase();
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(clientesAux[j]);
                        }
                        setClientes(listResult);
                      }
                     }}
                  />
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item xs={5} align="right">
                {typeUser==="1"?(
                  <Button
                    variant="outlined"
                    className={styles.agregarProveedorButton}
                    onClick={() => {
                      setIsAgregarClienteModalOpen(true);
                    }}
                  >
                    <span>+</span> Agregar cliente
                  </Button>
                ):null}
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <DataGrid
        rows={clientes.map((cliente) => ({
          id: cliente.client_id,
          client_id: cliente.client_id,
          name: cliente.name,
          rfc: cliente.rfc,
          direccion: cliente.direccion,
          tipo_situacion_fiscal: cliente.tipo_situacion_fiscal,
          phone: cliente.phone?cliente.phone:"Sin teléfono",
          email: cliente.email?cliente.email:"Sin email",
        }))}
        columns={columns}
        initialState={{
          pagination: {
             paginationModel: {
              pageSize: 20,
            },
          },
        }}
        pageSizeOptions={[20]}
        disableRowSelectionOnClick
      />
      {Object.keys(clientes).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}


      <div className={styles.ContentLoadding}>
        <CircularProgress  className={loading?'Loading show':'Loading'}/>
      </div>

      <div>
      <NuevoClienteModal
        isOpen={isAgregarClienteModalOpen}
        onClose={() => {
          setIsAgregarClienteModalOpen(false);
          data();
        }}
      />

      <EditarClienteModal
        clienteIdd={clienteIdd}
        clienteData={clienteToEdit}
        isOpen={isEditClienteModalOpen}
        onClose={() => {
          setIsEditPClienteModalOpen(false);
          data();
        }}
      />
    </div>


    </main>
  );
}
