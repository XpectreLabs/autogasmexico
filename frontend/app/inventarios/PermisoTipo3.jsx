'use client';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import CreateIcon from '@mui/icons-material/Create';
import NuevaBitacoraDiariaModal from '@/components/organisms/NuevaBitacoraDiariaModal';
import EditarBitacoraDiariaModal from '@/components/organisms/EditarBitacoraDiariaModal';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function PermisoTipo3(props) {
  const [isAgregarInventarioModalOpen, setisAgregarInventarioModalOpen] = useState(false);
  const [isEditInventarioModalOpen, setIsEditPInventarioModalOpen] = useState(false);
  const [inventarioToEdit, setInventarioToEdit] = useState({});
  const [inventarioIdd, setInventarioIdd] = useState(0);
  const [fecha, setFecha] = useState("");
  const [tipoBitacora,setTipoBitacora] = useState(0);

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    currency: "USD"
  })

  const columns = [
    {
      field: 'mes',
      headerName: 'Mes',
      flex: 1.5,
    },
    {
      field: 'inventarioInicial',
      headerName: 'Inventario Inicial',
      flex: 1.8,
    },
    {
      field: 'compras',
      headerName: 'Compras',
      flex: 1.2,
    },
    {
      field: 'ventas',
      headerName: 'Ventas',
      type: 'tel',
      flex: 1.2,
    },
    {
      field: 'inventarioFinal',
      headerName: 'Inventario final',
      sortable: false,
      flex: 1.8,
    },
    {
      field: 'nota',
      headerName: 'Bitacora',
      sortable: false,
      flex: 2.4,
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
            //console.log("params",params.row.fecha);
            setFecha(params.row.fecha)
            setFecha(params.row.fecha)
            setTipoBitacora(params.row.tipo_bitacora)
            if(params.row.bitacora_inventario_id!=="") {
              setInventarioIdd(params.row.bitacora_inventario_id);
              setInventarioToEdit(params.row);
               setIsEditPInventarioModalOpen(true)
            }
            else
              setisAgregarInventarioModalOpen(true);
          }}
        />
      ),
    }
  ];

  //console.log("Si",props.listTipo3);
  return (
    <main
      className={styles.mainInterior}
    >
      <DataGrid
        rows={props.listTipo3.map((permiso) => ({
          ...permiso,
          inventarioInicial: formatter.format(parseInt(permiso.inventarioInicial)),
          compras: formatter.format(parseInt(permiso.compras)),
          ventas: formatter.format(parseInt(permiso.ventas)),
          inventarioFinal: formatter.format(parseInt(permiso.inventarioFinal)),
        }))}
        columns={columns}
        initialState={{
          pagination: {
             paginationModel: {
              pageSize: 32,
            },
          },
        }}
        pageSizeOptions={[32]}
        disableRowSelectionOnClick
      />
      {Object.keys(props.listTipo3).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}

      <div>
        <NuevaBitacoraDiariaModal
          cargarDataPorPermiso={props.cargarDataPorPermiso}
          permiso_id="3"
          anio={props.anioC}
          mes={props.mesC}
          dia={props.diaC}
          fecha_reporte={fecha}
          tipo_bitacora={tipoBitacora}
          isOpen={isAgregarInventarioModalOpen}
          onClose={() => {
            setisAgregarInventarioModalOpen(false);
          }}
        />

        <EditarBitacoraDiariaModal
          bitacoraIdd={inventarioIdd}
          bitacoraData={inventarioToEdit}
          isOpen={isEditInventarioModalOpen}
          onClose={() => {
            props.cargarDataPorPermiso("3",props.anioC,props.mesC,props.diaC);
            setIsEditPInventarioModalOpen(false);
          }}
        />
      </div>
    </main>
  );
}
