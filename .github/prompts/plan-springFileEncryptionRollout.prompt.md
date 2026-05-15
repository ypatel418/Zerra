## Plan: Spring File Encryption Rollout

Implement transparent at-rest encryption for file bytes using AES-GCM with per-user derived keys, keep metadata searchable, and run a one-time migration to encrypt existing stored blobs before full enablement. This minimizes frontend impact (none expected), preserves current API contracts, and gives a clear cutover path.

**Steps**
1. Phase 1 - Crypto Foundation
2. Add encryption configuration properties and key-derivation settings in /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/resources/application.properties and environment docs in /home/jakem/PersonalProjects/Zerra/README.md. Define master key source, PBKDF2 iterations, and algorithm version constants.
3. Add cryptography support dependency in /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/pom.xml only if needed for utility APIs (JDK crypto is sufficient for core AES-GCM).
4. Create /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/config/EncryptionProperties.java to bind settings.
5. Create /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/EncryptionService.java with methods to encrypt/decrypt byte arrays, generate IV, derive per-user key from master key + user id, and authenticate payloads (AES/GCM/NoPadding).
6. Create /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/KeyDerivationService.java if separation of concerns is preferred; otherwise keep derivation inside EncryptionService. This can run in parallel with Step 4.
7. Phase 2 - Data Model + Service Integration (depends on Phase 1)
8. Edit /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/model/File.java to add encryption metadata fields: encryptionVersion (int), encryptionIv (byte[]), and optional encryptedSize (Long). Keep originalFileName/storedFileName/fileType unencrypted for search/filter behavior.
9. Edit /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/FileService.java:
10. In uploadFile(MultipartFile, String), encrypt file bytes before persistence, store IV/version, preserve fileSize as plaintext size, and optionally persist encryptedSize for observability.
11. Add a new retrieval method returning decrypted bytes for download, for example getDecryptedFileData(Long).
12. Keep getFileById(Long) for metadata-oriented flows, but avoid exposing encrypted blob directly to controller responses.
13. Edit /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/controller/FileController.java:
14. Update downloadFile(Long) to call the new decryption-aware service method and return plaintext bytes.
15. Keep upload endpoint contract unchanged; remove duplicate raw byte extraction done only for quota checks and switch quota checks to MultipartFile.getSize() to avoid extra memory copy.
16. Ensure search/share/delete endpoints remain unchanged (they operate on metadata/relations).
17. Phase 3 - One-Time Migration (depends on Phase 2)
18. Create /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/FileEncryptionMigrationService.java to iterate existing rows where encryptionVersion is null or 0, encrypt stored data, set IV/version, and save in batches.
19. Add a startup-gated trigger in /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/config/MigrationRunner.java (CommandLineRunner) controlled by a flag property so migration can be explicitly enabled for one deployment window.
20. Add failure handling and resumability semantics (id-based pagination or batch window) to avoid reprocessing on restart.
21. Phase 4 - API Safety + Serialization Hardening (parallel with migration development)
22. Edit /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/model/File.java to prevent encrypted data leakage in JSON responses (for example ignore data and encryptionIv where not needed).
23. Edit /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/dto/FileDTO.java if needed to keep response schema stable and explicitly exclude encryption internals.
24. Confirm /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/repo/FileRepo.java queries continue to use filename metadata only; no query changes expected.
25. Phase 5 - Tests + Validation (depends on Phases 2-4)
26. Add /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/test/java/com/jash/zerra/service/EncryptionServiceTests.java for round-trip encryption/decryption, tamper detection, and wrong-user key failure.
27. Add /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/test/java/com/jash/zerra/service/FileServiceEncryptionIntegrationTests.java for upload-encrypt-store and download-decrypt behavior.
28. Expand /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/test/java/com/jash/zerra/ZerraApplicationTests.java only if needed for migration runner wiring.
29. Optionally add a controller-level test class for /files/download/{id} to verify plaintext response with encrypted DB state.

**Relevant files**
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/controller/FileController.java - download and upload orchestration (currently reads/writes raw bytes).
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/FileService.java - central place to enforce encrypt-on-write/decrypt-on-read.
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/model/File.java - persistence schema for ciphertext and metadata.
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/repo/FileRepo.java - storage and search queries (metadata search retained).
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/UserService.java - quota logic should use plaintext size semantics.
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/resources/application.properties - encryption config and migration toggle flags.
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/pom.xml - crypto/test dependencies.
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/test/java/com/jash/zerra/ZerraApplicationTests.java - baseline test scaffold.

**Files to add**
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/config/EncryptionProperties.java
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/EncryptionService.java
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/service/FileEncryptionMigrationService.java
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/main/java/com/jash/zerra/config/MigrationRunner.java
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/test/java/com/jash/zerra/service/EncryptionServiceTests.java
- /home/jakem/PersonalProjects/Zerra/BackEnd/zerra/src/test/java/com/jash/zerra/service/FileServiceEncryptionIntegrationTests.java

**Verification**
1. Unit: EncryptionService encrypt/decrypt round-trip succeeds for multiple payload sizes and MIME-like binary inputs.
2. Unit: Ciphertext tampering causes authentication failure on decrypt.
3. Unit: Decrypt with different user id (derived key mismatch) fails.
4. Integration: Upload endpoint stores ciphertext in DB (not equal to original bytes) and sets encryptionVersion/IV.
5. Integration: Download endpoint returns original plaintext bytes for encrypted rows.
6. Migration dry run: count candidate rows before migration and after migration verify encryptionVersion updated and bytes changed.
7. Manual smoke: frontend upload/download/share/search/delete flows remain unchanged from user perspective.
8. Performance check: measure migration throughput and upload/download latency for near-limit file sizes.

**Decisions**
- Chosen key strategy: per-user derived key.
- Chosen migration strategy: one-time migration before full encryption enablement.
- Chosen scope: data-only encryption; metadata remains plaintext/searchable.
- Included scope: backend encryption, migration, and tests.
- Excluded scope: frontend crypto, metadata encryption, key escrow/rotation UI.

**Further considerations**
1. Recommend adding explicit key versioning in properties and File.encryptionVersion so future key rotation can be introduced without schema redesign.
2. Recommend setting spring.jpa.show-sql=false in production migration windows to avoid logging overhead.
3. Recommend documenting operational runbook steps for enabling/disabling migration flag and rollback handling.