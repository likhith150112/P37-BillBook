package com.billbook.controller;

import com.billbook.model.AuditLog;
import com.billbook.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    private static final DateTimeFormatter TS_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<AuditLog> listRecent() {
        return auditLogRepository.findTop100ByOrderByIdDesc();
    }

    @PostMapping
    public AuditLog append(@RequestBody Map<String, String> payload) {
        AuditLog entry = new AuditLog();
        entry.setTimestamp(LocalDateTime.now().format(TS_FMT));
        entry.setAction(payload.getOrDefault("action", "GST_BENCHMARK_RUN"));
        entry.setEntityRef(payload.getOrDefault("entityRef", "System"));
        entry.setActor(payload.getOrDefault("actor", "Accountant (Production)"));
        entry.setDetails(payload.getOrDefault("details", "Operation recorded."));
        return auditLogRepository.save(entry);
    }
}
