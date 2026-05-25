package com.jash.zerra.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jash.zerra.model.File;
import org.springframework.data.domain.Pageable;

@Repository
public interface FileRepo extends JpaRepository<File, Long> {

        public List<File> findByOwnerId(String userId);

        @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM File f WHERE f.owner.id = :userID")
        Long sumFileSizeByOwnerId(@Param("userID") String userID);

        @Query("SELECT f FROM File f " +
                        "WHERE f.owner.id = :userID " +
                        "AND (LOWER(f.storedFileName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "OR LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
        List<File> searchFilesByKeyword(@Param("keyword") String keyword, @Param("userID") String userID);

        public List<File> findBySharedWithId(String userID);

        @Query("SELECT f FROM File f WHERE f.encryptionVersion = 0 AND f.id > :lastId ORDER BY f.id ASC")
        List<File> findUnencryptedBatch(@Param("lastId") long lastId, Pageable pageable);
}
