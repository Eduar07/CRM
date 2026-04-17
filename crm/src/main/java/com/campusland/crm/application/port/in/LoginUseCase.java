package com.campusland.crm.application.port.in;

public interface LoginUseCase {
    LoginResult login(LoginCommand command);
}
