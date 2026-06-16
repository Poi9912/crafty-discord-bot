FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-fund --silent
COPY . .
ENV DOTENV_DEBUG=false
CMD ["npm", "run","start"]