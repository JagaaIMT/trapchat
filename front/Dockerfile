# Étape 1 : Build de l'application React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour servir les fichiers statiques
FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
