package com.jash.zerra.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jash.zerra.model.File;
import com.jash.zerra.model.User;
import com.jash.zerra.repo.FileRepo;
import com.jash.zerra.repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;
    @Autowired
    private FileRepo fileRepo;

    public User newUser(User user) {
        System.out.println(user.getEmail());
        return repo.save(user);
    }

    public Long getUserStorageUsage(String userID) {
        // Count all file bytes of the user and return it
        List<File> files = fileRepo.findByOwnerId(userID);
        Long storageUsage = 0L;

        for (File file : files) {
            if (file.getFileSize() != null) {
                storageUsage += file.getFileSize();
            }
        }
        return storageUsage;
    }

    public boolean userMaxStorageReached(String userID, File uploadedFile) {
        // Max Storage at 100 mb
        Long maxStorage = 100L * 1024L * 1024L;
        Long currentStorageUsage = getUserStorageUsage(userID);
        Long uploadedFileSize = uploadedFile.getFileSize() != null ? uploadedFile.getFileSize() : 0L;
        
        return (currentStorageUsage + uploadedFileSize) >= maxStorage;
    }
}
