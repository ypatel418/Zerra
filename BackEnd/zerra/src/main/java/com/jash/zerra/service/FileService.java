package com.jash.zerra.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jash.zerra.model.File;
import com.jash.zerra.repo.FileRepo;


@Service
public class FileService {

    @Autowired
    private FileRepo repo;

    // Get all files
    public List<File> getAllFiles() {
        return repo.findAll();
    }

    // Upload File
    public File uploadFile(File file) {
        return repo.save(file);
    }

    public File getFileById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteFile(Long id) {
        repo.deleteById(id);
    }

    public List<File> searchFilesByKeyword(String keyword) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'searchFilesByKeyword'");
    }
    
}
