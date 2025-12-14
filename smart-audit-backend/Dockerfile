# Use Python 3.10-slim (supports ARM64)
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies FIRST
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    libpq-dev \
    libssl-dev \
    pkg-config \
    redis-tools \
    git \
    curl \
    postgresql-client \
    wget \
    build-essential \
    ca-certificates \
    gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (separate step for better error handling)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js installation
RUN node --version && npm --version

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# --- INSTALL SOLC via npm (works on ARM64) ---
RUN npm install -g solc@0.8.20

# Verify solcjs installation
RUN solcjs --version

# --- Create solc wrapper for compatibility ---
RUN mkdir -p /root/.solcx && \
    printf '#!/bin/bash\n\
# Wrapper to make solcjs compatible with native solc\n\
\n\
if [[ "$1" == "--version" ]]; then\n\
    echo "solc, the solidity compiler commandline interface"\n\
    echo "Version: 0.8.20+commit.a1b79de6.Emscripten.clang"\n\
    exit 0\n\
fi\n\
\n\
# Filter out flags that solcjs does not support\n\
FILTERED_ARGS=()\n\
SKIP_NEXT=false\n\
\n\
for arg in "$@"; do\n\
    if $SKIP_NEXT; then\n\
        SKIP_NEXT=false\n\
        continue\n\
    fi\n\
    \n\
    case "$arg" in\n\
        --allow-paths|--allow-paths=*)\n\
            if [[ "$arg" != *\"=\"* ]]; then\n\
                SKIP_NEXT=true\n\
            fi\n\
            ;;\n\
        *)\n\
            FILTERED_ARGS+=(\"$arg\")\n\
            ;;\n\
    esac\n\
done\n\
\n\
exec solcjs \"${FILTERED_ARGS[@]}\"\n' > /root/.solcx/solc-v0.8.20 && \
    chmod +x /root/.solcx/solc-v0.8.20 && \
    ln -sf /root/.solcx/solc-v0.8.20 /usr/local/bin/solc

# Test wrapper
RUN solc --version

# --- INSTALL py-solc-x and Slither (main environment) ---
RUN pip install --no-cache-dir \
    py-solc-x==1.1.1 \
    slither-analyzer==0.10.0

# Configure py-solc-x to use wrapper
ENV SOLC_VERSION=0.8.20
ENV SOLCX_BINARY_PATH=/root/.solcx

# --- ISOLATED MYTHRIL INSTALLATION (separate venv) ---
RUN python3 -m venv /opt/mythril-env && \
    /opt/mythril-env/bin/pip install --upgrade pip && \
    /opt/mythril-env/bin/pip install --no-cache-dir \
        mythril==0.24.8 \
        z3-solver==4.12.2.0 \
        py-solc-x==1.1.1

# Copy solc wrapper to Mythril's venv
RUN mkdir -p /opt/mythril-env/.solcx && \
    cp /root/.solcx/solc-v0.8.20 /opt/mythril-env/.solcx/ && \
    chmod +x /opt/mythril-env/.solcx/solc-v0.8.20

# Create myth symlink
RUN ln -sf /opt/mythril-env/bin/myth /usr/local/bin/myth

# SKIP myth version check during build (causes network call)
# We'll verify it works at runtime instead

# --- MAIN APP INSTALLATION ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app
COPY smart-audit-chain ./smart-audit-chain
COPY wait_for_db.sh /wait_for_db.sh

# Create startup test script
RUN printf '#!/bin/bash\n\
echo "=== Verifying Tools ==="\n\
solcjs --version && echo "✅ solcjs works" || echo "❌ solcjs failed"\n\
/root/.solcx/solc-v0.8.20 --version && echo "✅ solc wrapper works" || echo "❌ wrapper failed"\n\
echo "⏭️  Skipping myth check (verified at runtime)"\n\
slither --version && echo "✅ slither works" || echo "❌ slither failed"\n\
echo "=== Verification Complete ==="\n' > /app/startup_test.sh && \
    chmod +x /app/startup_test.sh

# Permissions and Directory Setup
RUN chmod +x /wait_for_db.sh && \
    mkdir -p /app/uploads && \
    mkdir -p /app/uploaded_contracts && \
    chown -R 1000:1000 /app

# Expose port
EXPOSE 8000

# Run the wait script, then Uvicorn
CMD ["/wait_for_db.sh", "db", "5432", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]