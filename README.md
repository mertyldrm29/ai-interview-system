# 🚀 Yapay Zeka Destekli Akıllı Mülakat Sistemi (AI-Powered Interview System)

Bu proje, teknik mülakat süreçlerini otomatize etmek, adayların yetkinliklerini yapay zeka ile ölçmek ve mülakat güvenliğini (anti-cheat) sağlamak amacıyla geliştirilmiş **Full-Stack** bir web uygulamasıdır.

Proje; **React (TypeScript)**, **Spring Boot**, **PostgreSQL**, **Google Gemini AI** ve **MediaPipe** teknolojilerini kullanır.

---

## ✨ Temel Özellikler

### 🕵️‍♂️ Gelişmiş Gözetmenlik (Anti-Cheat) Modülü
* **Yüz Tespiti:** Google MediaPipe ile anlık görüntü analizi. Aday kameradan ayrılırsa veya ekrana başka biri girerse ihlal sayılır.
* **Odak Takibi:** Adayın sekme değiştirmesi (`Visibility API`) veya başka bir uygulamaya geçmesi (`Window Focus/Blur`) anında tespit edilir.
* **Adil Uyarı Sistemi:** Kullanıcı deneyimini bozmamak için **"Isınma Süresi" (Grace Period)** ve anlık hataları engellemek için **"Soğuma Süresi" (Cooldown)** mekanizmaları içerir.
* **Otomatik Sonlandırma:** 3 kritik ihlalden sonra mülakat otomatik olarak iptal edilir.

### 🧠 Yapay Zeka & Değerlendirme
* **Gemini Entegrasyonu:** Adayın cevapları anlık olarak Google Gemini 2.0 Flash modeline gönderilir.
* **Otomatik Puanlama:** Yapay zeka, cevabın teknik doğruluğuna göre 0-100 arası puan verir ve yorum yapar.
* **Dinamik Soru Havuzu:** Sorular veritabanından dinamik olarak çekilir (Data Seeding mevcuttur).

### 👮‍♂️ Yönetim & Raporlama
* **Admin Paneli:** Tüm mülakatların durumu (Tamamlandı, İhlal/Atıldı, Terk Etti) listelenir.
* **Detaylı Analiz:** Admin, her adayın hangi soruya ne cevap verdiğini ve yapay zeka yorumunu görebilir.
* **İhlal Zaman Çizelgesi:** Adayın hangi saniyede ne tür bir ihlal yaptığı (Örn: "14:30 - Sekme Değişikliği") detaylıca raporlanır.
* **Oturum Temizliği:** Mülakatı yarıda bırakıp giden adaylar, arka planda çalışan **Cron Job** ile 15 dakika sonra "TERK ETTİ" (ABANDONED) statüsüne çekilir.
* **JWT Güvenliği:** Admin paneli JSON Web Token (JWT) ile korunmaktadır.
* **Mail Bildirimi:** Mülakat bitiminde yöneticiye otomatik özet maili gönderilir.

---

## 🛠️ Kullanılan Teknolojiler

| Alan | Teknoloji |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Axios |
| **Backend** | Java 17, Spring Boot 3, Spring Data JPA, Spring Scheduler |
| **Veritabanı** | PostgreSQL |
| **Yapay Zeka** | Google Gemini API, MediaPipe Tasks Vision |
| **Güvenlik** | JJWT (JSON Web Token), Custom Interceptors |
| **Diğer** | JavaMailSender (SMTP), Lombok |

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Ön Hazırlık
* Bilgisayarınızda **Node.js**, **Java JDK 17+** ve **PostgreSQL** kurulu olmalıdır.
* PostgreSQL'de `interview_db` adında boş bir veritabanı oluşturun.
* Google AI Studio'dan bir **Gemini API Key** alın.
* Mail gönderimi için Gmail **Uygulama Şifresi** (App Password) alın.

### 2. Backend Kurulumu

1.  `backend` klasörüne gidin.
2.  Ortam değişkenlerini (Environment Variables) ayarlayın. IDE'nizin (IntelliJ/VS Code) "Run Configuration" kısmına şunları ekleyin:
    ```properties
    DB_USERNAME=postgres
    DB_PASSWORD=senin_db_sifren
    GEMINI_API_KEY=senin_gemini_keyin
    MAIL_USERNAME=gonderici_mail_hesabi
    MAIL_PASSWORD=senin_gmail_app_sifren
    ADMIN_EMAIL=sonuclari_alacak_mail_hesabi
    JWT_SECRET=en_az_32_karakterlik_cok_gizli_random_bir_string
    ```
3.  Projeyi başlatın:
    ```bash
    mvn spring-boot:run
    ```
    *(Uygulama 8080 portunda çalışacaktır)*

### 3. Frontend Kurulumu

1.  `frontend` klasörüne gidin.
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Uygulamayı başlatın:
    ```bash
    npm start
    ```
    *(Uygulama http://localhost:3000 adresinde çalışacaktır)*

---

## 🖥️ Kullanım Senaryoları

### Aday Girişi
1.  Ana sayfada Ad, Soyad, Email ve Telefon bilgileriyle giriş yapılır.
2.  Kamera izni verilir ve mülakat başlar.
3.  Sorular cevaplanır ve sistem yapay zeka ile puanlar.

### Admin Girişi
1.  `/admin` adresine gidilir (veya ana sayfadaki butondan).
2.  **Giriş Bilgileri (Demo Hesabı):**
    * *Not: Test kolaylığı açısından yönetici bilgileri backend tarafında sabit (hardcoded) olarak tanımlanmıştır* 
    * **Kullanıcı Adı:** `admin`
    * **Şifre:** `admin`
3.  Panelden tüm başvurular incelenebilir.

---

## ⚠️ Önemli Notlar

* **Güvenlik:** API anahtarları ve veritabanı şifreleri GitHub reposunda yer almaz. Projeyi çalıştırırken kendi anahtarlarınızı kullanmalısınız.
* **Cron Job:** "Terk Etti" durumunun test edilmesi için Scheduler 1 dakikaya ayarlanabilir, varsayılan süre 15 dakikadır.

---

## 👨‍💻 Geliştirici

Bu proje **[Mert Yıldırım]** tarafından geliştirilmiştir.