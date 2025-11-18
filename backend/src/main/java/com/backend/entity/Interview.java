package com.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bir kullanıcının birden fazla mülakatı olabilir mi?
    // Case'e göre tek seferlik gibi ama ManyToOne yapalım, esnek olsun.
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Mülakat puanı (Gemini'den gelen sonuçların ortalaması olabilir)
    private Integer score;

    // Mülakat durumu: PENDING, ACTIVE, COMPLETED, TERMINATED (atıldı)
    @Enumerated(EnumType.STRING)
    private InterviewStatus status; 

    public enum InterviewStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        TERMINATED
    }
}