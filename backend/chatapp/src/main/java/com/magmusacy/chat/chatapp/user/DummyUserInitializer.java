package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DummyUserInitializer {

    @Bean
    public CommandLineRunner initDummyUsers(UserService userService, PasswordEncoder passwordEncoder) {
        return args -> {
            userService.createUser(
                    new RegisterRequest("Dummy One", "dummy1@example.com", "password", "password"),
                    passwordEncoder
            );
            userService.createUser(
                    new RegisterRequest("Dummy Two", "dummy2@example.com", "password", "password"),
                    passwordEncoder
            );
        };
    }
}
