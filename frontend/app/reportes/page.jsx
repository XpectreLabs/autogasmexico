'use client';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './reportes.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import NuevoReporteModal from '@/components/organisms/NuevoReporteModal';
import EditReporteModal from '@/components/organisms/EditarReporteModal';
import DetalleReporteModal from '@/components/organisms/DetalleReporteModal';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import 'dayjs/locale/es';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
dayjs.locale('es');

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


export default function Compras() {
  const router = useRouter();
  const [reportes, setReportes ] = useState([]);
  const [reportesAux, setReportesAux ] = useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showAlert,setShowAlert] = React.useState(false);
  const [textError,setTextError] = React.useState("");
  const [isAgregarReporteModalOpen, setIsAgregarReporteModalOpen] = useState(false);
  const [isEditReporteModalOpen, setIsEditPReporteModalOpen] = useState(false);
  const [reporteoEdit, setReporteToEdit] = useState({});
  const [ReporteIdd, setIngresodd] = useState(0);
  const [isDetalleReporteModalOpen, setIsDetallePReporteModalOpen] = useState(false);
  const [reporteToDetalle, setReporteToDetalle] = useState({});
  const [reporteId, setReporteID ] = useState([]);
  const [listPermisos,setListPermisos] = React.useState([]);

  function Logout() {
    localStorage.setItem('user_id', "");
    localStorage.setItem('token', "");
    router.push('/');
  }

  let meses = [31,28,31,30,31,30,31,31,30,31,30,31];

  function data() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://54.242.89.171:3001/api/v1/reportes/"+user_id+"/reportes";

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
      console.log("data r",data);
      if(data.message==="success") {
        setLoadingData(true);
        setLoading(false);
        setReportes(data.listReportes);
        setReportesAux(data.listReportes);
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

  function listaPermisos() {
    const user_id = localStorage.getItem('user_id');
    const scriptURL = "http://54.242.89.171:3001/api/v1/cat-permisos/"+user_id+"/permisos";    //setLoading(true);

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

  function deleteReporte(reporte_id) {
    const scriptURL = "http://54.242.89.171:3001/api/v1/reportes/";
    fetch(scriptURL, {
      method: 'DELETE',
      body: JSON.stringify({ reporte_id }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': "Bearer "+localStorage.getItem('token'),
      },
    })
    .then((resp) => resp.json())
    .then(function(dataL) {
      if(dataL.message==="success") {
        setTextError("El reporte fue eliminado");
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
    const jsonString = JSON.stringify(dataJson, null, 2);
    zip.file(archivo, jsonString);

    try {
      const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      saveAs(content, nombre_archivo+".zip");
    } catch (err) {
      console.error("Error al generar el ZIP:", err);
    }
  }

  const descargarJSONReporte = (dataR)=>{
    
    console.log(dataR)
    delete dataR.id;
    delete dataR.fecha_inicio2;
    delete dataR.fecha_terminacion2;
    delete dataR.date;
    delete dataR.date2;
    delete dataR.active;
    delete dataR.volumenexistenciasees;

    const numpermiso =  obtenerPermiso(dataR.permiso_id);
    const reporte_id = dataR.reporte_id;
    const scriptURL = "http://54.242.89.171:3001/api/v1/reportes/descargarJSON";
    
    //const data = {...dataR,reporte_id,numpermiso,fechayhoraestamedicionmes,fecha_inicio,fecha_terminacion};
    const data = {...dataR,reporte_id,numpermiso};

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
      //setLoading(false);
      //setTypeOfMessage("error");

      if(data.message==="success") {
        //console.log("dataRe",data);
        descargarJSON(data.dataJson,data.nombre_archivo);

        //setTypeOfMessage("success");
        //setTextError("Los datos del reporte fueron actualizados");
        //setInitialValues(({version:'',rfccontribuyente:'',rfcrepresentantelegal:'', rfcproveedor:'',caracter:'', modalidadpermiso:'', permiso_id: 1,  claveinstalacion:'',descripcioninstalacion:'',numeropozos:'',numerotanques:'',numeroductosentradasalida:'',numeroductostransportedistribucion:'',numerodispensarios:'',claveproducto:'',composdepropanoengaslp:'',composdebutanoengaslp:'',volumenexistenciasees:'',fechayhoraestamedicionmes:'',numeroregistro:'',usuarioresponsable:'',tipoevento:'',descripcionevento:'',fecha_inicio:'',fecha_terminacion:''}));
        //setShowAlert(true);

        //setTimeout(()=>{onClose();},2000)
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
  }

  const handleUpload = (event) => {
    //event.preventDefault();
    //const user_id = localStorage.getItem('user_id');
    const formData = new FormData();
    //console.log(event.target)
    //console.log("Subida");
    //console.log(event.target.files.length);
    //console.log(event.target.files);

    for(let j=0; j<event.target.files.length;j++)
      formData.append('file', event.target.files[j]);
    
    formData.append('reporte_id',reporteId);

    axios.post('http://54.242.89.171:3001/api/v1/reportes/cargarPDF', formData)
      .then((response) => {
        setTimeout(()=>{data();},500)
      })
      .catch((error) => {
        /*setTextError('El XML no es de compras o el UUID ya existe');
        setShowAlert(true);
        setTimeout(()=>{setShowAlert(false);},3000)*/
      });
  };

  useEffect(() => {
    loadingData===false?data():null;
    listaPermisos();
  }, []);

  const columns = [
    {
      field: 'version',
      headerName: 'Versión',
      flex: 0.5,
    },
    {
      field: 'nombre_archivo_json',
      headerName: 'Reporte',
      flex: 4.5,
      renderCell: (params) => 
        <a onClick={()=>{descargarJSONReporte(params.row)}}>{params.row.nombre_archivo_json}</a>,
    },
    // {
    //   field: 'rfcproveedor',
    //   headerName: 'Rfc proveedor',
    //   sortable: false,
    //   flex: 1,
    // },
    // {
    //   field: 'claveinstalacion',
    //   headerName: 'Clave instalación',
    //   sortable: false,
    //   flex: 1,
    // },
    {
      field: 'nombre_archivo_status',
      headerName: 'Archivo de aceptación',
      sortable: false,
      flex: 2.7,
      renderCell: (params) => params.row.nombre_archivo_status?<a href={"http://54.242.89.171:3001/pdfs/"+params.row.nombre_archivo_status} target='_blank'>{params.row.nombre_archivo_status}</a>:<a onClick={()=>{setReporteID(params.row.reporte_id);document.querySelector("#file").click()}}>Subir archivo de aceptación</a>
    },
    // {
    //   field: 'usuarioresponsable',
    //   headerName: 'Usuario responsable',
    //   sortable: false,
    //   flex: 1.7,
    // },

    
    // {
    //   field: 'fecha_inicio2',
    //   headerName: 'Fecha inicio',
    //   sortable: false,
    //   flex: 0.8,
    // },
    // {
    //   field: 'fecha_terminacion2',
    //   headerName: 'Fecha termación',
    //   sortable: false,
    //   flex: 1,
    // },
    {
      field: 'date2',
      headerName: 'Fecha realización',
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
            setIngresodd(params.row.reporte_id);
            setReporteToEdit(params.row);
            setIsEditPReporteModalOpen(true);
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
            setIngresodd(params.row.reporte_id);
            setReporteToDetalle(params.row);
            setIsDetallePReporteModalOpen(true);
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
            if(confirm("¿Desea borrar este reporte?"))
              deleteReporte(params.row.reporte_id);
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

  const changedateformatF = (date) => {
    const fecha = date.substr(0,10)
    console.log(fecha);
    return fecha.substr(8,2)+"/"+fecha.substr(5,2)+"/"+fecha.substr(0,4);
  };

  const changedateformat = (date) => {
    return (""+date).slice(6,10)+"-"+(""+date).slice(3,5)+"-"+(""+date).slice(0,2)
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
          console.log("Aux",reportesAux);
          for(let j=0;j<reportesAux.length;j++) {
            const dateEmi = convertDate(new Date((""+reportesAux[j].date)).toLocaleDateString('en-GB'));

            if(fechaInicio!==fechaHasta) {
              if(dateEmi>=fechaInicio&&dateEmi<=fechaHasta)
                listResult.push(reportesAux[j]);
            }
            else {
              if(fechaInicio===dateEmi)
                listResult.push(reportesAux[j]);
            }
          }
          setReportes(listResult);
        }
        else
          setReportes(listResult);
      },1000);
    }
    {
      setReportes(reportesAux);
    }
	};

  const cambiarFechaNormal = (fecha) => {
    fecha=fecha+"";
    return (fecha).substr(8,2)+"/"+(fecha).substr(5,2)+"/"+(fecha).substr(0,4);
  }

  return (
    <main
      className={styles.main}
    >
      <Navbar activeMain="4" />

      
      
      <form onSubmit={handleUpload} style={{display:'none'}}>
        <label htmlFor="file" className="custom-file-upload">
          <span><strong>+</strong></span> IMPORTAR
        </label>
        <input id="file" type="file" name="file" accept='application/pdf' onChange={handleUpload}/>
      </form>

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
                      if(reportesAux.length>0) {
                        let listResult = [];
                        console.log("b",reportesAux);
                        for(let j=0;j<reportesAux.length;j++) {
                          let busqueda = (reportesAux[j].version + " " + reportesAux[j].rfccontribuyente + " " + reportesAux[j].rfcproveedor + " " + reportesAux[j].claveinstalacion + " " + reportesAux[j].usuarioresponsable+ " " + changedateformatF(reportesAux[j].fecha_inicio) + " " + changedateformatF(reportesAux[j].fecha_terminacion) + " " + changedateformatF(reportesAux[j].date)).toLowerCase();
                          if((""+(busqueda)).includes(sear.toLowerCase())||(sear===""))
                            listResult.push(reportesAux[j]);
                        }
                        setReportes(listResult);
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
                  <p><strong>Mes y año de filtro:</strong></p>
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

              <Grid item xs={3} align="right">
                <Button
                  variant="outlined"
                  className={styles.agregarProveedorButton}
                  onClick={() => {
                    setIsAgregarReporteModalOpen(true);
                  }}
                >
                  <span>+</span> Nuevo reporte
                </Button>
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>

      {showAlert?(<p className={`${styles.message} slideLeft`}>{textError}</p>):null}

      <DataGrid
        rows={reportes.map((reporte) => ({
          ...reporte,
          id: reporte.reporte_id,
          nombre_archivo_json: reporte.nombre_archivo_json+".zip",
          fecha_inicio2: changedateformatF(reporte.fecha_inicio),
          fecha_terminacion2: changedateformatF(reporte.fecha_terminacion),
          date2: changedateformatF(reporte.date),
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
      {Object.keys(reportes).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}

      <div className={styles.ContentLoadding}>
        <CircularProgress  className={loading?'Loading show':'Loading'}/>
      </div>

      <div>
        <NuevoReporteModal
          isOpen={isAgregarReporteModalOpen}
          onClose={() => {
            setIsAgregarReporteModalOpen(false);
            data();
          }}
        />

        <EditReporteModal
          reporteData={reporteoEdit}
          reporteIdd={ReporteIdd}
          isOpen={isEditReporteModalOpen}
          onClose={() => {
            setIsEditPReporteModalOpen(false);
            data();
          }}
        />

        <DetalleReporteModal
          reporteData={reporteToDetalle}
          isOpen={isDetalleReporteModalOpen}
          onClose={() => {
            setIsDetallePReporteModalOpen(false);
            data();
          }}
        />
      </div>
    </main>
  );
}
