FROM node:20-alpine

# Configurar directorio de trabajo
WORKDIR /workspace

# Copiar package.json del monorepo y de los workspaces
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/frontend/tsconfig*.json ./apps/frontend/
COPY apps/frontend/vite.config.ts ./apps/frontend/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/shared-types/tsconfig.json ./packages/shared-types/
COPY packages/analysis-engine/package*.json ./packages/analysis-engine/
COPY packages/analysis-engine/tsconfig.json ./packages/analysis-engine/

# Instalar dependencias del monorepo
RUN npm install

# Paso 1: Copiar y construir shared-types
COPY packages/shared-types/src ./packages/shared-types/src
RUN npm run build --workspace=packages/shared-types

# Paso 2: Copiar y construir analysis-engine
COPY packages/analysis-engine/src ./packages/analysis-engine/src
RUN npm run build --workspace=packages/analysis-engine

# Paso 3: Copiar código fuente del frontend
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/index.html ./apps/frontend/
COPY apps/frontend/postcss.config.js ./apps/frontend/
COPY apps/frontend/tailwind.config.js ./apps/frontend/

# Construir frontend
RUN npm run build --workspace=apps/frontend

# Instalar servidor estático
RUN npm install -g serve

# Exponer puerto
EXPOSE 5173

# Cambiar al directorio del frontend
WORKDIR /workspace/apps/frontend

# Servir build
CMD ["serve", "-s", "dist", "-l", "5173"]
