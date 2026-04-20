package com.campusland.crm.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "ms_access_token")
    private String msAccessToken;

    @Column(name = "ms_refresh_token")
    private String msRefreshToken;

    protected UserEntity() {
    }

    public UserEntity(UUID id,
                      String username,
                      String email,
                      String role,
                      String passwordHash,
                      boolean active,
                      String msAccessToken,
                      String msRefreshToken) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.passwordHash = passwordHash;
        this.active = active;
        this.msAccessToken = msAccessToken;
        this.msRefreshToken = msRefreshToken;
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isActive() {
        return active;
    }

    public String getMsAccessToken() {
        return msAccessToken;
    }

    public String getMsRefreshToken() {
        return msRefreshToken;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setMsAccessToken(String msAccessToken) {
        this.msAccessToken = msAccessToken;
    }

    public void setMsRefreshToken(String msRefreshToken) {
        this.msRefreshToken = msRefreshToken;
    }
}
