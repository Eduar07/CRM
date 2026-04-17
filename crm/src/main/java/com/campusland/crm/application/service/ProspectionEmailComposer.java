package com.campusland.crm.application.service;

import com.campusland.crm.domain.contact.ContactRole;
import org.springframework.stereotype.Component;

@Component
public class ProspectionEmailComposer {

    public String subject(ContactRole role, String companyName) {
        return switch (role) {
            case HR -> "Formación y desarrollo de talento para " + companyName;
            case TALENT_MANAGER -> "Apoyo en atracción y formación de talento para " + companyName;
            case CTO -> "Talento developer para acelerar " + companyName;
            case CEO -> "Crecimiento tecnológico para " + companyName;
        };
    }

    public String content(ContactRole role, String contactName, String companyName) {
        String greeting = "Hola " + contactName + ",";
        String intro = "Soy parte del equipo de Campusland y quiero compartirte una propuesta que puede aportar valor a " + companyName + ".";

        String value = switch (role) {
            case HR -> """
                    Podemos apoyar a tu equipo con programas de formación, desarrollo de habilidades y actualización tecnológica para fortalecer el talento interno.
                    """;
            case TALENT_MANAGER -> """
                    Podemos acompañarte con formación, atracción de talento y apoyo estratégico para mejorar procesos de selección y crecimiento del equipo.
                    """;
            case CTO -> """
                    Podemos ayudarte con staff augmentation para cubrir necesidades técnicas y acelerar el desarrollo con perfiles especializados.
                    """;
            case CEO -> """
                    Podemos impulsar el crecimiento de tu operación con soluciones de staff augmentation, consultoría tecnológica e iniciativas de IA aplicadas al negocio.
                    """;
        };

        String benefits = """
                - Más capacidad operativa
                - Menor presión sobre tu equipo interno
                - Mayor velocidad de ejecución
                - Alineación con objetivos de crecimiento
                """;

        String cta = "¿Te parece si agendamos una reunión corta para contarte más?";
        return greeting + "\n\n" + intro + "\n\n" + value + "\nBeneficios:\n" + benefits + "\n" + cta;
    }
}