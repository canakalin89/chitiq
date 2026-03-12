
# 🚀 ChitIQ - AI-Powered Speaking Evaluator & Exam Assistant

[English](#english) | [Türkçe](#türkçe)

---

<a name="english"></a>
## 🇬🇧 English: Professional Overview

**ChitIQ** is a state-of-the-art Web application built for modern English language education. It serves as a dual-purpose tool: a personal practice assistant for students and a high-efficiency assessment suite for teachers.

### 🌟 Vision & Pedagogical Alignment
ChitIQ is specifically designed to align with the **"Century of Türkiye Education Model" (Türkiye Yüzyılı Maarif Modeli)** and the **Common European Framework of Reference for Languages (CEFR)**. It focuses on holistic language production rather than just rote memorization.

### 🛠 Key Features

#### 👨‍🏫 For Teachers (Exam Mode & Management)
- **Teacher Exam Mode**: Conduct speaking exams with professional precision. 
- **Lucky Wheel Selection**: Gamify the exam process. Select curriculum-based questions and let the wheel decide the student's task with realistic physics and 3D animations.
- **Class & Student Management**: Create classes (e.g., 9-A, 11-B), bulk-add students using a simple text format, and manage individual student profiles.
- **Automated Analytics**: View class averages and compare performance metrics between different classes.
- **Professional PDF Reports**: Generate "Class Achievement Reports" or "Individual Assessment Reports" that are ready to print, featuring radar charts and signature lines.

#### 🎓 For Students (Practice & Growth)
- **Real-Time Live Transcription**: Powered by **Gemini Live API**, the app provides a verbatim transcript of the student's speech as they talk.
- **Interactive Recorder**: Visual feedback with real-time soundwave animations and silence detection.
- **Instant AI Feedback**: Within seconds of finishing, receive a score (0-100) and detailed pedagogical feedback in Turkish or English.
- **Practice Wheel**: Use the wheel for self-study to challenge yourself with random topics.
- **History Tracking**: Keep a local record of all attempts to visualize progress over time.

### 📊 Evaluation Metrics
The AI (Gemini 3 Pro) evaluates every recording based on five core pillars:
1.  **Rapport**: Confidence, volume, and natural social flow.
2.  **Organisation**: Logical structure (Intro/Body/Conclusion) and use of discourse markers.
3.  **Delivery**: Fluency, intonation patterns, and IPA-based pronunciation analysis.
4.  **Language Use**: Grammatical accuracy and lexical variety (CEFR A2-B2 level).
5.  **Creativity**: Depth of ideas, use of idioms, and original thought.

### 💻 Technical Stack
- **Framework**: React 19 (Modern Hooks, Context)
- **Language**: TypeScript (Strict typing for reliability)
- **Styling**: Tailwind CSS (Custom mesh backgrounds, aurora blobs, glassmorphism)
- **AI Engine**: 
  - `gemini-3-pro-preview` (For deep pedagogical evaluation)
  - `gemini-2.5-flash-native-audio-preview-09-2025` (For real-time transcription)
- **i18n**: Multi-language support with `i18next`.
- **Animations**: Framer-motion inspired CSS keyframes, high-performance canvas visualizers.

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe: Profesyonel Bakış

**ChitIQ**, modern İngilizce eğitimi için geliştirilmiş, öğrenci pratik asistanı ve öğretmen sınav yönetim panelini tek bir çatıda toplayan kapsamlı bir web uygulamasıdır.

### 🌟 Vizyon ve Eğitsel Uyum
ChitIQ, **"Türkiye Yüzyılı Maarif Modeli"** vizyonuna ve **Avrupa Ortak Dil Çerçevesi (CEFR)** kriterlerine tam uyumlu olarak geliştirilmiştir. Sadece kelime bilgisini değil, bütüncül konuşma üretimini ölçmeyi hedefler.

### 🛠 Temel Özellikler

#### 👨‍🏫 Öğretmenler İçin (Sınav Modu ve Yönetim)
- **Öğretmen Sınav Modu**: Konuşma sınavlarını profesyonel bir standartta gerçekleştirin.
- **Şans Çarkı (Lucky Wheel)**: Sınav sürecini oyunlaştırın. Müfredat sorularını seçin ve gerçekçi fizik kurallarıyla çalışan çarkın öğrenciye sorusunu seçmesini izleyin.
- **Sınıf ve Öğrenci Yönetimi**: Sınıflar oluşturun, öğrenci listelerini toplu olarak saniyeler içinde ekleyin.
- **Gelişmiş Analizler**: Sınıf ortalamalarını görün ve farklı sınıfların performans metriklerini karşılaştırın.
- **Profesyonel Raporlama**: Baskıya hazır, radar grafikli ve imza alanlı "Sınıf Başarı Raporları" ve "Bireysel Sınav Analizleri" oluşturun.

#### 🎓 Öğrenciler İçin (Pratik ve Gelişim)
- **Anlık Canlı Deşifre**: **Gemini Live API** sayesinde, öğrenci konuşurken kelimeleri anlık olarak ekranda belirir.
- **İnteraktif Kayıt Cihazı**: Gerçek zamanlı ses dalgaları, sessizlik uyarısı ve süre takibi.
- **Anlık Yapay Zeka Geri Bildirimi**: Kayıt biter bitmez 5 farklı kriterde 100 üzerinden puanlama ve Türkçe/İngilizce detaylı analiz.
- **Kişisel Pratik Çarkı**: Rastgele konular seçerek kendi kendine çalışma imkanı.
- **Gelişim Geçmişi**: Tüm denemeleri tarayıcıda saklayarak zaman içindeki değişimi gözlemleme.

### 📊 Değerlendirme Kriterleri
Yapay Zeka (Gemini 3 Pro), her kaydı beş temel pedagojik sütunda inceler:
1.  **Uyum (Rapport)**: Özgüven, ses seviyesi ve doğal etkileşim akışı.
2.  **Organizasyon (Organisation)**: Mantıksal yapı (Giriş/Gelişme/Sonuç) ve bağlaç kullanımı.
3.  **Sunum (Delivery)**: Akıcılık, tonlama ve IPA tabanlı detaylı telaffuz analizi.
4.  **Dil Kullanımı (Language Use)**: Dilbilgisi doğruluğu ve kelime çeşitliliği (A2-B2 seviyesi).
5.  **Yaratıcılık (Creativity)**: Fikir derinliği, deyim kullanımı ve özgün bakış açısı.

### 💻 Teknolojik Yapı
- **Arayüz**: React 19
- **Dil**: TypeScript
- **Tasarım**: Tailwind CSS (Özel mesh arka planlar, aurora efektleri, glassmorphism)
- **Yapay Zeka Motoru**: 
  - `gemini-3-pro-preview` (Pedagojik değerlendirme için)
  - `gemini-2.5-flash-native-audio-preview-09-2025` (Canlı yayın deşifre için)
- **Dil Desteği**: i18next (Türkçe & İngilizce)
- **Görselleştirme**: HTML5 Canvas tabanlı ses görselleştirici ve 3D görünümlü şans çarkı.

---

### 🚀 Setup / Kurulum
1.  **API Key**: Projenin çalışması için `process.env.API_KEY` değişkenine geçerli bir Google Gemini API anahtarı gereklidir.
2.  **Install**: `npm install`
3.  **Start**: `npm start`

*Developed by [Can AKALIN](https://instagram.com/can_akalin)*
