package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.WarningLog;

public interface WarningLogRepository extends JpaRepository<WarningLog, Long> {
    long countByInterviewId(Long interviewId);
}