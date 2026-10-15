# Portfolio WebOS - Mühendislik & Geliştirme Kuralları

Bu projede uygulanan temel kalite standartları:

1. **Dökümantasyon Disiplini**:
   - Yapılan her geliştirme, mimari karar veya değişiklik `docs/ARCHITECTURE.md` ve `docs/DEVLOG.md` dosyalarına işlenmeli ve güncel tutulmalıdır.
   - Kod tabanı temiz, TSDoc standartlarında açıklamalar içermelidir.

2. **SonarQube & Statik Kod Analizi**:
   - Yazılan her kod parçası SonarQube / SonarJS kurallarına uygun olmalıdır.
   - Kod kokuları (code smells), güvenlik açıkları ve aşırı karmaşıklık (cognitive complexity) engellenmelidir.

3. **Test Odaklı Geliştirme (TDD / Comprehensive Testing)**:
   - Window Manager, state store, komut paleti ve mobil dönüşüm gibi kritik bileşenler için Vitest & React Testing Library ile birim ve entegrasyon testleri yazılmalıdır.

4. **Sıkı Güvenlik İncelemesi (DevSecOps / Security Audit)**:
   - Geliştirilen her yeni sistem, endpoint veya kullanıcı etkileşim noktası (iframe sandbox, terminal komut ayrıştırıcı, telemetry servisi) OWASP standartlarına göre güvenlik şapkası takılarak denetlenmelidir.

5. **Git ve Sürüm Kontrol Disiplini**:
   - Kullanıcı açıkça talimat vermedikçe (onay veya doğrudan "commit yap", "push yap" demedikçe) **ASLA** `git commit` veya `git push` komutları çalıştırılmamalıdır. Tüm değişiklikler yerel çalışma alanında geliştirilmeli, test edilmeli ve kullanıcının onayı beklenmelidir.

