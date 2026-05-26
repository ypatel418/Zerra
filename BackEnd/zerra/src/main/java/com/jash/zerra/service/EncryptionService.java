package com.jash.zerra.service;

import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Service;

import com.jash.zerra.config.EncryptionProperties;

@Service
public class EncryptionService {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int IV_LENGTH = 12; // bytes
    private static final int KEY_LENGTH = 256; // bits

    private final EncryptionProperties props;

    public EncryptionService(EncryptionProperties props) {
        this.props = props;
    }
    
    // Derives a unique key per user from the master key + userId as salt
    // Salt means that even if two users have the same master key, they will get different derived keys due to the unique userId used as salt. This enhances security by ensuring that each user's data is encrypted with a different key, making it more resistant to attacks.
    private SecretKey deriveKey(String userId) throws Exception {
        byte[] masterKeyBytes = Base64.getDecoder().decode(props.getMasterKey());
        PBEKeySpec spec = new PBEKeySpec(
            new String(masterKeyBytes).toCharArray(),
            userId.getBytes(),
            props.getPbkdf2Iterations(),
            KEY_LENGTH
        );
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        return new javax.crypto.spec.SecretKeySpec(keyBytes, "AES");
    }

    // Generates a random IV for encryption thats 12 bytes
    // An IV is a random value used in encryption to ensure that the same plaintext encrypted multiple times will yield different ciphertexts. This prevents attackers from recognizing patterns in the encrypted data, enhancing security. In AES-GCM mode, a 12-byte IV is recommended for optimal security and performance.
    public byte[] generateIv() {
        byte[] iv = new byte[IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        return iv;
    }

    // Encrypts the plaintext using AES-GCM with the derived key and provided IV
    // This method takes the plaintext, user ID, and IV as inputs and returns the encrypted ciphertext.
    public byte[] encrypt(byte[] plaintext, String userId, byte[] iv) throws Exception {
        SecretKey key = deriveKey(userId);
        Cipher cipher = Cipher.getInstance(ALGORITHM, "SunJCE");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
        return cipher.doFinal(plaintext);
    }

    // Decrypts the ciphertext using AES-GCM with the derived key and provided IV
    // This method takes the ciphertext, user ID, and IV as inputs and returns the decrypted
    public byte[] decrypt(byte[] ciphertext, String userId, byte[] iv) throws Exception {
        SecretKey key = deriveKey(userId);
        Cipher cipher = Cipher.getInstance(ALGORITHM, "SunJCE");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
        return cipher.doFinal(ciphertext);
    }
}
