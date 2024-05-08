import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useRouter } from 'next/navigation';
import GroupsIcon from '@mui/icons-material/Groups';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Person2Icon from '@mui/icons-material/Person2';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

export default function Navbar({activeMain}) {
  const router = useRouter();
  const [active, setActive] = useState(parseInt(activeMain));
  return (
        <>
          <Paper sx={{ width: 120, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/proveedores" onClick={()=>{setActive(0)}}>
                <MenuItem className={active===0?"activo":null}>
                  Proveedores
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 90, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/clientes" onClick={()=>{setActive(1)}}>
                <MenuItem className={active===1?"activo":null}>
                  Clientes
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 97, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/compras" onClick={()=>{setActive(2)}}>
                <MenuItem className={active===2?"activo":null}>
                  Compras
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 95, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/ingresos" onClick={()=>{setActive(3)}}>
                <MenuItem className={active===3?"activo":null}>
                  Ingresos
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 100, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/reportes" onClick={()=>{setActive(4)}}>
                <MenuItem className={active===4?"activo":null}>
                  Reportes
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 70, maxWidth: '100%', display:"inline-block" }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/perfil" onClick={()=>{setActive(5)}}>
                <MenuItem className={active===5?"activo":null}>
                  Perfil
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>
        </>
  );
}
