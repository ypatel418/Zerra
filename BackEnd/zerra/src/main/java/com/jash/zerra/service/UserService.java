package com.jash.zerra.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jash.zerra.model.User;
import com.jash.zerra.repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    public User newUser(User user) {
        System.out.println(user.getEmail());
        return repo.save(user);
    }
}
