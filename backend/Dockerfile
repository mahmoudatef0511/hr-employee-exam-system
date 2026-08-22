# Development image for the HR Exam System backend (Node.js + Express + Sequelize).
# Uses a Debian-based "slim" image (not alpine) so that native dependencies
# such as bcrypt install from prebuilt binaries without needing extra build tools.
FROM node:20-slim

WORKDIR /app

# Copy only the manifest files first so `npm ci` is cached by Docker as long as
# dependencies don't change, even if application source code does.
COPY package*.json ./

# `npm ci` installs exactly what's in package-lock.json, including devDependencies
# (nodemon, sequelize-cli) — required since the dev command below uses nodemon.
RUN npm ci

# Copy the rest of the backend source. In development this is overridden by the
# bind mount configured in docker-compose.yml, so local edits show up immediately
# without rebuilding the image; this COPY keeps the image runnable on its own too.
COPY . .

EXPOSE 5000

# Matches the project's own "dev" script (nodemon src/server.js) — no new
# start command was introduced for Docker.
CMD ["npm", "run", "dev"]
