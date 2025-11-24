package com.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.WarningLog;

public interface WarningLogRepository extends JpaRepository<WarningLog, Long> {
    long countByInterviewId(Long interviewId);
    List<WarningLog> findAllByInterviewId(Long interviewId);
}