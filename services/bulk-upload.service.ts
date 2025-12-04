import Papa from 'papaparse';
import { questionService, type QuestionCreateInput } from './question.service';

export interface BulkUploadRow {
  name: string;
  image_url: string;
  description: string;
  explanation?: string;
  tags: string;
  gender?: string;
  fit_category?: string;
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

    if (!row.image_url || row.image_url.trim() === '') {
      console.error(`❌ Row ${rowIndex + 1}: Image URL is empty`);
      return `Satır ${rowIndex + 1}: Resim URL'si boş olamaz`;
    }

    try {
      new URL(row.image_url);
    } catch {
      console.error(`❌ Row ${rowIndex + 1}: Invalid URL: ${row.image_url}`);
      return `Satır ${rowIndex + 1}: Geçersiz resim URL'si (${row.image_url})`;
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

        // 🎨 Automatically create images array from image_url
        const images: Array<{ url: string; color: string; isPrimary: boolean }> = [
          {
            url: row.image_url.trim(),
            color: 'default',
            isPrimary: true
          }
        ];

        // Create question
        const input: QuestionCreateInput = {
          category_id: categoryId,
          name: row.name.trim(),
          image_url: row.image_url.trim(),
          images, // ✅ Add images array automatically
          description: row.description.trim(),
          explanation: row.explanation?.trim(),
          tags,
          gender: row.gender?.trim() as 'Kadın' | 'Erkek' | undefined,
          fit_category: row.fit_category?.trim(),
        };

        console.log(`💾 Creating question for row ${i + 1}:`, {
          name: input.name,
          gender: input.gender,
          fit_category: input.fit_category,
          hasImages: !!input.images
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
    const headers = ['name', 'image_url', 'description', 'explanation', 'tags', 'gender', 'fit_category'];
    const sampleRows = [
      [
        'Marcus Fit',
        'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/marcus-fit.jpg',
        'Slim fit denim pantolon',
        'Dar kesim modern görünüm',
        'Slim,Denim',
        'Erkek',
        'SLIM',
      ],
      [
        'Carrot Fit',
        'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/carrot-fit.jpg',
        'Havuç kesim pantolon',
        'Üstten bol alttan dar',
        'Carrot,Denim',
        'Erkek',
        'CARROT',
      ],
      [
        'Serenay',
        'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/serenay.jpg',
        'Yüksek bel süper skinny',
        'Çok dar kesim',
        'Super Skinny,Yüksek Bel',
        'Kadın',
        'SUPER SKINNY',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },
};
