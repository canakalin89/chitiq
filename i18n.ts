
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app: {
        title: "ChitIQ",
        subtitle: "Your Smart Speaking Assistant"
      },
      common: {
        goBack: "Go Back",
        cancel: "Cancel",
        save: "Save",
        summary: "Summary",
        history: "History",
        viewAllHistory: "View All History",
        clearAll: "Clear All",
        delete: "Delete",
        confirmDeleteAll: "Are you sure you want to delete all history?",
        confirmDelete: "Delete this item?",
        retry: "Try Again",
        start: "Start",
        requestAccess: "Grant Permission",
        print: "Print / Save as PDF",
        send: "Send",
        evaluate: "Evaluate Now",
        reviewRecording: "Review Recording"
      },
      dashboard: {
        selectTask: "Select Topic",
        recentAttempts: "Recent Attempts",
        startRecording: "Start Recording",
        stopRecording: "Stop Recording",
        processing: "Processing...",
        recording: "Recording...",
        usageCount: "Total Practices",
        examMode: "Teacher Exam Mode",
        examModeDesc: "Create exams, pick questions with a lucky wheel, and download professional reports.",
        wheelPractice: "Lucky Wheel Practice",
        wheelPracticeDesc: "Feeling lucky? Select multiple topics and let the wheel decide your next challenge.",
        manageClasses: "Class Management",
        analytics: "Analytics & Comparison",
        processingSteps: {
          uploading: "Uploading audio...",
          transcribing: "Transcribing speech...",
          analyzing: "Analyzing metrics...",
          finalizing: "Finalizing report..."
        },
        estimatedTime: "Estimated time: ~{{seconds}}s",
        studentEvaluationMode: "Student Evaluation Mode (Maarif Model)",
        studentEvaluationModeDesc: "When active, evaluation is more flexible and growth-oriented based on the Century of Türkiye Education Model."
      },
      exam: {
        title: "Speaking Exam Session",
        practiceTitle: "Lucky Wheel Selection",
        beginExam: "Start Speaking",
        studentInfo: "Student Details",
        selectClass: "Select Class",
        selectStudent: "Select Student",
        studentNumber: "Student Number",
        firstName: "First Name",
        lastName: "Last Name",
        class: "Class/Grade",
        selectQuestions: "Select Questions for the Wheel",
        addCustom: "Add Custom Question",
        mergeSelected: "Combine Selected Questions",
        minQuestions: "Please select at least 2 questions.",
        selectedQuestionsCount: "{{count}} questions selected",
        startWheel: "Open Lucky Wheel",
        spinWheel: "Spin the Wheel",
        spinning: "Spinning...",
        reportTitle: "Speaking Assessment Exam Report",
        examDate: "Date",
        selectedTopic: "Exam Topic",
        teacherNotes: "Teacher's Assessment Notes"
      },
      classes: {
        title: "Class Management",
        addClass: "Add New Class",
        className: "Class Name (e.g. 9-A)",
        noClasses: "No classes created yet.",
        studentList: "Student List",
        bulkAdd: "Bulk Add",
        bulkHelp: "Format: 'Number FirstName LastName' (one per line)",
        bulkPlaceholder: "101 Ahmet Yılmaz\n102 Ayşe Demir",
        addStudent: "Add Student",
        avgScore: "Average Score",
        totalExams: "Total Exams",
        examHistory: "Exam History",
        noAttempts: "No exams recorded yet.",
        classReport: "Generate Class Report"
      },
      analytics: {
        title: "Performance Analytics",
        averageScore: "Class Average",
        classComparison: "Class Comparison",
        selectClasses: "Select classes to compare metrics",
        classReportTitle: "Class Achievement Report"
      },
      evaluation: {
        overallScore: "Overall Score",
        pronunciation: "Pronunciation Feedback",
        transcription: "Speech Transcription",
        reportTitle: "Speaking Performance Analysis Report"
      },
      history: {
        title: "Practice History",
        empty: "No history found yet."
      },
      recorder: {
        micHelp: "Please ensure your microphone is connected and you have granted permission in your browser settings.",
        readyPrompt: "Ready to start speaking?",
        startHint: "Click the button to enable your microphone and start recording.",
        speakUp: "Please speak a bit louder!",
        listening: "Listening...",
        liveNote: "Live transcription is for reference; final assessment will be more accurate.",
        liveLabel: "LIVE"
      },
      feedback: {
        title: "Send Feedback",
        desc: "Your thoughts help us improve. Write a comment or suggestion below.",
        placeholder: "Your message...",
        name: "Full Name",
        success: "Thank you! Your feedback has been sent.",
        writeBtn: "Write a Comment"
      },
      landing: {
        heroTitle: "Master Your Speaking Exams",
        heroDesc: "The ultimate AI assistant for English teachers and students.",
        badge: "Prepared in accordance with the Century of Türkiye Education Model",
        startBtn: "Start Practicing",
        howItWorks: "How It Works",
        howDesc: "Achieve fluency in three simple steps.",
        step1Title: "Pick Your Topic",
        step1Desc: "Choose from curriculum-based speaking tasks.",
        step2Title: "Record & Transcribe",
        step2Desc: "Speak naturally. AI transcribes your words in real-time.",
        step3Title: "Smart Analysis",
        step3Desc: "Get instant scores and accurate feedback on 5 metrics.",
        criteriaTitle: "Evaluation Metrics",
        criteriaDesc: "Our AI evaluates performance based on core pedagogical pillars.",
        criteriaDetails: {
          rapport: {
            title: "Rapport",
            desc: "How you start the conversation and connect with the listener.",
            tips: "Start with a greeting, speak vibrantly as if making eye contact."
          },
          organisation: {
            title: "Organisation",
            desc: "Ability to present thoughts in a logical order (Intro, Body, Conclusion).",
            tips: "Use connectors like 'First', 'Second', 'Finally' to link your ideas."
          },
          delivery: {
            title: "Delivery",
            desc: "Your speaking speed, pronunciation, and intonation.",
            tips: "Don't speak too fast or too slow, try to pronounce words clearly."
          },
          languageUse: {
            title: "Language Use",
            desc: "Vocabulary variety and grammatical accuracy.",
            tips: "Try synonyms instead of repeating words, and use tenses correctly."
          },
          creativity: {
            title: "Creativity",
            desc: "How original and interesting you handle the topic.",
            tips: "Add your own ideas and interesting details beyond basic information."
          }
        },
        testimonialsTitle: "User Reviews",
        teacherTestimonials: {
          star5: [
            { name: "Selin A.", role: "English Teacher", comment: "The lucky wheel feature turned my exams into a fun activity! My students are finally excited." },
            { name: "Murat B.", role: "English Teacher", comment: "Saves me hours of manual grading. Aligns perfectly with the new curriculum standards." },
            { name: "Canan C.", role: "English Teacher", comment: "The AI analysis is incredibly accurate and provides objective results." },
            { name: "Ahmet D.", role: "English Teacher", comment: "Highly recommended for high school teachers. It's a game changer." },
            { name: "Elif E.", role: "English Teacher", comment: "My students' pronunciation improved drastically after regular use." },
            { name: "Burak F.", role: "English Teacher", comment: "The reporting system is professional and useful for official records." }
          ],
          star4: [
            { name: "Zeynep G.", role: "English Teacher", comment: "Great for class engagement. Kids love the competitive scores." },
            { name: "Deniz H.", role: "English Teacher", comment: "Very effective for individual speaking homework." },
            { name: "Merve I.", role: "English Teacher", comment: "The transcript feature helps identify common grammatical mistakes." },
            { name: "Kerem J.", role: "English Teacher", comment: "User-friendly interface and fast processing. A solid classroom companion." },
            { name: "Pelin K.", role: "English Teacher", comment: "Bridges the gap between theory and practice perfectly." },
            { name: "Hakan L.", role: "English Teacher", comment: "Detailed feedback allows students to work independently." }
          ],
          star3: [
            { name: "Sibel M.", role: "English Teacher", comment: "Useful tool, works best in quiet environments." },
            { name: "Tolga N.", role: "English Teacher", comment: "Helps set a standard for grading. Very helpful." },
            { name: "Ayşe O.", role: "English Teacher", comment: "Provides a good baseline for speaking levels." },
            { name: "Okan P.", role: "English Teacher", comment: "Interesting concept. My students find it helpful for exam prep." },
            { name: "Nihal R.", role: "English Teacher", comment: "A good assistant for large classes." }
          ]
        },
        studentTestimonials: {
          star5: [
            { name: "Arda A.", role: "9th Grade Student", comment: "I was so scared of exams, but this made me feel like a pro. I got a 100!" },
            { name: "Selin B.", role: "11th Grade Student", comment: "The pronunciation corrections are so helpful. I fixed my common errors." },
            { name: "Mert C.", role: "10th Grade Student", comment: "Seeing my score go up every week is super motivating." },
            { name: "Ece D.", role: "12th Grade Student", comment: "Great for YDT preparation. Amazing tool!" },
            { name: "Umut E.", role: "9th Grade Student", comment: "The topics are exactly what we see in school. No surprises!" },
            { name: "Defne F.", role: "10th Grade Student", comment: "It feels like having a private tutor at home. Clear feedback." }
          ],
          star4: [
            { name: "Berk G.", role: "11th Grade Student", comment: "Really easy to use. I feel much more confident now." },
            { name: "Azra H.", role: "12th Grade Student", comment: "The transcript helps me see exactly what I said wrong." },
            { name: "Emre I.", role: "9th Grade Student", comment: "Cool design and the wheel is fun. My English is getting better." },
            { name: "Melis J.", role: "10th Grade Student", comment: "Helps me overcome my fear of speaking." },
            { name: "Kaan K.", role: "11th Grade Student", comment: "Good practice for real-life conversations too." },
            { name: "Irmak L.", role: "12th Grade Student", comment: "Fast and effective feedback every time." }
          ],
          star3: [
            { name: "Can M.", role: "9th Grade Student", comment: "Good for practice but needs a quiet room." },
            { name: "Beril N.", role: "10th Grade Student", comment: "Useful app. I like comparing my scores." },
            { name: "Onur O.", role: "11th Grade Student", comment: "Helps me prepare for the speaking section." },
            { name: "Simge P.", role: "12th Grade Student", comment: "Good for testing my level before exams." },
            { name: "Yiğit R.", role: "11th Grade Student", comment: "A helpful app to check pronunciation." }
          ]
        }
      },
      errors: {
        micTitle: "Microphone Error",
        micPermission: "Microphone access is required. Please enable it in your browser settings.",
        generic: "Something went wrong. Please try again.",
        noSpeechDetected: "No speech detected. Please speak clearly."
      }
    }
  },
  tr: {
    translation: {
      app: {
        title: "ChitIQ",
        subtitle: "Akıllı Konuşma Asistanınız"
      },
      common: {
        goBack: "Geri Dön",
        cancel: "İptal",
        save: "Kaydet",
        summary: "Özet",
        history: "Geçmiş",
        viewAllHistory: "Tüm Geçmişi Gör",
        clearAll: "Tümünü Temizle",
        delete: "Sil",
        confirmDeleteAll: "Tüm geçmişi silmek istediğinize emin misiniz?",
        confirmDelete: "Bu kaydı sil?",
        retry: "Tekrar Dene",
        start: "Başlat",
        requestAccess: "İzin Ver",
        print: "Yazdır / PDF Olarak Kaydet",
        send: "Gönder",
        evaluate: "Değerlendir",
        reviewRecording: "Kaydı İncele"
      },
      dashboard: {
        selectTask: "Konu Seçin",
        recentAttempts: "Son Denemeler",
        startRecording: "Kaydı Başlat",
        stopRecording: "Kaydı Bitir",
        processing: "İşleniyor...",
        recording: "Kaydediliyor...",
        usageCount: "Toplam Pratik",
        examMode: "Öğretmen Sınav Modu",
        examModeDesc: "Sınav oturumları oluşturun, soruları çarkla seçin ve profesyonel raporlar alın.",
        wheelPractice: "Şans Çarkı ile Pratik",
        wheelPracticeDesc: "Kendine güveniyor musun? Birden fazla konu seç ve şans çarkının senin için bir görev belirlemesine izin ver.",
        manageClasses: "Sınıf Yönetimi",
        analytics: "Analiz ve Karşılaştırma",
        processingSteps: {
          uploading: "Ses yükleniyor...",
          transcribing: "Konuşma deşifre ediliyor...",
          analyzing: "Metrikler analiz ediliyor...",
          finalizing: "Rapor hazırlanıyor..."
        },
        estimatedTime: "Tahmini süre: ~{{seconds}}sn",
        studentEvaluationMode: "Öğrenci Değerlendirme Modu (Maarif Modeli)",
        studentEvaluationModeDesc: "Bu mod aktifken, değerlendirme Türkiye Yüzyılı Maarif Modeli kriterlerine göre daha esnek ve gelişim odaklı yapılır."
      },
      exam: {
        title: "Konuşma Sınavı Oturumu",
        practiceTitle: "Şans Çarkı Seçimi",
        beginExam: "Konuşmaya Başla",
        studentInfo: "Öğrenci Bilgileri",
        selectClass: "Sınıf Seçin",
        selectStudent: "Öğrenci Seçin",
        studentNumber: "Okul No",
        firstName: "Adı",
        lastName: "Soyadı",
        class: "Sınıfı",
        selectQuestions: "Çark Sorularını Seçin",
        addCustom: "Özel Soru Ekle",
        mergeSelected: "Seçilen Soruları Birleştir",
        minQuestions: "Lütfen en az 2 soru seçin.",
        selectedQuestionsCount: "{{count}} soru seçildi",
        startWheel: "Şans Çarkını Aç",
        spinWheel: "Çarkı Çevir",
        spinning: "Çevriliyor...",
        reportTitle: "Konuşma Sınavı Analiz Raporu",
        examDate: "Tarih",
        selectedTopic: "Sınav Konusu",
        teacherNotes: "Öğretmen Değerlendirme Notları"
      },
      classes: {
        title: "Sınıf Yönetimi",
        addClass: "Yeni Sınıf Ekle",
        className: "Sınıf Adı (Örn: 9-A)",
        noClasses: "Henüz sınıf oluşturulmadı.",
        studentList: "Öğrenci Listesi",
        bulkAdd: "Toplu Ekle",
        bulkHelp: "Format: 'No Ad Soyad' (her satıra bir kişi)",
        bulkPlaceholder: "101 Ahmet Yılmaz\n102 Ayşe Demir",
        addStudent: "Öğrenci Ekle",
        avgScore: "Ortalama Puan",
        totalExams: "Toplam Sınav",
        examHistory: "Sınav Geçmişi",
        noAttempts: "Henüz sınav kaydı yok.",
        classReport: "Sınıf Raporu Al"
      },
      analytics: {
        title: "Performans Analizi",
        averageScore: "Sınıf Ortalaması",
        classComparison: "Sınıf Karşılaştırma",
        selectClasses: "Karşılaştırmak istediğiniz sınıfları seçin",
        classReportTitle: "Sınıf Başarı Raporu"
      },
      evaluation: {
        overallScore: "Genel Puan",
        pronunciation: "Telaffuz Geri Bildirimi",
        transcription: "Konuşma Dökümü",
        reportTitle: "Konuşma Performans Analiz Raporu"
      },
      history: {
        title: "Pratik Geçmişi",
        empty: "Henüz kayıt bulunamadı."
      },
      recorder: {
        micHelp: "Mikrofon erişimi gerekli. Lütfen tarayıcı ayarlarınızdan izin verin.",
        readyPrompt: "Konuşmaya başlamaya hazır mısın?",
        startHint: "Butona tıkladığında mikrofonun etkinleşecek ve kayıt başlayacaktır.",
        speakUp: "Lütfen biraz daha yüksek sesle konuşun!",
        listening: "Dinliyor...",
        liveNote: "Anlık deşifre referans amaçlıdır; nihai analiz çok daha hassas olacaktır.",
        liveLabel: "CANLI"
      },
      feedback: {
        title: "Yorum Yapın",
        desc: "Düşünceleriniz bizim için değerli. Lütfen öneri veya yorumunuzu aşağıya yazın.",
        placeholder: "Mesajınız...",
        name: "Adınız Soyadınız",
        success: "Teşekkürler! Yorumunuz başarıyla iletildi.",
        writeBtn: "Yorum Yaz"
      },
      landing: {
        heroTitle: "Konuşma Sınavlarında Başarıyı Yakalayın",
        heroDesc: "İngilizce öğretmenleri ve öğrencileri için akıllı yapay zeka asistanı.",
        badge: "Türkiye Yüzyılı Maarif Modeli'ne uygun olarak hazırlanmıştır",
        startBtn: "Çalışmaya Başla",
        howItWorks: "Nasıl Çalışır?",
        howDesc: "Akıcı konuşmaya üç basit adımda ulaşın.",
        step1Title: "Konu Seçin",
        step1Desc: "Müfredata uygun konuşma görevlerinden birini belirleyin.",
        step2Title: "Kaydet & Çözümle",
        step2Desc: "Doğal konuşun, yapay zeka sesinizi anlık olarak yazıya döksün.",
        step3Title: "Akıllı Analiz",
        step3Desc: "5 kriterde anlık puan ve detaylı geri bildirim alın.",
        criteriaTitle: "Değerlendirme Kriterleri",
        criteriaDesc: "Yapay zekamız performansınızı Maarif Modeli kriterleriyle puanlar.",
        criteriaDetails: {
          rapport: {
            title: "Uyum",
            desc: "Konuşmaya nasıl başladığınız ve dinleyiciyle kurduğunuz bağ.",
            tips: "Selamlama ile başlayın, canlı ve etkileşimli bir ton kullanın."
          },
          organisation: {
            title: "Organizasyon",
            desc: "Düşüncelerinizi mantıklı bir sırayla (Giriş, Gelişme, Sonuç) sunma.",
            tips: "'First', 'Second', 'Finally' gibi bağlaçlar kullanarak akışı sağlayın."
          },
          delivery: {
            title: "Sunum",
            desc: "Konuşma hızınız, telaffuzunuz ve tonlamanız.",
            tips: "Çok hızlı veya yavaş konuşmayın, kelimeleri net telaffuz edin."
          },
          languageUse: {
            title: "Dil Kullanımı",
            desc: "Kelime çeşitliliği ve dilbilgisi doğruluğu.",
            tips: "Aynı kelimeleri tekrarlamak yerine eş anlamlılarını kullanmaya çalışın."
          },
          creativity: {
            title: "Yaratıcılık",
            desc: "Konuyu ne kadar özgün ve ilgi çekici bir şekilde ele aldığınız.",
            tips: "Sadece temel bilgileri vermeyin, kendi fikirlerinizi ve detayları ekleyin."
          }
        },
        testimonialsTitle: "Kullanıcı Yorumları",
        teacherTestimonials: {
          star5: [
            { name: "Selin A.", role: "İngilizce Öğretmeni", comment: "Çark özelliği konuşma sınavlarını eğlenceli bir aktiviteye dönüştürdü. 9. sınıflarım artık derse çok daha istekli." },
            { name: "Murat B.", role: "İngilizce Öğretmeni", comment: "Yeni müfredatın gerektirdiği tüm analizleri saniyeler içinde raporlayabiliyorum. Büyük kolaylık." },
            { name: "Canan C.", role: "İngilizce Öğretmeni", comment: "Yapay zeka analizi inanılmaz derecede isabetli. Objektif sonuçlar sunuyor." },
            { name: "Ahmet D.", role: "İngilizce Öğretmeni", comment: "Lise öğretmenlerinin ihtiyaçlarını gerçekten anlayan bir uygulama. Kesinlikle tavsiye ediyorum." },
            { name: "Elif E.", role: "İngilizce Öğretmeni", comment: "Geri bildirim özelliği sayesinde öğrencilerimin telaffuz hataları gözle görülür şekilde azaldı." },
            { name: "Burak F.", role: "İngilizce Öğretmeni", comment: "Raporlama sistemi çok profesyonel. Resmi evraklarımda gönül rahatlığıyla kullanıyorum." }
          ],
          star4: [
            { name: "Zeynep G.", role: "İngilizce Öğretmeni", comment: "Sınıf içi katılımı artırmak için harika bir araç. Puanlar öğrencileri motive ediyor." },
            { name: "Deniz H.", role: "İngilizce Öğretmeni", comment: "Bireysel pratikler için çok etkili. Ödev takibi için kullanıyorum." },
            { name: "Merve I.", role: "İngilizce Öğretmeni", comment: "Döküm özelliği sınıf genelindeki hataları tespit etmemde yardımcı oluyor." },
            { name: "Kerem J.", role: "İngilizce Öğretmeni", comment: "Kullanıcı dostu arayüzü ve hızlı işlem gücüyle derslerin vazgeçilmez bir parçası oldu." },
            { name: "Pelin K.", role: "İngilizce Öğretmeni", comment: "Teorik bilgi ile pratik arasındaki boşluğu mükemmel şekilde dolduruyor." },
            { name: "Hakan L.", role: "İngilizce Öğretmeni", comment: "Detaylı geri bildirimler öğrencilerin eksiklerini kendilerinin görmesini sağlıyor." }
          ],
          star3: [
            { name: "Sibel M.", role: "İngilizce Öğretmeni", comment: "Kullanışlı uygulama, sessiz ortamlarda çok daha başarılı." },
            { name: "Tolga N.", role: "İngilizce Öğretmeni", comment: "Puanlama standartı oluşturmak için güzel bir yardımcı." },
            { name: "Ayşe O.", role: "İngilizce Öğretmeni", comment: "Seviye belirleme için güzel bir temel sunuyor." },
            { name: "Okan P.", role: "İngilizce Öğretmeni", comment: "İlginç bir konsept. Sınav hazırlık sürecinde faydalı bulduk." },
            { name: "Nihal R.", role: "İngilizce Öğretmeni", comment: "Kalabalık sınıflarda tek tek dinleyemediğim durumlar için ideal." }
          ]
        },
        studentTestimonials: {
          star5: [
            { name: "Arda A.", role: "9. Sınıf Öğrencisi", comment: "Sınavda heyecandan konuşamıyordum. ChitIQ ile çalıştım ve sonunda 100 aldım!" },
            { name: "Selin B.", role: "11. Sınıf Öğrencisi", comment: "Telaffuzumu düzeltmek için harika. Kelimeleri yanlış söyleyince hemen uyarıyor." },
            { name: "Mert C.", role: "10. Sınıf Öğrencisi", comment: "Geçmiş puanlarımı görmek beni çok motive ediyor. Her hafta gelişiyorum." },
            { name: "Ece D.", role: "12. Sınıf Öğrencisi", comment: "YDT hazırlık sürecinde konuşma pratiği için mükemmel bir uygulama." },
            { name: "Umut E.", role: "9. Sınıf Öğrencisi", comment: "Konular tam okulda işlediklerimiz gibi. Sınavda sürpriz kalmadı!" },
            { name: "Defne F.", role: "10. Sınıf Öğrencisi", comment: "Evde özel ders alıyor gibi hissediyorum. Geri bildirimler çok anlaşılır." }
          ],
          star4: [
            { name: "Berk G.", role: "11. Sınıf Öğrencisi", comment: "Kullanımı çok basit. Günde 10 dakika pratikle güvenim arttı." },
            { name: "Azra H.", role: "12. Sınıf Öğrencisi", comment: "Döküm özelliği sayesinde neyi yanlış söylediğimi net görüyorum." },
            { name: "Emre I.", role: "9. Sınıf Öğrencisi", comment: "Tasarımı çok şık, çark özelliği de çok eğlenceli." },
            { name: "Melis J.", role: "10. Sınıf Öğrencisi", comment: "Konuşma korkumu yenmeme yardımcı oldu. Artık derste çekinmiyorum." },
            { name: "Kaan K.", role: "11. Sınıf Öğrencisi", comment: "Sadece sınavlar için değil, günlük pratik için de harika." },
            { name: "Irmak L.", role: "12. Sınıf Öğrencisi", comment: "Vakti kısıtlı öğrenciler için hızlı ve etkili geri bildirim." }
          ],
          star3: [
            { name: "Can M.", role: "9. Sınıf Öğrencisi", comment: "Pratik için güzel ama gürültüde bazen tam anlamıyor." },
            { name: "Beril N.", role: "10. Sınıf Öğrencisi", comment: "Faydalı bir uygulama. Puanlarımı karşılaştırmak hoşuma gidiyor." },
            { name: "Onur O.", role: "11. Sınıf Öğrencisi", comment: "Konuşma sınavına hazırlanırken yardımcı oluyor." },
            { name: "Simge P.", role: "12. Sınıf Öğrencisi", comment: "Seviyemi test etmek için her büyük sınavdan önce kullanıyorum." },
            { name: "Yiğit R.", role: "11. Sınıf Öğrencisi", comment: "Kelimeleri doğru telaffuz edip etmediğimi kontrol ediyorum." }
          ]
        }
      },
      errors: {
        micTitle: "Mikrofon Hatası",
        micPermission: "Mikrofon erişimi gerekli. Lütfen tarayıcı ayarlarınızdan izin verin.",
        generic: "Bir hata oluştu. Lütfen tekrar deneyin.",
        noSpeechDetected: "Ses algılanamadı. Lütfen net konuşun."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'tr',
    fallbackLng: 'tr',
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    debug: false,
    interpolation: {
      escapeValue: false, 
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
