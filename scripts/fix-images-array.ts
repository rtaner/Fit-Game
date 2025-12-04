/**
 * Migration Script: Fix images array for existing questions
 * 
 * This script converts image_url to images array format for all questions
 * that don't have an images array yet.
 */

import { createClient } from '@/lib/supabase/client';

async function fixImagesArray() {
  console.log('🚀 Starting images array migration...\n');
  
  const supabase = createClient();

  // Get all questions
  const { data: questions, error } = await supabase
    .from('question_items')
    .select('*');

  if (error) {
    console.error('❌ Error fetching questions:', error);
    return;
  }

  if (!questions || questions.length === 0) {
    console.log('ℹ️ No questions found');
    return;
  }

  console.log(`📊 Found ${questions.length} questions\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const question of questions) {
    // Skip if already has images array
    if (question.images && Array.isArray(question.images) && question.images.length > 0) {
      console.log(`⏭️  Skipping "${question.name}" - already has images array`);
      skipped++;
      continue;
    }

    // Skip if no image_url
    if (!question.image_url) {
      console.log(`⚠️  Skipping "${question.name}" - no image_url`);
      skipped++;
      continue;
    }

    try {
      // Create images array from image_url
      const images = [
        {
          url: question.image_url,
          color: 'default',
          isPrimary: true
        }
      ];

      // Update question
      const { error: updateError } = await supabase
        .from('question_items')
        .update({ images })
        .eq('id', question.id);

      if (updateError) {
        console.error(`❌ Error updating "${question.name}":`, updateError);
        errors++;
        continue;
      }

      console.log(`✅ Fixed "${question.name}"`);
      fixed++;
    } catch (err) {
      console.error(`❌ Error processing "${question.name}":`, err);
      errors++;
    }
  }

  console.log('\n🎉 Migration complete!');
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total: ${questions.length}`);
}

// Run the migration
fixImagesArray()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
