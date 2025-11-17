FROM amazoncorretto:21-alpine
WORKDIR /app
COPY /build/libs/chatapp-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=${SPRING_PROFILES_ACTIVE}"]

# For running the apps ned ENV JWT_SECRET and DATABASE_URL