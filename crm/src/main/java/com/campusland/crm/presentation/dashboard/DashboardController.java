package com.campusland.crm.presentation.dashboard;

import com.campusland.crm.application.port.out.CompanyRepositoryPort;
import com.campusland.crm.application.port.out.CurrentUserPort;
import com.campusland.crm.domain.company.Company;
import com.campusland.crm.domain.user.UserRole;
import com.campusland.crm.infrastructure.persistence.adapter.TaskRepositoryAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final CompanyRepositoryPort companyRepository;
    private final TaskRepositoryAdapter taskRepository;
    private final CurrentUserPort currentUserPort;

    public DashboardController(CompanyRepositoryPort companyRepository,
                               TaskRepositoryAdapter taskRepository,
                               CurrentUserPort currentUserPort) {
        this.companyRepository = companyRepository;
        this.taskRepository = taskRepository;
        this.currentUserPort = currentUserPort;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MARCELA_ADMIN','KAROLAIN_ADMIN')")
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKpis() {
        UserRole role = currentUserPort.role();

        List<Company> companies = switch (role) {
            case SUPER_ADMIN -> companyRepository.findAll();
            case MARCELA_ADMIN -> companyRepository.findByDepartment("Santander");
            case KAROLAIN_ADMIN -> companyRepository.findByDepartment("Norte de Santander");
        };

        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant twoWeeksAgo = Instant.now().minus(14, ChronoUnit.DAYS);

        long companiesThisWeek = companies.stream()
                .filter(c -> c.createdAt().isAfter(oneWeekAgo)).count();
        long companiesLastWeek = companies.stream()
                .filter(c -> c.createdAt().isAfter(twoWeeksAgo) && c.createdAt().isBefore(oneWeekAgo)).count();

        long inProcess = companies.stream()
                .filter(c -> "En proceso".equalsIgnoreCase(c.contactStatus())).count();

        long contacted = companies.stream()
                .filter(c -> !"Nueva".equalsIgnoreCase(c.contactStatus())).count();

        double contactRate = companies.isEmpty() ? 0 :
                Math.round((double) contacted / companies.size() * 100.0 * 10) / 10.0;

        long pendingTasks = taskRepository.countPending(currentUserPort.userId());
        long overdueTasks = taskRepository.countOverdue(currentUserPort.userId());

        return ResponseEntity.ok(Map.of(
                "companiesThisWeek", companiesThisWeek,
                "companiesLastWeek", companiesLastWeek,
                "companiesDelta", companiesThisWeek - companiesLastWeek,
                "totalCompanies", companies.size(),
                "inProcess", inProcess,
                "pendingTasks", pendingTasks,
                "overdueTasks", overdueTasks,
                "contactRate", contactRate
        ));
    }
}
