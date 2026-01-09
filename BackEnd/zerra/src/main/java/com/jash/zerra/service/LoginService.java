package com.jash.zerra.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jash.zerra.repo.UserRepo;

@Service
public class LoginService {

    @Autowired
    private UserRepo repo;

}
