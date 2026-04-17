package com.campusland.crm.infrastructure.integration.microsoft;

import com.campusland.crm.application.port.out.CalendarMeetingResult;
import com.campusland.crm.domain.meeting.Meeting;
import com.campusland.crm.infrastructure.exception.ExternalIntegrationException;
import com.campusland.crm.infrastructure.integration.microsoft.dto.GraphEventRequest;
import com.campusland.crm.infrastructure.integration.microsoft.dto.GraphEventResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class MicrosoftGraphClient {

    private final WebClient webClient;
    private final String baseUrl;
    private final String accessToken;

    public MicrosoftGraphClient(WebClient.Builder builder,
                                @Value("${integrations.microsoft.graph-base-url}") String baseUrl,
                                @Value("${integrations.microsoft.access-token}") String accessToken) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.accessToken = accessToken;
    }

    public CalendarMeetingResult createMeeting(Meeting meeting) {
        try {
            String start = DateTimeFormatter.ISO_INSTANT.format(meeting.timeRange().start());
            String end = DateTimeFormatter.ISO_INSTANT.format(meeting.timeRange().end());

            GraphEventResponse response = webClient.post()
                    .uri("/v1.0/me/events")
                    .header("Authorization", "Bearer " + accessToken)
                    .bodyValue(new GraphEventRequest(
                            meeting.title().value(),
                            meeting.description(),
                            start,
                            end,
                            List.of(),
                            true
                    ))
                    .retrieve()
                    .bodyToMono(GraphEventResponse.class)
                    .block();

            if (response == null) {
                return new CalendarMeetingResult(false, null, null, "Respuesta vacía de Microsoft Graph");
            }

            return new CalendarMeetingResult(
                    response.success(),
                    response.eventId(),
                    response.meetingLink(),
                    response.errorMessage()
            );
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error creando reunión en Microsoft Graph en " + baseUrl, ex);
        }
    }

    public void cancelMeeting(String externalMeetingId) {
        try {
            webClient.delete()
                    .uri("/v1.0/me/events/{id}", externalMeetingId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception ex) {
            throw new ExternalIntegrationException("Error cancelando reunión en Microsoft Graph", ex);
        }
    }
}
