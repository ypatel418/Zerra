package com.jash.zerra.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "zerra.encryption")
public class EncryptionProperties {
    private String masterKey;
    private int pbkdf2Iterations;
    private int algorithmVersion;
    private boolean enabled;

    public String getMasterKey() {
        return masterKey;
    }

    public void setMasterKey(String masterKey) {
        this.masterKey = masterKey;
    }

    public int getPbkdf2Iterations() {
        return pbkdf2Iterations;
    }

    public void setPbkdf2Iterations(int pbkdf2Iterations) {
        this.pbkdf2Iterations = pbkdf2Iterations;
    }

    public int getAlgorithmVersion() {
        return algorithmVersion;
    }

    public void setAlgorithmVersion(int algorithmVersion) {
        this.algorithmVersion = algorithmVersion;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
