package com.campusland.crm.presentation.dto.task;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(
        UUID companyId,
        @NotBlank String description,
        LocalDate dueDate
) {}
