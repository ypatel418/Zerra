package com.jash.zerra.repo;

import com.jash.zerra.model.File;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepo extends JpaRepository<File, Long> {
    
}
