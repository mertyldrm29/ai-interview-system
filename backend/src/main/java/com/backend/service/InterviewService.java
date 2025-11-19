package com.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.backend.entity.Interview;
import com.backend.entity.Interview.InterviewStatus;
import com.backend.entity.User;
import com.backend.repository.InterviewRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewService {
  private final UserRepository userRepository;
  private final InterviewRepository interviewRepository;

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
    interview.setStatus(InterviewStatus.ACTIVE);
    return interviewRepository.save(interview);
  }



}
