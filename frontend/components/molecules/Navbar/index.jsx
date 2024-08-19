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
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Stack from '@mui/material/Stack';
import Grow from '@mui/material/Grow';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';

export default function Navbar({activeMain}) {
  const router = useRouter();
  const [active, setActive] = useState(parseInt(activeMain));
  const anchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);


  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }


  return (
        <>
          {/* <Paper sx={{ width: 120, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
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
          </Paper> */}

          <Paper sx={{ width: 97, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/compras" onClick={()=>{setActive(2)}}>
                <MenuItem className={active===2?"activo":null}>
                  Compras
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 80, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/ventas" onClick={()=>{setActive(3)}}>
                <MenuItem className={active===3?"activo":null}>
                  Ventas
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 110, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/inventarios" onClick={()=>{setActive(7)}}>
                <MenuItem className={active===7?"activo":null}>
                  Inventarios
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 145, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/reportes" onClick={()=>{setActive(4)}}>
                <MenuItem className={active===4?"activo":null}>
                  Reportes JSON
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>


            <div style={{width: 170, maxWidth: '100%', display:"inline-block"}}>
              <Button
                style={{color: "#000", width: 170}}
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? 'composition-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                Configuraciones
              </Button>
              <Popper
                style={{background:"#ffffff", zIndex: "9",}}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === 'bottom-start' ? 'left top' : 'left bottom',
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          autoFocusItem={open}
                          id="composition-menu"
                          aria-labelledby="composition-button"
                          onKeyDown={handleListKeyDown}
                        >
                          <Link href="/proveedores" onClick={()=>{setActive(0)}}>
                            <MenuItem onClick={handleClose} className={active===0?"activo":null}>
                              Proveedores
                            </MenuItem>
                          </Link>

                          <Link href="/clientes" onClick={()=>{setActive(1)}}>
                            <MenuItem onClick={handleClose} className={active===1?"activo":null}>
                              Clientes
                            </MenuItem>
                          </Link>

                          <Link href="/perfil" onClick={()=>{setActive(5)}}>
                            <MenuItem onClick={handleClose} className={active===5?"activo":null}>
                              Perfil
                            </MenuItem>
                          </Link>

                          <Link href="/usuarios" onClick={()=>{setActive(6)}}>
                            <MenuItem onClick={handleClose} className={active===6?"activo":null}>
                              Usuarios
                            </MenuItem>
                          </Link>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </div>

          {/* <Paper sx={{ width: 70, maxWidth: '100%', display:"inline-block", marginRight:'5px' }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/perfil" onClick={()=>{setActive(5)}}>
                <MenuItem className={active===5?"activo":null}>
                  Perfil
                </MenuItem>
              </Link>
            </MenuList>
          </Paper>

          <Paper sx={{ width: 95, maxWidth: '100%', display:"inline-block" }}>
            <MenuList  className={styles.ListNav}>
              <Link href="/usuarios" onClick={()=>{setActive(6)}}>
                <MenuItem className={active===6?"activo":null}>
                  Usuarios
                </MenuItem>
              </Link>
            </MenuList>
          </Paper> */}
        </>
  );
}
