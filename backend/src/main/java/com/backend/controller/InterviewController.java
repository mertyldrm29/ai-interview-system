package com.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.CandidateDTO;
import com.backend.entity.Interview;
import com.backend.service.InterviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class InterviewController {
    private final InterviewService interviewService;

    @PostMapping("/start")
    public ResponseEntity<Interview> startInterview(@RequestBody CandidateDTO candidate) {
        Interview interview = interviewService.createInterview(candidate.getName(),
        candidate.getSurname(),
        candidate.getEmail(),
        candidate.getPhone());
        return ResponseEntity.ok(interview);
    }
}
