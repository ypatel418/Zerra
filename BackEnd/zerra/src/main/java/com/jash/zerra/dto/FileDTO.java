package com.jash.zerra.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.jash.zerra.model.File;
import com.jash.zerra.model.User;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FileDTO {

    private Long id;
    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Long fileSize;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd-yyyy HH:mm:ss")
    private LocalDateTime uploadedAt;

    @JsonIgnoreProperties({"files", "hibernateLazyInitializer", "handler"})
    private User owner;

    @JsonIgnoreProperties({"files", "hibernateLazyInitializer", "handler"})
    private Set<User> sharedWith;

    public FileDTO(File file) {
        this.id = file.getId();
        this.originalFileName = file.getOriginalFileName();
        this.storedFileName = file.getStoredFileName();
        this.fileType = file.getFileType();
        this.fileSize = file.getFileSize();
        this.uploadedAt = file.getUploadedAt();
        this.owner = file.getOwner();
        this.sharedWith = file.getSharedWith();
    }
}
