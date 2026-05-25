package com.jash.zerra.service;

import com.jash.zerra.config.EncryptionProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class EncryptionServiceTests {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        EncryptionProperties props = new EncryptionProperties();
        // Generate a valid base64 256-bit test master key
        props.setMasterKey("dGVzdGtleXRlc3RrZXl0ZXN0a2V5dGVzdGtleXQ=");
        props.setPbkdf2Iterations(1000); // Low iterations for fast tests
        props.setAlgorithmVersion(1);
        props.setEnabled(true);

        encryptionService = new EncryptionService(props);
    }

    @Test
    void testRoundTrip_smallPayload() throws Exception {
        byte[] original = "Hello, Zerra!".getBytes();
        String userID = "user-123";

        byte[] iv = encryptionService.generateIv();
        byte[] encrypted = encryptionService.encrypt(original, userID, iv);
        byte[] decrypted = encryptionService.decrypt(encrypted, userID, iv);

        assertArrayEquals(original, decrypted);
    }

    @Test
    void testRoundTrip_largePayload() throws Exception {
        byte[] original = new byte[10 * 1024 * 1024]; // 10MB
        new java.util.Random().nextBytes(original);
        String userID = "user-456";

        byte[] iv = encryptionService.generateIv();
        byte[] encrypted = encryptionService.encrypt(original, userID, iv);
        byte[] decrypted = encryptionService.decrypt(encrypted, userID, iv);

        assertArrayEquals(original, decrypted);
    }

    @Test
    void testEncryptedBytesNotEqualToOriginal() throws Exception {
        byte[] original = "Sensitive data".getBytes();
        String userID = "user-123";

        byte[] iv = encryptionService.generateIv();
        byte[] encrypted = encryptionService.encrypt(original, userID, iv);

        assertFalse(java.util.Arrays.equals(original, encrypted));
    }

    @Test
    void testTamperDetection() throws Exception {
        byte[] original = "Tamper test".getBytes();
        String userID = "user-123";

        byte[] iv = encryptionService.generateIv();
        byte[] encrypted = encryptionService.encrypt(original, userID, iv);

        // Flip a byte in the ciphertext
        encrypted[0] ^= 0xFF;

        assertThrows(Exception.class, () -> encryptionService.decrypt(encrypted, userID, iv));
    }

    @Test
    void testWrongUserKeyFails() throws Exception {
        byte[] original = "Secret file".getBytes();
        String correctUser = "user-123";
        String wrongUser = "user-999";

        byte[] iv = encryptionService.generateIv();
        byte[] encrypted = encryptionService.encrypt(original, correctUser, iv);

        assertThrows(Exception.class, () -> encryptionService.decrypt(encrypted, wrongUser, iv));
    }

    @Test
    void testUniqueIvEachTime() {
        byte[] iv1 = encryptionService.generateIv();
        byte[] iv2 = encryptionService.generateIv();

        assertFalse(java.util.Arrays.equals(iv1, iv2));
    }
}