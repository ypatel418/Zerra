package com.jash.zerra.repo;

import com.jash.zerra.model.File;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepo extends JpaRepository<File, Long> {

    // @Query("SELECT f " +
    // "FROM files f " +
    // "JOIN FETCH f.user_id u " +
    // "WHERE u.id = :UserID")
    // @Param("UserID")
    public List<File> findByOwnerId(Long userId);

}
