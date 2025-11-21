package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    
}
