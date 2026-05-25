package com.jash.zerra.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jash.zerra.config.EncryptionProperties;
import com.jash.zerra.model.File;
import com.jash.zerra.repo.FileRepo;
import org.springframework.data.domain.PageRequest;

@Service
public class FileEncryptionMigrationService {

    // Service that scans the database for files that are not yet encrypted
    // and migrates them to the current encryption scheme. It processes
    // files in batches to avoid loading everything into memory at once.
    // Fetches files in batches of 50, encrypts them, and updates the database
    private static final int BATCH_SIZE = 50;

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private EncryptionProperties encryptionProperties;

    public void migrateUnencryptedFiles() {
        // Log start of the migration process
        System.out.println("[Migration] Starting the file encryption migration process...");

        long lastProcessedId = 0L;
        int totalMigrated = 0;
        int totalFailed = 0;

        // Keep fetching batches until there are no more unencrypted files
        while (true) {
            // Get a page of files that still need encryption. The query
            // uses `lastProcessedId` so we continue from where we left off.
            List<File> batch = fileRepo.findUnencryptedBatch(lastProcessedId, PageRequest.of(0, BATCH_SIZE));
            if (batch.isEmpty()) {
                break;
            }

            for (File file : batch) {
                try {
                    // Build the encryption context (owner id used as part of keying)
                    String userID = file.getOwner().getId();

                    // Generate a unique IV for this file and perform encryption
                    byte[] iv = encryptionService.generateIv();
                    byte[] encryptedData = encryptionService.encrypt(file.getData(), userID, iv);

                    // Write encryption metadata back to the file record
                    file.setData(encryptedData);
                    file.setEncryptionIv(iv);
                    file.setEncryptionVersion(encryptionProperties.getAlgorithmVersion());
                    file.setEncryptedSize((long) encryptedData.length);

                    // Save the updated file to the database
                    fileRepo.save(file);
                    totalMigrated++;
                    System.out.println("[Migration] Successfully encrypted file ID: " + file.getId());
                } catch (Exception e) {
                    // If any error happens for a single file, record it and
                    // continue with the rest. We don't stop the whole job.
                    System.err.println("[Migration] Failed to encrypt file ID: " + file.getId());
                    totalFailed++;
                }
            }

            // Update the last processed ID
            lastProcessedId = batch.get(batch.size() - 1).getId();
        }

        System.out.println("[Migration] Migration completed. Migrated: " + totalMigrated + ", Failed: " + totalFailed);
    }
    
}
