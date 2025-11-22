package com.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import com.backend.entity.WarningLog;
import com.backend.entity.Answer;
import com.backend.entity.Interview;
import com.backend.entity.Question;
import com.backend.entity.User;
import com.backend.repository.InterviewRepository;
import com.backend.repository.UserRepository;
import com.backend.repository.WarningLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import com.backend.repository.QuestionRepository;
import com.backend.repository.AnswerRepository;
import com.backend.service.GeminiService;
import jakarta.transaction.Transactional;
import com.backend.entity.enums.InterviewStatus;
import com.backend.service.EmailService;

@Service
@RequiredArgsConstructor
public class InterviewService {
  private final UserRepository userRepository;
  private final InterviewRepository interviewRepository;
  private final WarningLogRepository warningLogRepository;
  private final QuestionRepository questionRepository;
  private final AnswerRepository answerRepository;
  private final GeminiService geminiService;
  private final EmailService emailService;

  @Value("${admin.email}")
  private String adminEmail;


  public Interview createInterview(String name, String surname, String email, String phone) {
    User user = userRepository.findByEmail(email).orElseGet(() -> {
      User newUser = new User();
      newUser.setName(name);
      newUser.setSurname(surname);
      newUser.setEmail(email);
      newUser.setPhone(phone);
      return userRepository.save(newUser);
    });
    Interview interview = new Interview();
    interview.setUser(user);
    interview.setStartTime(LocalDateTime.now());
    interview.setStatus(Interview.InterviewStatus.ACTIVE);
    return interviewRepository.save(interview);
  }

  @Transactional
  public void finishInterview(Long interviewId) {
    Interview interview = interviewRepository.findById(interviewId).
    orElseThrow(() -> new RuntimeException("Mülakat bulunamadı"));

    // Mülakat aktif değilse işlem yapma
    if (interview.getStatus() != Interview.InterviewStatus.ACTIVE) return;

    // Mülakatı tamamla
    interview.setStatus(Interview.InterviewStatus.COMPLETED);
    interview.setEndTime(LocalDateTime.now());

    // toplam puanı hesapla
    List<Answer> answers = answerRepository.findAllByInterviewId(interviewId);
    int totalScore = 0;

    if (!answers.isEmpty()) {
      int sum = answers.stream().mapToInt(Answer::getScore).sum();
      totalScore = sum / answers.size();
    }
    interview.setScore(totalScore);

    // uyarı sayısı
    long warningCount = warningLogRepository.countByInterviewId(interviewId);

    interviewRepository.save(interview);

    // mail gönder
    emailService.sendResultEmail(adminEmail, 
                interview.getUser().getName() + " " + interview.getUser().getSurname(),
                totalScore, 
                (int) warningCount,
                "BAŞARIYLA TAMAMLANDI");
  }

  @Transactional
    public Interview addWarning(Long interviewId, String reason) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Mülakat bulunamadı"));

        if (interview.getStatus() != Interview.InterviewStatus.ACTIVE) {
            return interview; 
        }

        WarningLog log = new WarningLog();
        log.setInterview(interview);
        log.setReason(reason);
        log.setTimestamp(LocalDateTime.now());
        warningLogRepository.save(log);

        long currentWarnings = warningLogRepository.countByInterviewId(interviewId);

        if (currentWarnings >= 3) {
            interview.setStatus(Interview.InterviewStatus.TERMINATED);
            interview.setEndTime(LocalDateTime.now());

            // kovulma maili
            emailService.sendResultEmail(adminEmail,
              interview.getUser().getName() + " " + interview.getUser().getSurname(),
              0,
              (int) currentWarnings,
              "İhlal Nedeniyle Sonlandırıldı"
            );
        }
        
        return interviewRepository.save(interview);
    }

    public Question getNextQuestion(Long interviewId) {
      Interview interview = interviewRepository.findById(interviewId)
      .orElseThrow(() -> new RuntimeException("Mülakat bulunamadı"));

      List<Answer> givenAnswers = answerRepository.findAllByInterviewId(interview.getId());

      List<Long> answeredQuestionIds = givenAnswers.stream()
                .map(a -> a.getQuestion().getId())
                .toList();
      
      List<Question> allQuestions = questionRepository.findAll();
      
      return allQuestions.stream()
                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                .findFirst()
                .orElse(null); // null dönerse mülakat bitmiş demektir
    }

    @Transactional
    public Answer submitAnswer(Long interviewId, Long questionId, String answerText) {
      Interview interview = interviewRepository.findById(interviewId)
      .orElseThrow(() -> new RuntimeException("Mülakat bulunamadı"));

      Question question = questionRepository.findById(questionId)
      .orElseThrow(() -> new RuntimeException("Soru bulunamadı"));

      String geminiResponse = geminiService.evaluateAnswer(question.getText(), answerText);

      String cleanJson = geminiResponse.replace("```json", "").replace("```", "").trim();
      
      int score = 0;
      String feedback = "";

      try {
        if(cleanJson.contains("\"score\":")) {
          String scorePart = cleanJson.split("\"score\":")[1].split(",")[0].trim();
          score = Integer.parseInt(scorePart);
      }
      if(cleanJson.contains("\"explanation\":")) {
        String expPart = cleanJson.split("\"explanation\":")[1];
        feedback = expPart.substring(expPart.indexOf("\"") + 1, expPart.lastIndexOf("\""));
      }
      } catch (Exception e) {
        System.out.println("JSON Parse Hatası: " + e.getMessage());
        score = 50;
        feedback = "Otomatik değerlendirme yapılamadı.";
      }

      Answer answer = new Answer();
      answer.setInterview(interview);
      answer.setQuestion(question);
      answer.setCandidateAnswer(answerText);
      answer.setAiFeedback(feedback);
      answer.setScore(score);

      return answerRepository.save(answer);
    }

    public List<Interview> getAllInterviews() {
      return interviewRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "startTime"));
  }
}