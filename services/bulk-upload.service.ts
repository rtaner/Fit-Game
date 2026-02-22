import Papa from 'papaparse';
import { questionService, type QuestionCreateInput } from './question.service';

export interface BulkUploadRow {
  name: string;
  image_url?: string;
  description: string;
  explanation?: string;
  tags: string;
  gender?: string;
  fit_category?: string;
  question_type?: 'fit' | 'custom';
  custom_question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
}

export interface BulkUploadResult {
  success: number;
  errors: Array<{ row: number; error: string; data: BulkUploadRow }>;
  created: string[];
}

export const bulkUploadService = {
  /**
   * Parse CSV file
   */
  async parseCSV(file: File): Promise<BulkUploadRow[]> {
    try {
      // Read file as text
      const text = await file.text();
      
      console.log('📄 CSV File Info:', {
        name: file.name,
        size: file.size,
        type: file.type,
        textLength: text.length,
        firstChars: text.substring(0, 200)
      });
      
      // Parse CSV using Papa Parse
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: 'greedy', // Skip all empty lines including whitespace
          transformHeader: (header) => {
            // Trim whitespace from headers
            return header.trim();
          },
          complete: (results) => {
            console.log('✅ CSV Parse Complete:', {
              totalRows: results.data.length,
              errors: results.errors,
              meta: results.meta
            });
            
            // Log first 3 rows for debugging
            console.log('📊 First 3 rows:', results.data.slice(0, 3));
            
            // Filter out completely empty rows
            const validRows = (results.data as BulkUploadRow[]).filter((row, index) => {
              const isEmpty = !row.name && !row.image_url && !row.description;
              if (isEmpty) {
                console.log(`⚠️ Skipping empty row at index ${index + 1}`);
              }
              return !isEmpty;
            });
            
            console.log(`✅ Valid rows after filtering: ${validRows.length}`);
            
            resolve(validRows);
          },
          error: (error: Error) => {
            console.error('❌ CSV Parse Error:', error);
            reject(new Error(`CSV parse error: ${error.message}`));
          },
        });
      });
    } catch (error) {
      console.error('❌ File Read Error:', error);
      throw new Error(`File read error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Validate row data
   */
  validateRow(row: BulkUploadRow, rowIndex: number): string | null {
    // Log the row being validated
    console.log(`🔍 Validating row ${rowIndex + 1}:`, {
      name: row.name ? `"${row.name}"` : 'EMPTY',
      question_type: row.question_type || 'fit',
      image_url: row.image_url ? `"${row.image_url.substring(0, 50)}..."` : 'EMPTY',
      description: row.description ? `"${row.description.substring(0, 50)}..."` : 'EMPTY',
      hasName: !!row.name,
      hasImageUrl: !!row.image_url,
      hasDescription: !!row.description
    });

    if (!row.name || row.name.trim() === '') {
      console.error(`❌ Row ${rowIndex + 1}: Name is empty or undefined`);
      return `Satır ${rowIndex + 1}: Soru adı boş olamaz (name: "${row.name}")`;
    }

    const questionType = row.question_type || 'fit';

    // Fit questions require image_url
    if (questionType === 'fit') {
      if (!row.image_url || row.image_url.trim() === '') {
        console.error(`❌ Row ${rowIndex + 1}: Image URL is empty for fit question`);
        return `Satır ${rowIndex + 1}: Fit soruları için resim URL'si zorunludur`;
      }

      try {
        new URL(row.image_url);
      } catch {
        console.error(`❌ Row ${rowIndex + 1}: Invalid URL: ${row.image_url}`);
        return `Satır ${rowIndex + 1}: Geçersiz resim URL'si (${row.image_url})`;
      }
    }

    // Custom questions require custom fields
    if (questionType === 'custom') {
      if (!row.custom_question_text || row.custom_question_text.trim() === '') {
        return `Satır ${rowIndex + 1}: Custom sorular için soru metni (custom_question_text) zorunludur`;
      }

      if (!row.option_a || !row.option_b || !row.option_c || !row.option_d) {
        return `Satır ${rowIndex + 1}: Custom sorular için tüm şıklar (option_a, option_b, option_c, option_d) zorunludur`;
      }

      if (!row.correct_answer || !['A', 'B', 'C', 'D'].includes(row.correct_answer.toUpperCase())) {
        return `Satır ${rowIndex + 1}: Doğru cevap (correct_answer) A, B, C veya D olmalıdır`;
      }
    }

    if (!row.description || row.description.trim() === '') {
      console.error(`❌ Row ${rowIndex + 1}: Description is empty`);
      return `Satır ${rowIndex + 1}: Açıklama boş olamaz`;
    }

    console.log(`✅ Row ${rowIndex + 1}: Validation passed`);
    return null;
  },

  /**
   * Bulk create questions
   */
  async bulkCreateQuestions(
    categoryId: string,
    rows: BulkUploadRow[]
  ): Promise<BulkUploadResult> {
    console.log(`🚀 Starting bulk create for ${rows.length} rows`);
    
    const result: BulkUploadResult = {
      success: 0,
      errors: [],
      created: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      console.log(`\n📝 Processing row ${i + 1}/${rows.length}`);

      // Validate row
      const validationError = this.validateRow(row, i);
      if (validationError) {
        console.error(`❌ Validation failed for row ${i + 1}`);
        result.errors.push({ row: i + 1, error: validationError, data: row });
        continue;
      }

      try {
        // Parse tags
        const tags = row.tags
          ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

        const questionType = row.question_type || 'fit';

        // Base input
        const input: QuestionCreateInput = {
          category_id: categoryId,
          name: row.name.trim(),
          question_type: questionType,
          description: row.description.trim(),
          explanation: row.explanation?.trim(),
          tags,
        };

        // Add fit-specific fields
        if (questionType === 'fit') {
          // 🎨 Automatically create images array from image_url
          const images: Array<{ url: string; color: string; isPrimary: boolean }> = [
            {
              url: row.image_url!.trim(),
              color: 'default',
              isPrimary: true
            }
          ];

          input.image_url = row.image_url!.trim();
          input.images = images;
          input.gender = row.gender?.trim() as 'Kadın' | 'Erkek' | undefined;
          input.fit_category = row.fit_category?.trim();
        }

        // Add custom-specific fields
        if (questionType === 'custom') {
          input.custom_question_text = row.custom_question_text!.trim();
          
          const correctAnswerLetter = row.correct_answer!.toUpperCase();
          input.custom_options = [
            { id: 'A', text: row.option_a!.trim(), isCorrect: correctAnswerLetter === 'A' },
            { id: 'B', text: row.option_b!.trim(), isCorrect: correctAnswerLetter === 'B' },
            { id: 'C', text: row.option_c!.trim(), isCorrect: correctAnswerLetter === 'C' },
            { id: 'D', text: row.option_d!.trim(), isCorrect: correctAnswerLetter === 'D' },
          ];
        }

        console.log(`💾 Creating question for row ${i + 1}:`, {
          name: input.name,
          question_type: input.question_type,
          gender: input.gender,
          fit_category: input.fit_category,
          hasImages: !!input.images,
          hasCustomOptions: !!input.custom_options
        });

        const question = await questionService.createQuestion(input);
        result.created.push(question.id);
        result.success++;
        
        console.log(`✅ Successfully created question ${i + 1}: ${question.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        console.error(`❌ Failed to create question for row ${i + 1}:`, errorMessage);
        result.errors.push({
          row: i + 1,
          error: `Oluşturma hatası: ${errorMessage}`,
          data: row,
        });
      }
    }

    console.log(`\n🎉 Bulk create complete:`, {
      total: rows.length,
      success: result.success,
      errors: result.errors.length
    });

    return result;
  },

  /**
   * Generate sample CSV template
   */
  generateTemplate(): string {
    const headers = ['name', 'question_type', 'image_url', 'description', 'explanation', 'tags', 'gender', 'fit_category', 'custom_question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
    const sampleRows = [
      [
        'Marcus Fit',
        'fit',
        'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/marcus-fit.jpg',
        'Slim fit denim pantolon',
        'Dar kesim modern görünüm',
        'Slim,Denim',
        'Erkek',
        'SLIM',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        'Etik Soru 1',
        'custom',
        '',
        'Etik kurallar',
        'Müşteri memnuniyeti önceliğimizdir',
        'Etik,Müşteri',
        '',
        '',
        'Müşteriye nasıl davranmalıyız?',
        'Saygılı ve güler yüzlü',
        'Umursamaz',
        'Sadece satış odaklı',
        'Hızlı geçiştirmeli',
        'A',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },
};
