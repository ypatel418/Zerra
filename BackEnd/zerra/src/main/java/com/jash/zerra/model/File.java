package com.jash.zerra.model;

import java.time.LocalDateTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "files") // File is a reserved keyword in some SQL databases
@Data
@NoArgsConstructor
@AllArgsConstructor
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Long fileSize;

    @Lob // Large Object in DB
    private byte[] data; // File data

    // month date year
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd-yyyy HH:mm:ss")
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    // JsonIgnoreProperties to prevent infinite recursion when serializing User -> File -> User
    // Basically says "When converting this object to or from JSON, ignore these properties if they exist"
    @JsonIgnoreProperties({"files", "hibernateLazyInitializer", "handler"})
    private User owner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "files_shares", joinColumns = @JoinColumn(name = "file_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonIgnoreProperties({"files", "hibernateLazyInitializer", "handler"})
    private Set<User> sharedWith; // Want a set to avoid duplicate users

}
