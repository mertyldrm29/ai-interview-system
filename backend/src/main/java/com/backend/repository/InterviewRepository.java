package com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.entity.Interview;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    // İleride "Aktif mülakatları getir" gibi metodlar gerekirse buraya yazılır.
}