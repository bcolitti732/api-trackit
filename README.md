# EA-Node

## Instalar dependencias

Swagger
```
npm i swagger jsdoc
npm i swagger-ui-express
```
Express
```
npm i express
npm i @types/express -D
```
Mongoose
```
npm i mongoose
npm i @types/mongoose -D
```
Nodemon
```
npm i nodemon
```

## Ejecutar sin necesidad de pasar por JS
```
npm install ts-node --save-dev
```

## Mínim 2
Cambios realizados:
Añadida la funcionalidad para gestionar la deliveryQueue de los usuarios.
Nuevas rutas:
GET /api/users/:name/delivery-queue: Obtiene la cola de reparto.
PUT /api/users/:name/delivery-queue: Actualiza la cola de reparto.
Actualizado el modelo User con la propiedad deliveryQueue como un arreglo de ObjectId.
Documentación de las nuevas rutas añadida en Swagger.