package com.jash.zerra.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jash.zerra.model.User;
import com.jash.zerra.repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    public User newUser(String UID, String email) {
        User user = new User();
        user.setEmail(email);
        user.setId(UID);
        return repo.save(user);
    }
}
