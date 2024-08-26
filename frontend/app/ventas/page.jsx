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
import VisibilityIcon from '@mui/icons-material/Visibility';
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
import axios from 'axios';
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


export default function Ventas() {
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
  const [litrosTotales, setLitrosTotales] = useState(0);
  const [totalTotales, setTotalTotales] = useState(0);
  const [isDetalleIngresoModalOpen, setIsDetallePIngresoModalOpen] = useState(false);
  const [ingresoToDetalle, setIngresoToDetalle] = useState({});

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  let meses = [31,28,31,30,31,30,31,31,30,31,30,31]

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

        cargarTotales(data.listIngresos);
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
        setTextError("La venta fue eliminada");
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

  const cargarTotales = (ingresos) => {
    let litrosT = 0;
    let total = 0;

    for(let w=0; w<ingresos.length;w++) {
      litrosT += ingresos[w].cantidad;
      total += ingresos[w].preciovent;
    }
    setLitrosTotales(litrosT);
    setTotalTotales(total);
  }

  useEffect(() => {
    loadingData===false?data():null;
  }, []);

  const columns = [
    {
      field: 'folio',
      headerName: 'Folio',
      flex: 0.7,
    },
    {
      field: 'cliente',
      headerName: 'Cliente',
      flex: 1.5,
    },
    {
      field: 'permiso',
      headerName: 'Permiso',
      flex: 1.5,
    },
    {
      field: 'cantidad',
      headerName: 'Litros',
      sortable: false,
      flex: 0.7,
    },
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: false,
      flex: 1.5,
    },
    // {
    //   field: 'preciounitario2',
    //   headerName: 'Precio unitario',
    //   sortable: false,
    //   flex: 1,
    // },
    // },
    // {
    //   field: 'importe2',
    //   headerName: 'Importe',
    //   sortable: false,
    //   flex: 1,
    // },
    // {
    //   field: 'ivaaplicado2',
    //   headerName: 'Iva',
    //   sortable: false,
    //   flex: 1,
    // },
    {
      field: 'preciovent2',
      headerName: 'Total',
      sortable: false,
      flex: 0.8,
    },
    {
      field: 'fecha_emision2',
      headerName: 'Fecha de emisión',
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
            if(confirm("¿Desea borrar esta venta?"))
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

  const formatter2 = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    currency: "USD"
  })


  const changedateformat = (date) => {
    return (""+date).slice(6,10)+"-"+(""+date).slice(3,5)+"-"+(""+date).slice(0,2)
  };

  const convertDate = (date) => {
    //alert(changedateformat(date));
    return Date.parse(new Date(changedateformat(date)));
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
        //alert(fechaIni+"->"+fechaInicio+" ---- "+fechaFin+"->"+fechaHasta);
        let listResult = [];

        if(!isNaN(fechaInicio)&&!isNaN(fechaHasta)) {
          console.log("Aux",IngresosAux);
          for(let j=0;j<IngresosAux.length;j++) {
            const ff = IngresosAux[j].fecha_emision+"";
            //const dateEmi = convertDate(new Date((""+IngresosAux[j].fecha_emision)).toLocaleDateString('en-GB'));
            const dateEmi = convertDate(ff.substr(8,2)+"/"+ff.substr(5,2)+"/"+ff.substr(0,4));

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
      setIngresos(IngresosAux);

      setTimeout(()=> {
        cargarTotales(IngresosAux);
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
        //alert(fechaIni+"->"+fechaInicio+" ---- "+fechaFin+"->"+fechaHasta);
        let listResult = [];

        if(!isNaN(fechaInicio)&&!isNaN(fechaHasta)) {
          console.log("Aux",IngresosAux);
          for(let j=0;j<IngresosAux.length;j++) {
            const ff = IngresosAux[j].fecha_emision+"";
            //const dateEmi = convertDate(new Date((""+IngresosAux[j].fecha_emision)).toLocaleDateString('en-GB'));
            const dateEmi = convertDate(ff.substr(8,2)+"/"+ff.substr(5,2)+"/"+ff.substr(0,4));

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
      setIngresos(IngresosAux);

      setTimeout(()=> {
        cargarTotales(IngresosAux);
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

    axios.post('http://localhost:3001/api/v1/ingresos/cargarXML', formData)
      .then((response) => {
        console.log(response.data);
        console.log(response.data.dataJson);
        /*console.log(response.data.dataJson['cfdi:Comprobante']['_attributes']['Folio'])
        //console.log(response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales'])

        console.log("Ventas");
        console.log("Emisor:"+response.data.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc)

        console.log("Folio:"+response.data.dataJson['cfdi:Comprobante']['_attributes'].Folio)
        console.log("Fecha de emisión: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado)
        //console.log("Cantidad: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad)
        console.log("Unid ad de medida: UM03");
        const isArray = response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length?true:false

        //tambien
        //console.log("Concepto: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion)
        //console.log("tipo T",typeof(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']))
        //console.log("total T",response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length)

        console.log("Es array",isArray)

        let dataG ;
        //alert(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][0]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Base);
        //alert(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][0]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe);

        if(isArray) {
          let canCantidad = 0, preciounitario = 0, importe = 0, ivaaplicado = 0, precioventa = 0;
          let descripcion;

          console.log("jaja");
          const totalFilas = response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length;

          for(let j=0; j<totalFilas; j++)
          {
            const base = parseFloat(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Base);
            const iva = parseFloat(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe);

            canCantidad += parseFloat(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].Cantidad);
            descripcion = response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].Descripcion;
            preciounitario += parseFloat(response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].ValorUnitario);
            importe += base;
            ivaaplicado += iva;
            precioventa += parseFloat(base + iva)
          }
            preciounitario/=totalFilas;


          console.log("jja");

          console.log("Resultado:",{
            "cantidad": canCantidad,
            "concepto": descripcion,
            "preciounitario": Number.parseFloat(preciounitario).toFixed(2),
            "importe": Number.parseFloat(importe).toFixed(2),
            "ivaaplicado": Number.parseFloat(ivaaplicado).toFixed(2),
            "precioventa": Number.parseFloat(precioventa).toFixed(2),
          })
        }

        //console.log("Precio unitario: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario)
        //console.log("Importe: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosBaseIVA16)
        //console.log("Iva: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosImpuestoIVA16)
        //console.log("Precio ingreso: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].MontoTotalPagos)

        console.log("Cfdi: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID)
        console.log("Tipo de cfdi: Ingreso")
        console.log("Aclaración: SIN OBSERVACIONES")
        console.log("Tipo complemento: Comercializacion")

        console.log("Para cliente nuevo:");
        console.log("Nombre: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Nombre)
        console.log("RFC: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc)
        console.log("Tipo de situación fiscal: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].RegimenFiscalReceptor)
        console.log("Domicilio: "+response.data.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].DomicilioFiscalReceptor)
        console.log("Permiso: null")*/


        setTextError('El XML de ventas fue importado');
        setShowAlert(true);
        setTimeout(()=>{setShowAlert(false); data();},3000)
      })
      .catch((error) => {
        setTextError('El XML no es de ventas o el UUID ya existe');
        setShowAlert(true);
        setTimeout(()=>{setShowAlert(false); data();},3000)
      });
  };

  return (
    <main
      className={styles.main}
    >

      <Navbar activeMain="3" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <Grid container spacing={0}>
              <Grid item xs={3} style={{marginTop: '15px', marginBottom: '0px'}} align="left">
              <p><strong>Litros totales:</strong> {formatter2.format(litrosTotales).replace(',','')}L</p>
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={3} align="right">
                <div>
                  <p><strong>Total en venta:</strong> {formatter.format(totalTotales)}</p>
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
                      if(IngresosAux.length>0) {
                        let listResult = [];
                        for(let j=0;j<IngresosAux.length;j++) {
                          let permisoB =  IngresosAux[j].permisos.permiso;

                          let busqueda = (IngresosAux[j].folio + " " + permisoB +" " + IngresosAux[j].fecha_emision + " " + IngresosAux[j].cantidad+ " " + IngresosAux[j].concepto + " " +IngresosAux[j].clients.name + " " + IngresosAux[j].preciounitario + " " + IngresosAux[j].importe + " " + IngresosAux[j].preciovent).toLowerCase();
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(IngresosAux[j]);
                        }
                        setIngresos(listResult);
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className='fechaDesde'
                      required
                      placeholder="Fecha"
                      label="Fecha"
                      id="fecha_desde"
                      name="fecha_desde"
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
                    setIsAgregarIngresoModalOpen(true);
                  }}
                >
                  <span>+</span> Agregar venta
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
          fecha_emision2: cambiarFechaNormal(ingreso.fecha_emision),
          preciounitario2:formatter.format(ingreso.preciounitario),
          importe2: formatter.format(ingreso.importe),
          preciovent2:  formatter.format(ingreso.preciovent),
          ivaaplicado2: formatter.format(ingreso.ivaaplicado),
          cliente: ingreso.clients.name,
          permiso: ingreso.permisos?ingreso.permisos.permiso:'Sin permiso',
          permiso_id: ingreso.permisos?ingreso.permisos.permiso_id:0,

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
