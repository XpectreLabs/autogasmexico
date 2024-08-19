'use client';
import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function PermisoTipo2(props) {
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
    }
  ];

  console.log("Si",props.listTipo2);
  return (
    <main
      className={styles.mainInterior}
    >
      <DataGrid
        rows={props.listTipo2.map((permiso) => ({
          ...permiso,
          inventarioInicial: formatter.format(permiso.inventarioInicial),
          compras: formatter.format(permiso.compras),
          ventas: formatter.format(permiso.ventas),
          inventarioFinal: formatter.format(permiso.inventarioFinal),
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
      {Object.keys(props.listTipo2).length===0?<p className={styles.NoData}><strong>No hay datos todavia</strong></p>:null}
    </main>
  );
}
