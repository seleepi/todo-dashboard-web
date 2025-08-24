FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Create app directory
WORKDIR /pb

# Download PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip /tmp/pocketbase.zip

# Extract PocketBase
RUN cd /tmp && \
    unzip pocketbase.zip && \
    chmod +x pocketbase && \
    mv pocketbase /pb/

# Copy migrations if they exist
COPY pb_migrations/ ./pb_migrations/ 2>/dev/null || true

# Expose port
EXPOSE 8080

# Run PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]