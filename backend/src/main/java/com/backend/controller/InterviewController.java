package com.backend.controller;

import java.util.List;

import org.apache.catalina.connector.Response;
import org.eclipse.angus.mail.util.QEncoderStream;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.CandidateDTO;
import com.backend.entity.Answer;
import com.backend.entity.Interview;
import com.backend.entity.Question;
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

    // Mülakat başlat
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

    // Uyarı ekle
    @PostMapping("/{id}/warn")
    public ResponseEntity<Interview> addWarning(@PathVariable Long id, @RequestBody String reason) {
        Interview updatedInterview = interviewService.addWarning(id, reason);
        return ResponseEntity.ok(updatedInterview);
    }

    // Soru getir
    @GetMapping("/{id}/question")
    public ResponseEntity<Question> getNextQuestion(@PathVariable Long id) {
        Question question = interviewService.getNextQuestion(id);
        if (question == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(question);
    }
    // Cevap gönder
    @PostMapping("/{id}/answer")
    public ResponseEntity<Answer> submitAnswer(
        @PathVariable Long id,
        @RequestParam Long questionId,
        @RequestBody String answerText
    ) {
        Answer savedAnswer = interviewService.submitAnswer(id, questionId, answerText);
        return ResponseEntity.ok(savedAnswer);
    }

    // Mülakatı tamamla ve mail gönder
    @PostMapping("/{id}/finish")
    public ResponseEntity<String> finishInterview(@PathVariable Long id) {
        interviewService.finishInterview(id);
        return ResponseEntity.ok("Mülakat başarıyla tamamlandı ve mail gönderildi.");
    }

    // Tüm mülakatları getir
    @GetMapping
    public ResponseEntity<List<Interview>> getAllInterviews() {
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

}
