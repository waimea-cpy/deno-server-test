FROM denoland/deno:2.0.0

WORKDIR /app

# USER deno

COPY . .
RUN deno cache app/main.ts
