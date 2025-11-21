package com.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;


@Data
@Entity
@Table(name = "answers")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Interview interview;

    @ManyToOne
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String candidateAnswer;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    private Integer score;
}
