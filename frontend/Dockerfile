# Development image for the HR Exam System frontend (React + Vite).
FROM node:20-slim

WORKDIR /app

# Copy manifests first so `npm ci` is cached separately from source changes.
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source. In development this is overridden by
# the bind mount in docker-compose.yml, so local edits appear immediately.
COPY . .

EXPOSE 5173

# Vite's dev server binds to localhost by default, which is unreachable from
# outside the container. --host 0.0.0.0 makes it listen on all interfaces so
# the port mapping in docker-compose.yml can actually reach it. This flag is
# passed at run time (see docker-compose.yml's "command"), not hardcoded here,
# so the existing "dev" script in package.json is left untouched.
CMD ["npm", "run", "dev"]
