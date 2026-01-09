package com.jash.zerra.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jash.zerra.model.User;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

}
