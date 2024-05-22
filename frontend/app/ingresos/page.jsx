'use client';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './ingresos.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useRouter } from 'next/navigation';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import NuevoIngresoModal from '@/components/organisms/NuevoIngresoModal';
import EditarIngresoModal from '@/components/organisms/EditarIngresoModal';
import DetalleIngresoModal from '@/components/organisms/DetalleIngresoModal';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


export default function Compras() {
  const router = useRouter();
  const [ingresos, setIngresos ] = useState([]);
  const [IngresosAux, setIngresosAux ] = useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [isAgregarIngresoModalOpen, setIsAgregarIngresoModalOpen] = useState(false);
  const [isEditIngresoModalOpen, setIsEditPIngresoModalOpen] = useState(false);
  const [ingresoToEdit, setIngresoToEdit] = useState({});
  const [ingresoIdd, setIngresodd] = useState(0);
  const [isDetalleIngresoModalOpen, setIsDetallePIngresoModalOpen] = useState(false);
  const [ingresoToDetalle, setIngresoToDetalle] = useState({});

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://localhost:3001/api/v1/ingresos/"+user_id+"/ingresos";

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
      console.log("data",data);
      if(data.message==="success") {
        setLoadingData(true);
        setLoading(false);
        setIngresos(data.listIngresos);
        setIngresosAux(data.listIngresos);
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

  function deleteVenta(venta_id) {
    const scriptURL = "http://localhost:3001/api/v1/ingresos/";
    fetch(scriptURL, {
      method: 'DELETE',
      body: JSON.stringify({ venta_id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(dataL) {
      if(dataL.message==="success") {
        setTextError("El ingreso fue eliminado");
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

  useEffect(() => {
    loadingData===false?data():null;
  }, []);

  const columns = [
    {
      field: 'folio',
      headerName: 'Folio',
      flex: 1.2,
    },
    {
      field: 'fecha_emision2',
      headerName: 'Fecha de emisión',
      flex: 1,
    },
    {
      field: 'cantidad',
      headerName: 'Cantidad',
      sortable: false,
      flex: 0.7,
    },
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: false,
      flex: 2.2,
    },
    {
      field: 'preciounitario2',
      headerName: 'Precio unitario',
      sortable: false,
      flex: 1,
    },
    {
      field: 'importe2',
      headerName: 'Importe',
      sortable: false,
      flex: 1,
    },
    {
      field: 'ivaaplicado2',
      headerName: 'Iva',
      sortable: false,
      flex: 1,
    },
    {
      field: 'preciovent2',
      headerName: 'Total',
      sortable: false,
      flex: 1,
    },
    {
      field: 'edit',
      headerName: '',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => (
        <CreateIcon
          className={styles.btnAccion}
          onClick={() => {
            setIngresodd(params.row.venta_id);
            setIngresoToEdit(params.row);
            setIsEditPIngresoModalOpen(true);
          }}
        />
      ),
    },
    {
      field: 'view',
      headerName: '',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => (
        <VisibilityIcon
          className={styles.btnAccion}
          onClick={() => {
            setIngresodd(params.row.venta_id);
            setIngresoToDetalle(params.row);
            setIsDetallePIngresoModalOpen(true);
          }}
        />
      ),
    },
    {
      field: 'delete',
      headerName: '',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => (
        <DeleteIcon
          className={styles.btnAccion}
          onClick={() => {
            if(confirm("¿Desea borrar este ingreso?"))
              deleteVenta(params.row.venta_id);
          }}
        />
      ),
    },
  ];

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    minimumFractionDigits: 2,
    currency: "USD"
  })

  const changedateformat = (date) => {
    return (""+date).slice(6,10)+"-"+(""+date).slice(3,5)+"-"+(""+date).slice(0,2)
  };

  const convertDate = (date) => {
    return Date.parse(changedateformat(date));
  };

  const onChangeDate = (item) => {
    setTimeout(()=>{
      const fechaInicio = convertDate(document.querySelector(".fechaDesde input").value);
      const fechaHasta = convertDate(document.querySelector(".fechaHasta input").value);

      console.log(fechaInicio + " " +item + " " + fechaHasta);

      let listResult = [];

      if(!isNaN(fechaInicio)&&!isNaN(fechaHasta)) {
        console.log("Aux",IngresosAux);
        for(let j=0;j<IngresosAux.length;j++) {
          const dateEmi = convertDate(new Date((""+IngresosAux[j].fecha_emision)).toLocaleDateString('en-GB'));

          if(fechaInicio!==fechaHasta) {
            if(dateEmi>=fechaInicio&&dateEmi<=fechaHasta)
              listResult.push(IngresosAux[j]);
          }
          else {
            if(fechaInicio===dateEmi)
              listResult.push(IngresosAux[j]);
          }
        }
        setIngresos(listResult);
      }
      else
        setIngresos(listResult);
    },1000)
	};

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
                <Navbar activeMain="3" />
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
            <Grid container spacing={0}>
              <Grid item xs={3} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
                <Paper
                  className={styles.ItemOpcion}
                  component="form"
                  sx={{ p: '1px 4px', display: 'flex', alignItems: 'center', width: 400, height: '40px', border: '1px solid #848484' }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Buscar"
                    inputProps={{ 'aria-label': 'Buscar' }}
                    onChange={(query) => {
                      const sear=query.target.value;
                      if(IngresosAux.length>0) {
                        let listResult = [];
                        for(let j=0;j<IngresosAux.length;j++) {
                          let busqueda = (IngresosAux[j].folio + " " + IngresosAux[j].fecha_emision + " " + IngresosAux[j].cantidad+ " " + IngresosAux[j].concepto + " " + IngresosAux[j].preciounitario + " " + IngresosAux[j].importe + " " + IngresosAux[j].preciovent).toLowerCase();
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(IngresosAux[j]);
                        }
                        setIngresos(listResult);
                      }
                     }}
                  />
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Grid>

              <Grid item xs={1}>

              </Grid>

              <Grid item xs={5}>
                <div className={`${styles.ItemFecha}`}>
                  <p><strong>Desde:</strong></p>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className='fechaDesde'
                      format="DD/MM/YYYY"
                      required
                      placeholder="Fecha"
                      label="Fecha"
                      id="fecha_desde"
                      name="fecha_desde"
                      //defaultValue={values.fecha_emision}
                      onChange={onChangeDate} 
                    />
                  </LocalizationProvider>
                </div>
                <div className={`${styles.ItemFecha}`}>
                  <p><strong>Hasta:</strong></p>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    className='fechaHasta'
                      format="DD/MM/YYYY"
                      required
                      placeholder="Fecha"
                      label="Fecha"
                      id="fecha_hasta"
                      name="fecha_hasta"
                      //defaultValue={values.fecha_emision}
                      onChange={onChangeDate}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>

              <Grid item xs={3} align="right">
                <Button
                  variant="outlined"
                  className={styles.agregarProveedorButton}
                  onClick={() => {
                    setIsAgregarIngresoModalOpen(true);
                  }}
                >
                  <span>+</span> Agregar ingreso
                </Button>
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <DataGrid
        rows={ingresos.map((ingreso) => ({
          ...ingreso,
          id: ingreso.venta_id,
          fecha_emision2: new Date(ingreso.fecha_emision).toLocaleDateString('en-US'),
          preciounitario2:formatter.format(ingreso.preciounitario),
          importe2: formatter.format(ingreso.importe),
          preciovent2:  formatter.format(ingreso.preciovent),
          ivaaplicado2: formatter.format(ingreso.ivaaplicado),
          cliente: ingreso.clients.name,

          /*client_id: ingreso.client_id,
          venta_id: ingreso.venta_id,
          folio: ingreso.folio,
          fecha_emision: ingreso.fecha_emision,
          fecha_emision2: new Date(ingreso.fecha_emision).toLocaleDateString('en-US'),
          cantidad: ingreso.cantidad,
          concepto: ingreso.concepto,
          preciounitario:ingreso.preciounitario,
          preciounitario2:formatter.format(ingreso.preciounitario),
          importe: ingreso.importe,
          importe2: formatter.format(ingreso.importe),
          preciovent:  ingreso.preciovent,
          preciovent2:  formatter.format(ingreso.preciovent),
          ivaaplicado: ingreso.ivaaplicado,
          ivaaplicado2: ingreso.ivaaplicado+"%",
          tipo_modena_id: ingreso.tipo_modena_id,
          cfdi: ingreso.cfdi,
          tipoCfdi: ingreso.tipoCfdi,
          aclaracion: ingreso.aclaracion,
          tipocomplemento: ingreso.tipocomplemento,
          valornumerico: ingreso.valornumerico,
          valornumerico2: formatter.format(ingreso.valornumerico),
          unidaddemedida: ingreso.unidaddemedida,*/
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
      {Object.keys(ingresos).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}


      <div className={styles.ContentLoadding}>
        <CircularProgress  className={loading?'Loading show':'Loading'}/>
      </div>

      <div>
      <NuevoIngresoModal
        isOpen={isAgregarIngresoModalOpen}
        onClose={() => {
          setIsAgregarIngresoModalOpen(false);
          data();
        }}
      />

      <EditarIngresoModal
        ventaIdd={ingresoIdd}
        ventaData={ingresoToEdit}
        isOpen={isEditIngresoModalOpen}
        onClose={() => {
          setIsEditPIngresoModalOpen(false);
          data();
        }}
      />

      <DetalleIngresoModal
        ventaData={ingresoToDetalle}
        isOpen={isDetalleIngresoModalOpen}
        onClose={() => {
          setIsDetallePIngresoModalOpen(false);
          data();
        }}
      />
    </div>

    </main>
  );
}
