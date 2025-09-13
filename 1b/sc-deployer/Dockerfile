FROM bitwalker/alpine-elixir-phoenix:latest

# Install build dependencies
RUN apk add --no-cache git make g++ wget curl inotify-tools automake libtool \
    autoconf python3 postgresql-client

# Set the working directory
WORKDIR /app

# Set environment variables
ENV MIX_ENV=prod \
    LANG=C.UTF-8

# Install hex and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Install Node.js
RUN apk add --update nodejs npm

# Copy configuration files
COPY config/. ./config/

# Copy mix files
COPY mix.exs .
COPY mix.lock .

# Get dependencies
RUN mix do deps.get, deps.compile

# Copy all application files
COPY . .

# Compile the application
RUN mix do compile, phx.digest

# Create the database and run migrations
CMD mix do ecto.create, ecto.migrate, phx.server
