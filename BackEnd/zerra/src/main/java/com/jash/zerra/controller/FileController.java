package com.jash.zerra.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.jash.zerra.model.File;
import com.jash.zerra.service.FileService;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileService services;

    @GetMapping("/{UserID}")
    public ResponseEntity<List<File>> getAllFiles(@PathVariable Long UserID) {
        List<File> files = services.getAllFiles(UserID);
        return ResponseEntity.ok(files);
    }

    @PostMapping("/upload")
    public ResponseEntity<File> uploadFile(@RequestPart File file) {
        try {
            File savedFile = services.uploadFile(file);
            return new ResponseEntity<>(savedFile, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable Long id) {
        File file = services.getFileById(id);
        if (file != null) {
            services.deleteFile(id);
            return new ResponseEntity<>("File deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("File not found", HttpStatus.NOT_FOUND);
        }

    }

}
