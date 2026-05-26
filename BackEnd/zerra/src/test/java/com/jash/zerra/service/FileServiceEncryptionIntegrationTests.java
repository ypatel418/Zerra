package com.jash.zerra.service;

import com.jash.zerra.model.File;
import com.jash.zerra.model.User;
import com.jash.zerra.repo.FileRepo;
import com.jash.zerra.repo.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "zerra.encryption.pbkdf2-iterations=1000",
    "zerra.encryption.algorithm-version=1",
    "zerra.encryption.enabled=true",
    "zerra.migration.encryption.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
public class FileServiceEncryptionIntegrationTests {

    @Autowired
    private FileService fileService;

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private UserRepo userRepo;

    private User testUser;

    @DynamicPropertySource
    static void dynamicProperties(DynamicPropertyRegistry registry) {
        byte[] key = new byte[32];
        new java.security.SecureRandom().nextBytes(key);
        String base64 = java.util.Base64.getEncoder().encodeToString(key);
        registry.add("zerra.encryption.master-key", () -> base64);
    }

    @BeforeEach
    void setUp() {
        fileRepo.deleteAll();
        userRepo.deleteAll();

        testUser = new User();
        testUser.setId("test-user-001");
        testUser.setEmail("test@zerra.com");
        userRepo.save(testUser);
    }

    @Test
    void testUpload_storesCiphertext() throws Exception {
        byte[] originalBytes = "Hello encrypted world!".getBytes();
        MockMultipartFile mockFile = new MockMultipartFile(
            "file", "test.txt", "text/plain", originalBytes
        );

        File saved = fileService.uploadFile(mockFile, testUser.getId());

        // Stored bytes should NOT equal original bytes
        assertFalse(java.util.Arrays.equals(originalBytes, saved.getData()));
        // Encryption version should be set
        assertEquals(1, saved.getEncryptionVersion());
        // IV should be set
        assertNotNull(saved.getEncryptionIv());
        assertEquals(12, saved.getEncryptionIv().length);
        // File size should reflect original plaintext size
        assertEquals(originalBytes.length, saved.getFileSize());
    }

    @Test
    void testDownload_returnsPlaintext() throws Exception {
        byte[] originalBytes = "Download me decrypted!".getBytes();
        MockMultipartFile mockFile = new MockMultipartFile(
            "file", "test.txt", "text/plain", originalBytes
        );

        File saved = fileService.uploadFile(mockFile, testUser.getId());
        byte[] decrypted = fileService.getDecryptedFileData(saved.getId());

        assertArrayEquals(originalBytes, decrypted);
    }

    @Test
    void testUpload_unencryptedRow_returnsRawBytes() throws Exception {
        // Simulate a pre-migration file with encryptionVersion = 0
        byte[] rawBytes = "Legacy unencrypted file".getBytes();

        File legacyFile = new File();
        legacyFile.setOriginalFileName("legacy.txt");
        legacyFile.setStoredFileName("legacy.txt");
        legacyFile.setFileType("text/plain");
        legacyFile.setFileSize((long) rawBytes.length);
        legacyFile.setData(rawBytes);
        legacyFile.setEncryptionVersion(0);
        legacyFile.setUploadedAt(java.time.LocalDateTime.now());
        legacyFile.setOwner(testUser);
        fileRepo.save(legacyFile);

        byte[] result = fileService.getDecryptedFileData(legacyFile.getId());
        assertArrayEquals(rawBytes, result);
    }
}