package com.magmusacy.chat.chatapp.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public void saveUser(User user) {
        user.setIsOnline(true);
        repository.save(user);
    }

    public void disconnectUser(User user) {
        Optional<User> connectedUser = repository.findById(user.getId());
        connectedUser.ifPresent(u -> {
            u.setIsOnline(false);
            repository.save(u);
        });
    }

    public List<User> findConnectedUsers() {
        return repository.findAllByIsOnline(true);
    }
}
