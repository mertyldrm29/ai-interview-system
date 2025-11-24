package com.backend.repository;

import com.backend.entity.Interview;
import com.backend.entity.enums.InterviewStatus; // Enum importu
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findAllByStatusAndStartTimeBefore(InterviewStatus status, LocalDateTime dateTime);
}