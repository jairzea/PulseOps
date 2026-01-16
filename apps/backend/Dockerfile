FROM node:20-alpine

# Configurar directorio de trabajo
WORKDIR /workspace

# Copiar package.json del monorepo y de los workspaces
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY packages/analysis-engine/package*.json ./packages/analysis-engine/
COPY packages/analysis-engine/tsconfig.json ./packages/analysis-engine/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/shared-types/tsconfig.json ./packages/shared-types/

# Instalar dependencias del monorepo
RUN npm install

# Copiar código fuente de los packages
COPY packages/ ./packages/

# Copiar código fuente del backend
COPY apps/backend/ ./apps/backend/

# Construir packages
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=packages/analysis-engine

# Construir backend
RUN npm run build --workspace=apps/backend

# Exponer puerto
EXPOSE 3000

# Cambiar al directorio del backend
WORKDIR /workspace/apps/backend

# Comando de inicio
CMD ["npm", "run", "start:prod"]
