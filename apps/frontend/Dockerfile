FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar para producción
RUN npm run build

# Instalar servidor estático
RUN npm install -g serve

# Exponer puerto
EXPOSE 5173

# Servir build
CMD ["serve", "-s", "dist", "-l", "5173"]
