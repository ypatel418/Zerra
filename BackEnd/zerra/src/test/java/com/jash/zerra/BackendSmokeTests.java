package com.jash.zerra;

import com.jash.zerra.model.File;
import com.jash.zerra.model.User;
import com.jash.zerra.repo.FileRepo;
import com.jash.zerra.repo.UserRepo;
import com.jash.zerra.service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "zerra.encryption.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
public class BackendSmokeTests {

    @Autowired
    private FileService fileService;

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private UserRepo userRepo;

    @BeforeEach
    void clean() {
        fileRepo.deleteAll();
        userRepo.deleteAll();
    }

    @Test
    void testUploadAndRetrieveUnencryptedFile() throws Exception {
        User u = new User();
        u.setId("smoke-user-1");
        u.setEmail("smoke1@example.com");
        userRepo.save(u);

        byte[] original = "smoke test payload".getBytes();
        MockMultipartFile multipart = new MockMultipartFile("file", "smoke.txt", "text/plain", original);

        File saved = fileService.uploadFile(multipart, u.getId());

        assertNotNull(saved.getId());
        assertEquals(0, saved.getEncryptionVersion());
        assertArrayEquals(original, saved.getData());

        byte[] retrieved = fileService.getDecryptedFileData(saved.getId());
        assertArrayEquals(original, retrieved);
    }

    @Test
    @Transactional
    void testShareFileAndGetSharedFiles() throws Exception {
        User owner = new User();
        owner.setId("owner-1");
        owner.setEmail("owner@example.com");
        userRepo.save(owner);

        User recipient = new User();
        recipient.setId("recipient-1");
        recipient.setEmail("recipient@example.com");
        userRepo.save(recipient);

        byte[] original = "share me".getBytes();
        MockMultipartFile multipart = new MockMultipartFile("file", "share.txt", "text/plain", original);
        File saved = fileService.uploadFile(multipart, owner.getId());

        fileService.shareFile(saved.getId(), recipient.getEmail());

        List<?> shared = fileService.getSharedFiles(recipient.getId());
        assertFalse(shared.isEmpty());
    }

    @Test
    void testSumFileSizeAndSearch() throws Exception {
        User u = new User();
        u.setId("search-user");
        u.setEmail("search@example.com");
        userRepo.save(u);

        MockMultipartFile a = new MockMultipartFile("file", "report-jan.txt", "text/plain", "jan".getBytes());
        MockMultipartFile b = new MockMultipartFile("file", "notes.txt", "text/plain", "notes".getBytes());

        fileService.uploadFile(a, u.getId());
        fileService.uploadFile(b, u.getId());

        Long total = fileRepo.sumFileSizeByOwnerId(u.getId());
        assertTrue(total > 0);

        List<File> found = fileService.searchFilesByKeyword("report", u.getId());
        assertFalse(found.isEmpty());
    }
}
