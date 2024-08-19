'use client';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './compras.module.css';
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
import NuevaCompraModal from '@/components/organisms/NuevaCompraModal';
import EditarCompraModal from '@/components/organisms/EditarCompraModal';
import EditarPermisoModal from '@/components/organisms/EditarPermisoModal'
import DetalleCompraModal from '@/components/organisms/DetalleCompraModal';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SettingsIcon from '@mui/icons-material/Settings';
import {es} from 'date-fns/locale'
import { esES } from '@mui/material/locale';
import axios from 'axios';



const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


export default function Compras() {
  const router = useRouter();
  const [compras, setCompras ] = useState([]);
  const [comprasAux, setComprasAux ] = useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [isAgregarCompraModalOpen, setIsAgregarCompraModalOpen] = useState(false);
  const [isEditCompraModalOpen, setIsEditPCompraModalOpen] = useState(false);
  const [compraToEdit, setCompraToEdit] = useState({});
  const [compraIdd, setCompraIdd] = useState(0);


  const [isSettingCompraModalOpen, setIsSettingPCompraModalOpen] = useState(false);
  const [compraToSetting, setCompraToSetting] = useState({});


  const [litrosTotales, setLitrosTotales] = useState(0);
  const [densidadTotales, setDensidadTotales] = useState(0);
  const [totalTotales, setTotalTotales] = useState(0);

  const [isDetalleCompraModalOpen, setIsDetallePCompraModalOpen] = useState(false);
  const [compraToDetalle, setCompraToDetalle] = useState({});

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  let meses = [31,28,31,30,31,30,31,31,30,31,30,31];

  function data(compras) {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://localhost:3001/api/v1/compras/"+user_id+"/compras";

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
        setCompras(data.listCompras);
        setComprasAux(data.listCompras);

        cargarTotales(data.listCompras);
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

  function deleteCompra(abastecimiento_id) {
    const scriptURL = "http://localhost:3001/api/v1/compras/";
    fetch(scriptURL, {
      method: 'DELETE',
      body: JSON.stringify({ abastecimiento_id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(dataL) {
      if(dataL.message==="success") {
        setTextError("La compra fue eliminada");
        setShowAlert(true);
        data(compras);
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


  const cargarTotales = (compras) => {
    let litrosT = 0;
    let total = 0;
    let densidadT = 0;

    console.log("c",compras)

    for(let w=0; w<compras.length;w++) {
      litrosT += compras[w].cantidad;
      densidadT += parseInt(compras[w].cantidad*compras[w].densidad)
      total += compras[w].preciovent;
    }
    setLitrosTotales(litrosT);
    setTotalTotales(total);
    setDensidadTotales(densidadT);
  }

  useEffect(() => {
    loadingData===false?data(compras):null;
  }, []);


  const columns = [
    {
      field: 'folio',
      headerName: 'Folio',
      flex: 0.8,
    },
    // },
    // {
    //   field: 'concepto',
    //   headerName: 'Concepto',
    //   sortable: false,
    //   flex: 2.2,
    // },
    {
      field: 'proveedor',
      headerName: 'Proveedor',
      sortable: false,
      flex: 1.8,
    },
    {
      field: 'permiso',
      headerName: 'Permiso proveedor',
      sortable: false,
      flex: 1.8,
    },
    {
      field: 'permisoComprador',
      headerName: 'Permiso comprador',
      sortable: false,
      flex: 1.8,
    },
    {
      field: 'cantidad',
      headerName: 'Litros',
      sortable: false,
      flex: 0.7,
    },
    {
      field: 'kilos',
      headerName: 'Kilos',
      sortable: false,
      flex: 1,
    },
    // },
    // {
    //   field: 'preciounitario2',
    //   headerName: 'Precio unitario',
    //   sortable: false,
    //   flex: 1,
    // },
    {
      field: 'preciovent2',
      headerName: 'Total',
      sortable: false,
      flex: 1,
    },
    {
      field: 'fecha_emision2',
      headerName: 'Fecha de emisión',
      flex: 1,
    },
    {
      field: 'settings',
      headerName: '',
      sortable: false,
      flex: 0.1,
      renderCell: (params) => (
        <SettingsIcon
          className={styles.btnAccion}
          onClick={() => {
            setCompraIdd(params.row.abastecimiento_id);
            setCompraToSetting(params.row);
            setIsSettingPCompraModalOpen(true);
          }}
        />
      ),
    },
    {
      field: 'edit',
      headerName: '',
      sortable: false,
      flex: 0.1,
      renderCell: (params) => (
        <CreateIcon
          className={styles.btnAccion}
          onClick={() => {
            setCompraIdd(params.row.abastecimiento_id);
            setCompraToEdit(params.row);
            setIsEditPCompraModalOpen(true);
          }}
        />
      ),
    },
    {
      field: 'view',
      headerName: '',
      sortable: false,
      flex: 0.1,
      renderCell: (params) => (
        <VisibilityIcon
          className={styles.btnAccion}
          onClick={() => {
            setCompraIdd(params.row.abastecimiento_id);
            setCompraToDetalle(params.row);
            setIsDetallePCompraModalOpen(true);
          }}
        />
      ),
    },
    {
      field: 'delete',
      headerName: '',
      sortable: false,
      flex: 0.1,
      renderCell: (params) => (
        <DeleteIcon
          className={styles.btnAccion}
          onClick={() => {
            if(confirm("¿Desea borrar esta compra?"))
              deleteCompra(params.row.abastecimiento_id);
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

  const formatter2 = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    currency: "USD"
  })

  const changedateformat = (date) => {
    return (""+date).slice(6,10)+"-"+(""+date).slice(3,5)+"-"+(""+date).slice(0,2);
  };

  const convertDate = (date) => {
    return Date.parse(changedateformat(date));
  };

  const onChangeDate = (item) => {
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

        setTimeout(()=> {
          document.querySelector("input[name=fechaAnio]").value=""
        },1000);
      },1000)
    }
    else
    {
      setCompras(comprasAux);
      setTimeout(()=> {
        cargarTotales(comprasAux);
      },500);
    }
	};

  const onChangeDateAnio = (item) => {
    if(item!==null) {

      let anio = item.$y;
      let fechaIni = "01/01/"+anio;
      let fechaFin = "31/12/"+anio;

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

        setTimeout(()=> {
          document.querySelector("input[name=fecha_desde]").value="";
        },1000);
      },1000)
    }
    else
    {
      setCompras(comprasAux);
      setTimeout(()=> {
        cargarTotales(comprasAux);
      },500);
    }
	};

  const cambiarFechaNormal = (fecha) => {
    fecha=fecha+"";
    return (fecha).substr(8,2)+"/"+(fecha).substr(5,2)+"/"+(fecha).substr(0,4);
  }

  const handleUpload = (event) => {
    //event.preventDefault();
    const user_id = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('file', event.target.files[0]);
    formData.append('user_id',user_id);
    

    axios.post('http://localhost:3001/api/v1/compras/cargarXML', formData)
      .then((response) => {
        /*console.log(response.data);
        console.log(response.data.dataJson);
        console.log(response.data.dataJson['cfdi:Comprobante']['_attributes']['Folio'])
        console.log(response.data.dataJson['cfdi:Comprobante']._attributes.Folio)

        console.log("Si");
        console.log("Emisor:"+response.data.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc)

        console.log("Folio:"+response.data.dataJson['cfdi:Comprobante']['_attributes'].Folio)
        console.log("Fecha de emisión: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado)
        console.log("Cantidad: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad)
        console.log("Unidad de medida: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Unidad)
        console.log("Concepto: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion)
        console.log("Precio unitario: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario)
        console.log("Importe: "+response.data.dataJson['cfdi:Comprobante']['_attributes'].SubTotal)

        console.log("Iva: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Impuestos']['_attributes'].TotalImpuestosTrasladados)
        console.log("Precio ingreso: "+response.data.dataJson['cfdi:Comprobante']['_attributes'].Total)
        console.log("Cfdi: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID)
        console.log("Tipo de cfdi: Ingreso")
        console.log("Aclaración: SIN OBSERVACIONES")
        console.log("Tipo complemento: Comercializacion")


        console.log("Para proveedor nuevo:");
        console.log("Nombre: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Nombre)
        console.log("RFC: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc)
        console.log("Tipo de situación fiscal: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].RegimenFiscal)
        console.log("Permiso: null")*/

        setTextError('El XML de compras fue importado');
        setShowAlert(true);
        setTimeout(()=>{setShowAlert(false); data(compras);},3000)
      })
      .catch((error) => {
        setTextError('El XML no es de compras o el UUID ya existe');
        setShowAlert(true);
        setTimeout(()=>{setShowAlert(false);},3000)
      });
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
                <Navbar activeMain="2" />
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
              <Grid item xs={3} style={{marginTop: '15px', marginBottom: '0px'}} align="left">
              <p><strong>Litros totales:</strong> {formatter2.format(litrosTotales).replace(',','')}L</p>
              </Grid>
              <Grid item xs={6}><p><strong>Kilos totales:</strong> {densidadTotales}kg</p></Grid>
              <Grid item xs={3} align="right">
                <div>
                  <p><strong>Total en compra:</strong> {formatter.format(totalTotales)}</p>
                </div>
              </Grid>
            </Grid>
          </Item>
        </Grid>


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
                      if(comprasAux.length>0) {
                        let listResult = [];
                        for(let j=0;j<comprasAux.length;j++) {
                          console.log(comprasAux[j]);
                          const permiso = comprasAux[j].permisos?comprasAux[j].permisos.permiso:"No asignado";
                          let busqueda = (comprasAux[j].folio + " " + comprasAux[j].fecha_emision + " " + comprasAux[j].cantidad+ " "+comprasAux[j].permiso + " "+ comprasAux[j].proveedores.name+ " " + comprasAux[j].concepto + " " + comprasAux[j].preciounitario + " " + comprasAux[j].importe + " " +permiso +" "+ comprasAux[j].preciovent).toLowerCase();
                          console.log(busqueda)
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(comprasAux[j]);
                        }
                        setCompras(listResult);
                        cargarTotales(listResult);
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

              <Grid item xs={2}>
                <div className={`${styles.ItemFecha}`}>
                  <p><strong>Fecha de filtro:</strong></p>
                  <LocalizationProvider locale={es} adapterLocale={es} dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className='fechaDesde'
                      required
                      placeholder="Fecha"
                      label="Fecha"
                      id="fecha_desde"
                      name="fecha_desde"
                      DateTimeFormat={ Intl.DateTimeFormat }
                      locale='es-ES'
                      //defaultValue={values.fecha_emision}
                      onChange={onChangeDate}
                      views={['month','year']}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>

              <Grid item xs={2} style={{marginTop: '15px', marginBottom: '8px'}} align="right">
                  <div className={`${styles.ItemFecha}`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        className='fechaDesde'
                        required
                        placeholder="Año"
                        label="Año"
                        id="fechaAnio"
                        name="fechaAnio"
                        //defaultValue={values.fecha_emision}
                        onChange={onChangeDateAnio}
                        views={['year']}
                      />
                    </LocalizationProvider>
                  </div>
              </Grid>

              <Grid item xs={4} align="right">
                <form onSubmit={handleUpload} style={{display:'inline-block'}}>
                  <label htmlFor="file" className="custom-file-upload">
                    <span><strong>+</strong></span> IMPORTAR XML
                  </label>
                  <input id="file" type="file" name="file" accept='text/xml' onChange={handleUpload}/>
                </form>

                <Button
                  variant="outlined"
                  className={styles.agregarProveedorButton}
                  onClick={() => {
                    setIsAgregarCompraModalOpen(true);
                  }}
                >
                  <span>+</span> Agregar compra
                </Button>
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <DataGrid
        rows={compras.map((compra) => ({
          ...compra,
          id: compra.abastecimiento_id,
          proveedor: compra.proveedores.name,
          permisoComprador: compra.permisos?compra.permisos.permiso:"No asignado",
          kilos: formatter2.format(compra.cantidad*compra.densidad).replace(',','').replace('.00','')+"kg",
          fecha_emision2: cambiarFechaNormal(compra.fecha_emision),
          preciounitario2:formatter.format(compra.preciounitario),
          importe2: formatter.format(compra.importe),
          preciovent2:  formatter.format(compra.preciovent),
          ivaaplicado2: formatter.format(compra.ivaaplicado),
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
      {Object.keys(compras).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}


      <div className={styles.ContentLoadding}>
        <CircularProgress  className={loading?'Loading show':'Loading'}/>
      </div>

      <div>
        <NuevaCompraModal
          isOpen={isAgregarCompraModalOpen}
          onClose={() => {
            setIsAgregarCompraModalOpen(false);
            data(compras);
          }}
        />

        <EditarPermisoModal
          abastecimientoIdd={compraIdd}
          abastecimientoData={compraToSetting}
          isOpen={isSettingCompraModalOpen}
          onClose={() => {
            setIsSettingPCompraModalOpen(false);
            data(compras);
          }}
        />

        <EditarCompraModal
          abastecimientoIdd={compraIdd}
          abastecimientoData={compraToEdit}
          isOpen={isEditCompraModalOpen}
          onClose={() => {
            setIsEditPCompraModalOpen(false);
            data(compras);
          }}
        />

        <DetalleCompraModal
          abastecimientoIdd={compraIdd}
          abastecimientoData={compraToDetalle}
          isOpen={isDetalleCompraModalOpen}
          onClose={() => {
            setIsDetallePCompraModalOpen(false);
            data(compras);
          }}
        />
      </div>
  </main>
  );
}
