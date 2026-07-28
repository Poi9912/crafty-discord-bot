FROM node:24-alpine
LABEL org.opencontainers.description="A Discord bot for your Crafty Managed Minecraft server"
WORKDIR /app
RUN addgroup -S dcbot && adduser -S dcbot -G dcbot
COPY package*.json ./
RUN npm ci --only=production --no-fund --silent
COPY --chown=dcbot:dcbot . .
ENV DOTENV_DEBUG=false
USER dcbot
CMD ["npm", "run","start"]