package com.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findAllByInterviewId(Long interviewId);
}
