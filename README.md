## IMPORTANT INFO ABOUT THIS REPO

This is a mirror repo from a private git instance, issues, packages, pull requests and other features are not being monitored at this moment via github.

## About this project

The objective of this project is to have quick multi-user control of your minecraft server inside a crafty controller instance via a private self-hosted discord bot.

## Installation

The use of a docker registry to control your container images is recommended.

### For local installation:

1. **Requirements:**
    - Install [Node.js](https://nodejs.org/en/download) (v24.15.0 or newer)
2. **Download or clone source code / latest release**
3. **Install dependencies:**
    - In terminal run `npm install` (for development use `npm install --include=dev`)
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

## Features

### 1. Slash commands by default
The bot uses slash commands by default registered globally, if you set the environment variable `DISCORD_GUILD_ID=your_discord_guild_id` the commands will be registered only to the specified guild.

### 2. Use of Ephemeral replies
The bot will answer the commands in [Ephemeral messages](https://support-apps.discord.com/hc/en-us/articles/26501839512855-Ephemeral-Messages-FAQ), keeping the answer private without revealing your commands or server details into the chat history.

### 3. Easy modular extension by design
New commands, controllers, handles and utilities can be added by simply declaring the files and test into the corresponding path to extend the capabilities of your bot.

### 4. Updated bot precense with player count
Every 60 seconds the bot will update the current player count in the minecraft server.

## Commands

| **Slash Command** | **Description** | **Options** | **Is Minecraft Admin Only?** |
| :-: | :- | :- | :-: |
| `announce` | send a message to all players on the Minecraft server | - `message`* | true |
| `logs` | View the last 15 lines of the server logs | (*none*) | true |
| `ping` | Replies with bit latency | (*none*) | false |
| `playing` | Check the list of players currently on the Minecraft server | (*none*) | false |
| `status` | Check the Minecraft server status | (*none*) | false |
| `whitelist` | Add/Remove/List players from the whitelist or enable/disable the whitelist | - `action`*: <br>&emsp;[`add`,`remove`,<br>&emsp;`list`,`enable`,<br>&emsp;`disable`]<br>- `player` | true |


Options with (*) are required.

Commands with `Minecraft Admin Only: true` can be used only by users with the role specified in the `DISCORD_MINECRAFT_ADMIN_ROLE` environment variable.