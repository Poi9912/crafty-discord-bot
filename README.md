## IMPORTANT INFO ABOUT THIS REPO
This is a mirror repo from a private git instance, issues, packages, pullrequests are not possible at this moment via github.
## About this project
The objective of this project is to have quick multi-user control of your minecraft server inside a crafty controller instance via a private self-hosted discord bot.
## Installation
The use of a docker registry to control your container images is recommended
### For local installation:
1. **Requirements:**
    - Install [Node.js](https://nodejs.org/en/download) (v24.15.0 or newer)
2. **Download or clone source code / latest release**
3. **Install dependencies:**
    - In terminal run `npm install` (for developing use `npm install --include=dev`)
4. **Create .env file:**
    - The `.env` file must contain the following variables:
        - `DISCORD_TOKEN=your_discord_bot_token`
        - `DISCORD_MINECRAFT_ADMIN_ROLE=your_discord_role_id_for_minecraft_admin`
        - `CRAFTY_URL=https://your_crafty_controller_host:port`
        - `CRAFTY_TOKEN=your_crafty_user_token` (a user different to admin with access only to your server instance is recommended)
        - `CRAFTY_MC_INSTANCE=your_crafty_server_instance_id`
5. **Start the bot:**
    - run `npm run start` (for development with nodemon use `npm run dev`)
### For docker installation:
1. **Requirements:**
    - Container runtime installed, [Docker](https://docs.docker.com/engine/install/) is recommended
    - Access to registry for container image storage, [Docker Hub](https://hub.docker.com/) is recommended
    - [Docker compose](https://docs.docker.com/compose/install/) installed
2. **Download or clone source code / latest release**
3. **Build the container image:**
    - Build and tag your image `docker build . -t registry_username/crafty-discord-bot:latest`
    - Push your container image to the registry `docker push registry_username/crafty-discord-bot:latest`
4. **Run your container:**
    - **Docker run:**
        - Use the following command replacing with your data:
          ```sh
          docker run -d \
          --name minecraft-discord-bot \
          --pull always \
          --restart unless-stopped \
          -e DISCORD_TOKEN=your_discord_bot_token \
          -e DISCORD_MINECRAFT_ADMIN_ROLE=your_discord_role_id_for_minecraft_admin \
          -e CRAFTY_URL=https://your_crafty_controller_host:port \
          -e CRAFTY_TOKEN=your_crafty_user_token \
          -e CRAFTY_MC_INSTANCE=your_crafty_server_instance_id \
          registry_username/crafty-discord-bot:latest
          ```
    - **Docker compose:**
        - Use the folowing docker compose template replacing with your data:
          ```yaml
          services:
            discord-bot:
              image: registry_username/crafty-discord-bot:latest
              container_name: minecraft-discord-bot
              pull_policy: always
              restart: unless-stopped
              environment:
                - DISCORD_TOKEN=your_discord_bot_token
                - DISCORD_MINECRAFT_ADMIN_ROLE=your_discord_role_id_for_minecraft_admin
                - CRAFTY_URL=https://your_crafty_controller_host:port
                - CRAFTY_TOKEN=your_crafty_user_token
                - CRAFTY_MC_INSTANCE=your_crafty_server_instance_id
          ```
