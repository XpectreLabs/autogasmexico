'use client';

import React, { useState,useEffect } from 'react';
import styles from './index.module.css';
import Navbar from '@/components/molecules/Navbar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import Permisos from '../permisos/page';
import Perfil from '../perfil/page';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Panel_configuracion() {
  const [isInicial, setIsInicial] = useState('true');
  const router = useRouter();

  useEffect(() => {
    setIsInicial(localStorage.getItem("isInicial"));
  }, []);
  return (
    <main className={styles.main} style={{ opacity: 1 }}>
      <Navbar activeMain="8" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item className={styles.DeleteBorder}>
            <p style={{color: "#327065", fontSize:"18px", paddingTop:"10px", textAlign: "center"}}><strong>{isInicial==='true'?"Panel de configuración":"Configuración inicial"}</strong></p>
          </Item>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6} align="center">
          <Perfil />
        </Grid>

        <Grid item xs={6} align="center">
            <Permisos />
        </Grid>
      </Grid>
    </main>
  );
}
