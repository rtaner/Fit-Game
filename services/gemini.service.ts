import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface FitItem {
  id: string;
  name: string;
  description: string | null;
  fit_category: string | null;
  tags: string[];
  gender: 'Kadın' | 'Erkek' | null;
}

interface TrainingAnalysisData {
  userName?: string;
  categoryNeeds: Array<{
    category: string;
    accuracy: number;
    total: number;
    correct: number;
    wrong: number;
    trainingPriority: 'high' | 'medium' | 'low';
  }>;
  confusedFits: Array<{
    correctFit: string;
    confusedWithFit: string;
    count: number;
    percentage: number;
  }>;
  failedFits: Array<{
    fitName: string;
    totalAsked: number;
    totalWrong: number;
    errorRate: number;
  }>;
  storeComparison: Array<{
    storeCode: number;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
  }>;
  fitDatabase?: FitItem[];
}

export async function analyzeTrainingNeeds(data: TrainingAnalysisData): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const userName = data.userName || 'Personel';
    
    const prompt = `
Sen bir perakende eğitim uzmanısın. Aşağıdaki Mavi mağaza çalışanının (${userName}) ürün fit bilgisi performans verilerini analiz et ve Türkçe olarak detaylı, kişiselleştirilmiş eğitim önerileri sun.

**ÖNEMLİ**: Bu analiz ${userName} için yapılıyor. Genel değil, bu kişiye özel öneriler sun. Yanıtına "Merhaba ${userName}" diye başla.

## Fit Veritabanı (Tüm Ürünler):
${data.fitDatabase && data.fitDatabase.length > 0
  ? data.fitDatabase
      .map(
        (fit) =>
          `- ${fit.name}: ${fit.description || 'Açıklama yok'} | Kategori: ${fit.fit_category || 'Yok'} | Etiketler: ${fit.tags.join(', ')} | Cinsiyet: ${fit.gender || 'Unisex'}`
      )
      .join('\n')
  : 'Fit veritabanı bilgisi yok'}

## Bu Personelin Kategori Bazlı Performansı:
${data.categoryNeeds
  .map(
    (cat) =>
      `- ${cat.category}: %${cat.accuracy.toFixed(1)} başarı (${cat.correct}/${cat.total} doğru) - ${
        cat.trainingPriority === 'high'
          ? 'Yüksek Öncelik'
          : cat.trainingPriority === 'medium'
          ? 'Orta Öncelik'
          : 'Düşük Öncelik'
      }`
  )
  .join('\n')}

## Bu Personelin En Çok Karıştırdığı Fit Çiftleri:
${data.confusedFits
  .map((pair) => `- "${pair.correctFit}" yerine "${pair.confusedWithFit}" seçti (${pair.count} kez, %${pair.percentage.toFixed(1)})`)
  .join('\n')}

## Bu Personelin En Çok Yanlış Yaptığı Fitler:
${data.failedFits
  .map((fit) => `- ${fit.fitName}: %${fit.errorRate.toFixed(1)} hata oranı (${fit.totalWrong}/${fit.totalAsked} yanlış)`)
  .join('\n')}

## Mağaza Karşılaştırması:
${data.storeComparison
  .map((store) => `- Mağaza ${store.storeCode}: %${store.accuracy.toFixed(1)} başarı (${store.correctAnswers}/${store.totalAnswers})`)
  .join('\n')}

Lütfen şu başlıklar altında BU PERSONELE ÖZEL analiz yap:

1. **Personelin Genel Durumu**: Bu kişinin performansı nasıl? Güçlü ve zayıf yönleri neler?

2. **Ortak Hata Paternleri**: 
   - Fit veritabanına bakarak, bu personelin yanlış yaptığı fitlerin ortak özellikleri neler?
   - Hangi fit kategorileri, etiketler veya özellikler karıştırılıyor?
   - Örnek: "Tüm dar kesim fitler (Slim, Skinny, Super Skinny) karıştırılıyor"
   - Karıştırılan fitlerde doğru cevap ve yanlış cevabı ayrı ayrı say ve analiz et

3. **Kişiye Özel Eğitim Önerileri**: 
   - Bu personel için hangi konulara odaklanmalı?
   - Hangi fit özellikleri üzerinde çalışmalı?
   - En çok hata yapılan kategorileri listele ve tekrar kontrol etmesi gerektiğini söyle

4. **Karıştırılan Fitler İçin Stratejiler**: 
   - Karıştırılan fitlerin neden karıştırıldığını yorumla
   - Fit veritabanındaki açıklamaları kullanarak ayırt edici özellikler sun
   - Her karıştırılan fit çifti için aralarındaki farkı açıkla

5. **2 Haftalık Kişisel Aksiyon Planı**: 
   - Hafta 1: Hangi fitleri çalışmalı?
   - Hafta 2: Hangi fitleri pekiştirmeli?

Yanıtını bu personele hitap eder şekilde, profesyonel ama samimi bir dille yaz. Özet ve net ol. Markdown formatında sun.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error analyzing training needs with Gemini:', error);
    throw new Error('AI analizi yapılırken bir hata oluştu');
  }
}
