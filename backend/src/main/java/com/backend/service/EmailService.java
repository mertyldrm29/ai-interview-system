package com.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendResultEmail(String toEmail, String candidateName, int totalScore, int warningCount, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Mülakat Sonucu: " + candidateName);

        String body = "Sayın Yönetici,\n\n" + 
        candidateName + " isimli adayın mülakatı tamamlandı.\n" +
        "--------------------------------------------------\n" +
        "Durum: " + status + "\n" +
        "Toplam Puan: " + totalScore + "\n" +
        "İhlal/Uyarı Sayısı: " + warningCount + "\n" +
        "--------------------------------------------------\n" +
        "Detaylar için admin paneline bakınız.\n\n" +
        "İyi çalışmalar.";

        message.setText(body);

        try {
            mailSender.send(message);
            System.out.println("📧 Mail başarıyla gönderildi: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Mail gönderme hatası: " + e.getMessage());
        }
    }
}
