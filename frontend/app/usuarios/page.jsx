'use client';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './index.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import NuevoUsuarioModal from '@/components/organisms/NuevoUsuarioModal';
import EditarUsuarioModal from '@/components/organisms/EditarUsuarioModal';
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


export default function Usuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios ] = useState([]);
  const [usuariosAux, setUsuariosAux ] = useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");

  const [isAgregarUsuarioModalOpen, setIsAgregarUsuarioModalOpen] = useState(false);
  const [isEditUsuarioModalOpen, setIsEditUsuariotModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState({});
  const [usuarioIdd, setUsuarioIdd] = useState(0);

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://localhost:3001/api/v1/usuarios/"+user_id+"/usuarios";

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
      console.log("Usuarios",data);
      if(data.message==="success") {
        setLoadingData(true);
        setLoading(false);
        setUsuarios(data.listaUsuarios);
        setUsuariosAux(data.listaUsuarios);
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

  function deleteUsuario(userId) {
    const scriptURL = "http://localhost:3001/api/v1/usuarios/";
    fetch(scriptURL, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(dataL) {
      if(dataL.message==="success") {
        setTextError("El usuario fue eliminado");
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

  const columns = [
    {
      field: 'username',
      headerName: 'Usuario',
      flex: 2,
    },
    {
      field: 'firstname',
      headerName: 'Nombre',
      flex: 2,
    },
    {
      field: 'lastname',
      headerName: 'Apellidos',
      flex: 2,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: false,
      flex: 3,
    },
    {
      field: 'date',
      headerName: 'Fecha de alta',
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
            setUsuarioIdd(params.row.user_id)
            setUsuarioToEdit(params.row);
            setIsEditUsuariotModalOpen(true);
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
            if(confirm("¿Desea borrar este usuario?"))
              deleteUsuario(params.row.user_id+"");
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    loadingData===false?data():null;
  }, []);


  const changedateformatF = (date) => {
    const fecha = date.substr(0,10)
    console.log(fecha);
    return fecha.substr(8,2)+"/"+fecha.substr(5,2)+"/"+fecha.substr(0,4);
  };

  return (
    <main
      className={styles.main}
    >
      <Navbar activeMain="6" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px"}}><strong>Lista de usuarios</strong></p>

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
                      if(usuariosAux.length>0) {
                        let listResult = [];
                        for(let j=0;j<usuariosAux.length;j++) {
                          let busqueda = (usuariosAux[j].username + " " + usuariosAux[j].firstname + " " + usuariosAux[j].lastname+ " " + usuariosAux[j].email + " " + changedateformatF(usuariosAux[j].date)).toLowerCase();
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(usuariosAux[j]);
                        }
                        setUsuarios(listResult);
                      }
                     }}
                  />
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item xs={5} align="right">
                <Button
                  variant="outlined"
                  className={styles.agregarProveedorButton}
                  onClick={() => {
                    setIsAgregarUsuarioModalOpen(true);
                  }}
                >
                  <span>+</span> Agregar usuario
                </Button>
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <DataGrid
        rows={usuarios.map((usuario) => ({
          id: usuario.user_id,
          user_id: usuario.user_id,
          username: usuario.username,
          firstname: usuario.firstname,
          lastname: usuario.lastname,
          email: usuario.email?usuario.email:"Sin email",
          date: changedateformatF(usuario.date),
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
      {Object.keys(usuarios).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}


      <div className={styles.ContentLoadding}>
        <CircularProgress  className={loading?'Loading show':'Loading'}/>
      </div>

      <div>
      <NuevoUsuarioModal
        isOpen={isAgregarUsuarioModalOpen}
        onClose={() => {
          setIsAgregarUsuarioModalOpen(false);
          data();
        }}
      />

      <EditarUsuarioModal
        usuarioIdd={usuarioIdd}
        userData={usuarioToEdit}
        isOpen={isEditUsuarioModalOpen}
        onClose={() => {
          setIsEditUsuariotModalOpen(false);
          data();
        }}
      />
    </div>


    </main>
  );
}
