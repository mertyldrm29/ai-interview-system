package com.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GeminiService {
    private final RestTemplate restTemplate;
    
    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public String evaluateAnswer(String question, String answer){
        String url = GEMINI_URL + "?key=" + apiKey;

        String prompt = "Sen bir teknik mülakat uzmanısın. \n" +
         "Soru: " + question + "\n" +
        "Adayın Cevabı: " + answer + "\n" +
        "Bu cevabı teknik doğruluk açısından değerlendir. \n" +
        "Bana SADECE şu formatta bir JSON ver, başka hiçbir metin ekleme:\n" +
        "{\"score\": (1-100 arası puan), \"explanation\": \"2 cümlelik kısa yorum\" }";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", List.of(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(parts));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");

            return (String) responseParts.get(0).get("text");
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"score\": 0, \"explanation\": \"Yapay zeka bağlantı hatası oluştu: " + e.getMessage() + "\"}" ;
        }
    }



}
