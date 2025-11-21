package com.backend.config;

import org.springframework.stereotype.Component;

import com.backend.entity.Question;
import com.backend.repository.QuestionRepository;

import java.util.List;

import org.springframework.boot.CommandLineRunner;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final QuestionRepository questionRepository;

    @Override
    public void run(String... args) throws Exception {
        if(questionRepository.count() == 0) {
            List<Question> questions = List.of(
                createQuestion("Java'da 'Garbage Collector' nasıl çalışır ve ne işe yarar?", "Java"),
                createQuestion("React'ta 'useEffect' hook'u ne zaman tetiklenir?", "React"),
                createQuestion("RESTful API nedir ve HTTP metodlarını açıklar mısınız?", "General"),
                createQuestion("Spring Boot'ta 'Dependency Injection' (Bağımlılık Enjeksiyonu) nedir?", "Spring"),
                createQuestion("SQL'de 'JOIN' türleri nelerdir, farkları nedir?", "Database")
            );
            questionRepository.saveAll(questions);
            System.out.println("Veritabanına 5 adet soru eklendi.");
        }
    }
    
    private Question createQuestion(String text, String tech) {
        Question q = new Question();
        q.setText(text);
        q.setTechStack(tech);
        return q;
    }
    
}
