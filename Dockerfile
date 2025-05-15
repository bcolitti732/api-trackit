# Etapa 1: Compilación
FROM node:20 AS build

WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./


# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Compila el código TypeScript
RUN npm run build

# Etapa 2: Ejecución
FROM node:20

WORKDIR /usr/src/app

# Copia solo los archivos necesarios desde la etapa de compilación
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/build ./build

# Copia el archivo .env si lo necesitas dentro del contenedor
COPY .env .env

# Instala solo dependencias de producción
RUN npm install --omit=dev

EXPOSE 4000

CMD ["node", "build/app.js"]
