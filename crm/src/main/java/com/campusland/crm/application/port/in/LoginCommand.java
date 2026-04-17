package com.campusland.crm.application.port.in;

public record LoginCommand(
        String username,
        String password
) {
}