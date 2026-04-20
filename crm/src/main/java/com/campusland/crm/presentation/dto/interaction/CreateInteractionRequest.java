package com.campusland.crm.presentation.dto.interaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateInteractionRequest(
        @NotNull UUID companyId,
        @NotBlank String type,
        String notes
) {}
