package com.jash.zerra.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.jash.zerra.config.EncryptionProperties;
import com.jash.zerra.dto.FileDTO;
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

    // Encryption
    @Autowired
    private EncryptionService encryptionService;
    @Autowired
    private EncryptionProperties encryptionProps;

    public List<FileDTO> getAllFiles(String UserID) {
        List<File> files = repo.findByOwnerId(UserID);
        return files.stream().map(FileDTO::new).collect(Collectors.toList());
    }

    public File uploadFile(MultipartFile file, String userID) throws Exception {
        File f = new File();
        f.setOriginalFileName(file.getOriginalFilename());
        f.setStoredFileName(file.getOriginalFilename());
        f.setFileType(file.getContentType());
        f.setFileSize(file.getSize());
        
        byte[] fileData = file.getBytes();

        if(encryptionProps.isEnabled()) {
            byte[] iv = encryptionService.generateIv();
            byte[] encryptedData = encryptionService.encrypt(fileData, userID, iv);
            f.setData(encryptedData);
            f.setEncryptionVersion(encryptionProps.getAlgorithmVersion());
            f.setEncryptionIv(iv);
            f.setEncryptedSize((long) encryptedData.length);
        } else {
            f.setData(fileData);
            f.setEncryptionVersion(0); // Not encrypted
        }

        f.setUploadedAt(LocalDateTime.now());
        f.setOwner(userRepo.findById(userID).orElse(null));
        return repo.save(f);
    }

    // Returns decrypted bytes for download - handles both encrypted and unencrypted rows
    public byte[] getDecryptedFileData(Long fileId) throws Exception {
        File file = repo.findById(fileId).orElse(null);
        if (file == null) throw new RuntimeException("File not found: " + fileId);

        if (file.getEncryptionVersion() == 0) {
            return file.getData(); // Not encrypted, return raw bytes
        }

        String userID = file.getOwner().getId();
        return encryptionService.decrypt(file.getData(), userID, file.getEncryptionIv());
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
            if (file.getSharedWith() == null) {
                file.setSharedWith(new java.util.HashSet<>());
            }
            file.getSharedWith().add(sharedUser);
            repo.save(file);
        } else {
            throw new RuntimeException("File or user not found");
        }

    }

    public List<FileDTO> getSharedFiles(String userID) {
        List<File> files = repo.findBySharedWithId(userID);
        return files.stream().map(FileDTO::new).collect(Collectors.toList());
    }

    public void removeShared(Long id, String email) {
        File file = repo.findById(id).orElse(null);
        User sharedUser = userRepo.findByEmail(email);
        if (file != null && sharedUser != null) {
            file.getSharedWith().remove(sharedUser);
            repo.save(file);
        } else {
            throw new RuntimeException("File or user not found");
        }
    }

    public Set<User> getSharedUsers(Long fileID) {
        File file = repo.findById(fileID).orElse(null);
        return file.getSharedWith();
    }

}
