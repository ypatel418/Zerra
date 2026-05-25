package com.jash.zerra.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.jash.zerra.service.FileEncryptionMigrationService;

@Component
public class MigrationRunner implements CommandLineRunner {

    @Autowired
    private FileEncryptionMigrationService migrationService;
    
    @Value("${zerra.migration.encryption.enabled:false}")
    private boolean migrationEnabled;

    @Override
    public void run(String... args) {
        if (migrationEnabled) {
            System.out.println("[Migration] File encryption migration is enabled. Starting migration...");
            migrationService.migrateUnencryptedFiles();
            System.out.println("[Migration] File encryption migration process completed.");
        } else {
            System.out.println("[Migration] File encryption migration is disabled. Skipping...");
        }
    }
}
