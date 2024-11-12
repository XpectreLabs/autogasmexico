'use client';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import CreateIcon from '@mui/icons-material/Create';
import NuevaBitacoraModal from '@/components/organisms/NuevaBitacoraModal';
import EditarBitacoraModal from '@/components/organisms/EditarBitacoraModal';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function PermisoTipo1(props) {
  const [isAgregarInventarioModalOpen, setisAgregarInventarioModalOpen] = useState(false);
  const [isEditInventarioModalOpen, setIsEditPInventarioModalOpen] = useState(false);
  const [inventarioToEdit, setInventarioToEdit] = useState({});
  const [inventarioIdd, setInventarioIdd] = useState(0);
  const [fecha, setFecha] = useState("");
  const [tipoBitacora,setTipoBitacora] = useState(0);

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
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
      flex: 1.5,
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
      flex: 1.5,
    },
    {
      field: 'inventarioFisico',
      headerName: 'Inventario fisico',
      sortable: false,
      flex: 1.5,
    },
    {
      field: 'diferencia',
      headerName: 'Diferencia',
      sortable: false,
      flex: 1.5,
    },
    {
      field: 'porcentajeDiferencia',
      headerName: '% de diferencia',
      sortable: false,
      flex: 1.5,
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

  //console.log("Si",props.listTipo1);
  return (
    <main
      className={styles.mainInterior}
    >
      <DataGrid
        rows={props.listTipo1.map((permiso) => ({
          ...permiso,
          inventarioInicial: formatter.format(permiso.inventarioInicial),
          compras: formatter.format(permiso.compras),
          ventas: formatter.format(permiso.ventas),
          inventarioFinal: formatter.format(permiso.inventarioFinal),
          inventarioFisico: permiso.inventarioFisico===""?"":formatter.format(permiso.inventarioFisico),
          diferencia: permiso.diferencia===""?"":formatter.format(permiso.diferencia),
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
      {Object.keys(props.listTipo1).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}

      <div>
        <NuevaBitacoraModal
          cargarDataPorPermiso={props.cargarDataPorPermiso}
          permiso_id="1"
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

        <EditarBitacoraModal
          bitacoraIdd={inventarioIdd}
          bitacoraData={inventarioToEdit}
          isOpen={isEditInventarioModalOpen}
          onClose={() => {
            props.cargarDataPorPermiso("1",props.anioC,props.mesC,props.diaC);
            setIsEditPInventarioModalOpen(false);
          }}
        />
      </div>
    </main>
  );
}
