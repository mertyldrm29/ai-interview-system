package com.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import com.backend.entity.WarningLog;
import com.backend.entity.Interview;
import com.backend.entity.User;
import com.backend.repository.InterviewRepository;
import com.backend.repository.UserRepository;
import com.backend.repository.WarningLogRepository;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class InterviewService {
  private final UserRepository userRepository;
  private final InterviewRepository interviewRepository;
  private final WarningLogRepository warningLogRepository;

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
        }
        
        return interviewRepository.save(interview);
    }

}