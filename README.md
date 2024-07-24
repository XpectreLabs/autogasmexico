# Autogasmexico Backend

# Requerimientos

- [postgreSQL]
- [NodeJS](https://nodejs.org/es/) (v. 19 or later)
- [npm](https://www.npmjs.com/get-npm)
- [Docker](https://docs.docker.com/install/)

# Instalacion de base de datos

docker run --name autogasmexico -e POSTGRES_USER=autogasmexico -e POSTGRES_PASSWORD=test123 -e POSTGRES_DB=dbautogasmexico -p 5432:5432 -d postgres

# Para correrlo

- npm i
- npm run start

# Autogasmexico Frontend

# Para correrlo

- nvm use 19
- npm i
- npm run dev

# TODO

- Agregar log de PDFS y emails procesados

- Agregar nuevo schema que permita almacenar el XML procesado (CFDI)

  - UID de la factura
  - Tipo de factura
  - Fecha de procesamiento
  - Ultima fecha de actualización.
  - status de procesamiento

- Agregar lógica para ignorar los complementos de pago de los emails.
- Revisar la logica
