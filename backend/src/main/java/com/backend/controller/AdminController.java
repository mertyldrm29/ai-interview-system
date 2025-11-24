package com.backend.controller;

import com.backend.entity.Answer;
import com.backend.entity.Interview;
import com.backend.entity.WarningLog;
import com.backend.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final InterviewService interviewService;    
    
    // Tüm mülakatları getir
    @GetMapping("/interviews")
    public ResponseEntity<List<Interview>> getAllInterviews() {
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

    @GetMapping("/interviews/{id}/details")
    public ResponseEntity<List<Answer>> getInterviewDetails(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewAnswers(id));
    }

    @GetMapping("/interviews/{id}/warnings")
    public ResponseEntity<List<WarningLog>> getInterviewWarnings(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterviewWarnings(id));
    }
}
