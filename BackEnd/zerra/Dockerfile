# Stage 1: Build using Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime using Java 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Best practice: Run as a non-root user for security
RUN useradd -m springuser
USER springuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]