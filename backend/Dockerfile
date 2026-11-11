
# ==========================================
# STAGE 1: BUILD SPRING BOOT APPLICATION
# ==========================================

FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy Maven configuration
COPY backend/pom.xml .

# Copy Java source code
COPY backend/src ./src

# Build the Spring Boot JAR
RUN mvn clean package -DskipTests


# ==========================================
# STAGE 2: APPLICATION RUNTIME
# ==========================================

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Install Python runtime and pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Copy Spring Boot JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Copy Python application
COPY data-processing /app/data-processing

# Install Python dependencies
# Create isolated Python virtual environment
RUN python3 -m venv /opt/venv

# Add Python virtual environment to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir \
    -r /app/data-processing/requirements.txt

# Expose backend port
EXPOSE 8082

# Start Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
