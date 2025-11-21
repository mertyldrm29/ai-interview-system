package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    
}