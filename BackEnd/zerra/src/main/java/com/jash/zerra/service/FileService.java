package com.jash.zerra.service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.jash.zerra.model.File;
import com.jash.zerra.model.User;
import com.jash.zerra.repo.FileRepo;
import com.jash.zerra.repo.UserRepo;

@Service
public class FileService {

    @Autowired
    private FileRepo repo;
    @Autowired
    private UserRepo userRepo;

    
    public List<File> getAllFiles(String UserID) {
        return repo.findByOwnerId(UserID);
    }

    public File uploadFile(MultipartFile file, String userID) {
        File f = new File();
        f.setOriginalFileName(file.getOriginalFilename());
        f.setStoredFileName(file.getOriginalFilename());
        f.setFileType(file.getContentType());
        f.setFileSize(file.getSize());
        try {
            f.setData(file.getBytes());
        } catch (Exception e) {
            e.getMessage();
        }
        LocalDateTime now = LocalDateTime.now();
        f.setUploadedAt(now);
        f.setOwner(userRepo.findById(userID).orElse(null));
        return repo.save(f);
    }

    public File getFileById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteFile(Long id) {
        repo.deleteById(id);
    }

    public List<File> searchFilesByKeyword(String keyword, String userID) {
        return repo.searchFilesByKeyword(keyword, userID);
    }

    public void shareFile(Long id, String email) {
        File file = repo.findById(id).orElse(null);
        User sharedUser = userRepo.findByEmail(email);
        if (file != null && sharedUser != null) {
            file.getSharedWith().add(sharedUser);
            repo.save(file);
        } else {
            throw new RuntimeException("File or user not found");
        }

    }

    public List<File> getSharedFiles(String userID) {
        return repo.findBySharedWithId(userID);
    }

}
