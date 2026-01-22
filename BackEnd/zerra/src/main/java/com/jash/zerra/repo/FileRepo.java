package com.jash.zerra.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jash.zerra.model.File;

@Repository
public interface FileRepo extends JpaRepository<File, String> {

    public List<File> findByOwnerId(String userId);

    @Query("SELECT f " +
            "FROM File f " +
            "WHERE f.owner.id = :userID AND " +
            "LOWER(f.storedFileName) LIKE LOWER(CONCAT('%', :keyword,'%')) OR " +
            "LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :keyword,'%'))")
    public List<File> searchFilesByKeyword(@Param("keyword") String keyword, @Param("userID") String userID);
}
