package com.magmusacy.chat.chatapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    List<User> findAllByIsOnline(Boolean isOnline);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
