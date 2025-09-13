package com.magmusacy.chat.chatapp;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class AbstractIntegrationTest {

    static {
        TestcontainersInitializer.postgres.isRunning();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        TestcontainersInitializer.configureProperties(registry);
    }
}
