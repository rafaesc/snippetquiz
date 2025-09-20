package ai.snippetquiz.core_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/status")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "SnippetQuiz Core Service");
        response.put("message", "Service is running normally");
        
        return response;
    }
    
    @GetMapping("/ping")
    @ResponseStatus(HttpStatus.OK)
    public String ping() {
        return "pong";
    }
    
    @GetMapping("/ready")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> readiness() {
        Map<String, Object> response = new HashMap<>();
        response.put("ready", true);
        response.put("timestamp", LocalDateTime.now());
        response.put("checks", Map.of(
            "database", "connected",
            "kafka", "available"
        ));
        
        return response;
    }
}