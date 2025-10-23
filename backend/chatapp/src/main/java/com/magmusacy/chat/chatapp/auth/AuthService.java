package com.magmusacy.chat.chatapp.auth;

import com.magmusacy.chat.chatapp.auth.dto.AuthenticationResponse;
import com.magmusacy.chat.chatapp.auth.dto.LoginRequest;
import com.magmusacy.chat.chatapp.auth.dto.RefreshTokenRequest;
import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import com.magmusacy.chat.chatapp.user.PasswordMismatchException;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


//TODO: Should this be transactional, like the message should be sent if the transaction goes through
//TODO it might be better to just send the added user but whatever for now that works well
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse register(RegisterRequest request) {
        User user = userService.createUser(request, passwordEncoder);
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new AuthenticationResponse(accessToken, refreshToken);
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userService.findByEmail(request.email());
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new AuthenticationResponse(accessToken, refreshToken);
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new RuntimeException("Refresh token cannot be null or empty");
        }

        String username = jwtService.extractUsername(refreshToken);

        if (username == null) {
            throw new RuntimeException("Invalid refresh token");
        }

        UserDetails userDetails = userService.loadUserByUsername(username);
        if (jwtService.isTokenValid(refreshToken, userDetails)) {
            String newAccessToken = jwtService.generateAccessToken(userDetails);
            return new AuthenticationResponse(newAccessToken, refreshToken);
        } else {
            throw new RuntimeException("Refresh token is expired or invalid. Please re-log in");
        }
    }
}
