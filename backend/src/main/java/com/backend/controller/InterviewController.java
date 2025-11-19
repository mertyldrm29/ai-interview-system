package com.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.CandidateDTO;
import com.backend.entity.Interview;
import com.backend.service.InterviewService;
import com.backend.service.GeminiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class InterviewController {
    private final InterviewService interviewService;
    private final com.backend.service.GeminiService geminiService;

    @PostMapping("/start")
    public ResponseEntity<Interview> startInterview(@RequestBody CandidateDTO candidate) {
        Interview interview = interviewService.createInterview(candidate.getName(),
        candidate.getSurname(),
        candidate.getEmail(),
        candidate.getPhone());
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/test-ai")
    public ResponseEntity<String> testAi() {
    String response = geminiService.evaluateAnswer(
        "Spring Boot nedir?", 
        "Java tabanlı web frameworküdür, konfigürasyonu kolaylaştırır."
    );
    return ResponseEntity.ok(response);
}
}
