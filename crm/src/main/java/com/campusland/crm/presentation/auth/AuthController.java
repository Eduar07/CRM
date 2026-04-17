package com.campusland.crm.presentation.auth;

import com.campusland.crm.application.port.in.LoginCommand;
import com.campusland.crm.application.port.in.LoginUseCase;
import com.campusland.crm.presentation.dto.auth.LoginRequest;
import com.campusland.crm.presentation.dto.auth.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginUseCase loginUseCase;

    public AuthController(LoginUseCase loginUseCase) {
        this.loginUseCase = loginUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var result = loginUseCase.login(new LoginCommand(request.username(), request.password()));

        return ResponseEntity.ok(
                new LoginResponse(
                        result.userId(),
                        result.username(),
                        result.role(),
                        result.accessToken(),
                        result.expiresAt()
                )
        );
    }
}