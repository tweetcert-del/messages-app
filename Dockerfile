FROM node:20-bullseye

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy the rest of the project
COPY . .

EXPOSE 8081 19000 19001 19002

ENV EXPO_TELEMETRY_DISABLED=1

CMD ["bash", "-lc", "ulimit -n 1048576 || true; ./node_modules/.bin/expo start --go --localhost --clear --port 8081"]
