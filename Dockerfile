FROM node:24-alpine
LABEL org.opencontainers.description="A Discord bot for your Crafty Managed Minecraft server"
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-fund --silent
COPY . .
ENV DOTENV_DEBUG=false
CMD ["npm", "run","start"]