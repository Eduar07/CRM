package com.campusland.crm.presentation.meeting;

import com.campusland.crm.application.port.in.ScheduleMeetingCommand;
import com.campusland.crm.application.port.in.ScheduleMeetingUseCase;
import com.campusland.crm.application.port.out.MeetingRepositoryPort;
import com.campusland.crm.domain.meeting.MeetingId;
import com.campusland.crm.presentation.dto.meeting.MeetingResponse;
import com.campusland.crm.presentation.dto.meeting.ScheduleMeetingRequest;
import com.campusland.crm.presentation.mapper.MeetingApiMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final ScheduleMeetingUseCase scheduleMeetingUseCase;
    private final MeetingRepositoryPort meetingRepositoryPort;

    public MeetingController(ScheduleMeetingUseCase scheduleMeetingUseCase,
                             MeetingRepositoryPort meetingRepositoryPort) {
        this.scheduleMeetingUseCase = scheduleMeetingUseCase;
        this.meetingRepositoryPort = meetingRepositoryPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @PostMapping
    public ResponseEntity<MeetingResponse> schedule(@Valid @RequestBody ScheduleMeetingRequest request) {
        var meeting = scheduleMeetingUseCase.schedule(
                new ScheduleMeetingCommand(
                        request.companyId(),
                        request.contactId(),
                        request.userId(),
                        request.title(),
                        request.description(),
                        request.startTime(),
                        request.endTime(),
                        request.meetingLink()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(MeetingApiMapper.toResponse(meeting));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getById(@PathVariable UUID id) {
        var meeting = meetingRepositoryPort.findById(new MeetingId(id))
                .orElseThrow(() -> new IllegalArgumentException("Reunión no encontrada"));

        return ResponseEntity.ok(MeetingApiMapper.toResponse(meeting));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping
    public ResponseEntity<List<MeetingResponse>> findByUser(@RequestParam String userId) {
        var items = meetingRepositoryPort.findByUserId(userId)
                .stream()
                .map(MeetingApiMapper::toResponse)
                .toList();

        return ResponseEntity.ok(items);
    }
}