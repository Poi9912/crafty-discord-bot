FROM node:26.8.1-alpine
LABEL org.opencontainers.description="A Discord bot for your Crafty Managed Minecraft server"
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-fund --silent
COPY --chown=node:node . .
ENV DOTENV_DEBUG=false
CMD ["npm", "run","start"]