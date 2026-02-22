import { createClient } from '@/lib/supabase/client';

export interface ProductImage {
  url: string;
  color: string;
  isPrimary: boolean;
}

export interface GameQuestion {
  questionId: string;
  correctAnswerId: string;
  options: QuestionOption[];
  questionText: string;
  description?: string; // Fit açıklaması
  imageUrl: string;
  color?: string; // Sorulan görselin rengi
}

export interface AskedCombination {
  questionId: string;
  color: string;
}

export interface QuestionOption {
  id: string;
  name: string;
  imageUrl: string;
}

export interface GameSession {
  id: string;
  userId: string;
  categoryId: string;
  score: number;
  totalQuestions: number;
  totalAvailableQuestions?: number;
  currentStreak?: number;
  highestStreak?: number;
  lifeline50Used: boolean;
  lifelineSkipUsed: boolean;
  startedAt: string;
  currentQuestion?: GameQuestion;
}

export const gameService = {
  // Helper: Generate custom question (manual options)
  generateCustomQuestion(availableQuestions: any[]): GameQuestion | null {
    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    const customOptions = question.custom_options || [];

    if (customOptions.length < 2) {
      console.error('Custom question has less than 2 options');
      return null;
    }

    const correctOption = customOptions.find((opt: any) => opt.isCorrect);
    if (!correctOption) {
      console.error('Custom question has no correct answer');
      return null;
    }

    // Shuffle options
    const shuffledOptions = [...customOptions].sort(() => Math.random() - 0.5);

    return {
      questionId: question.id,
      correctAnswerId: correctOption.id,
      options: shuffledOptions.map((opt: any) => ({
        id: opt.id,
        name: opt.text,
        imageUrl: '', // Custom questions don't have option images
      })),
      questionText: question.custom_question_text || question.name,
      description: question.description || question.custom_question_text,
      imageUrl: question.image_url || '', // Optional image
      color: 'custom', // Special marker for custom questions
    };
  },

  // Helper: Calculate multiplier based on streak
  calculateMultiplier(streak: number): number {
    if (streak >= 41) return 5;
    if (streak >= 31) return 3;
    if (streak >= 21) return 2;
    if (streak >= 16) return 1.5;
    if (streak >= 11) return 1.3;
    if (streak >= 6) return 1.2;
    return 1;
  },

  // Helper: Calculate points for a correct answer
  calculatePoints(streak: number): number {
    const basePoints = 10;
    const multiplier = this.calculateMultiplier(streak);
    return Math.floor(basePoints * multiplier);
  },

  // Helper: Get streak level info
  getStreakLevel(streak: number): { level: string; emoji: string; color: string } {
    if (streak >= 41) return { level: 'Alev Aldın', emoji: '🚀', color: 'purple' };
    if (streak >= 31) return { level: 'Efsane Modu', emoji: '🔥', color: 'orange' };
    if (streak >= 21) return { level: 'Efsane Modu', emoji: '🔥', color: 'red' };
    if (streak >= 16) return { level: 'Ateş', emoji: '⚡', color: 'yellow' };
    if (streak >= 11) return { level: 'Sıcak', emoji: '🌟', color: 'blue' };
    if (streak >= 6) return { level: 'İyi Gidiyor', emoji: '✨', color: 'cyan' };
    return { level: 'Başlangıç', emoji: '💪', color: 'gray' };
  },

  // Helper: Akıllı görsel seçimi
  selectRandomImage(item: any, usedColors: string[] = []): { url: string; color: string } {
    // Eğer yeni format varsa (images array)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // Henüz kullanılmamış renkleri filtrele
      const availableImages = item.images.filter(
        (img: ProductImage) => !usedColors.includes(img.color)
      );

      // Eğer hepsi kullanıldıysa, hepsini tekrar kullan
      const imagePool = availableImages.length > 0 ? availableImages : item.images;

      const randomIndex = Math.floor(Math.random() * imagePool.length);
      const selected = imagePool[randomIndex];
      
      return { url: selected.url, color: selected.color };
    }
    
    // Fallback: Eski format (image_url)
    return { url: item.image_url || '', color: '' };
  },

  async generateQuestion(sessionId: string, askedCombinations: AskedCombination[] = []): Promise<GameQuestion | null> {
    const supabase = createClient();

    // Get session to retrieve category_id and used_colors
    const { data: session } = await supabase
      .from('game_sessions')
      .select('category_id, used_colors')
      .eq('id', sessionId)
      .single();

    if (!session) {
      console.error('Session not found');
      return null;
    }

    const usedColors = session.used_colors || [];

    // Get category information
    const { data: category } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', session.category_id)
      .single();

    if (!category) {
      console.error('Category not found');
      return null;
    }

    let categoryIds: string[];

    // Check if this is "All Categories" special category
    if (category.is_all_categories) {
      // Get all categories that are included in "All Categories" (is_active=true)
      // Note: is_quiz_active controls visibility on homepage, not inclusion in "All Categories"
      const { data: allCategories } = await supabase
        .from('quiz_categories')
        .select('id')
        .eq('is_active', true) // Only this flag matters for "All Categories"
        .neq('is_all_categories', true);

      if (!allCategories || allCategories.length === 0) {
        console.error('No active quiz categories found');
        return null;
      }

      categoryIds = allCategories.map(c => c.id);
      console.log('🌍 Using ALL categories:', categoryIds.length);
    } else {
      // Use only the selected category
      categoryIds = [session.category_id];
      console.log('📂 Using single category:', category.name);
    }

    // Get all active questions
    const { data: allQuestions, error } = await supabase
      .from('question_items')
      .select('*')
      .in('category_id', categoryIds)
      .eq('is_active', true);

    if (error || !allQuestions || allQuestions.length === 0) {
      console.error('No questions found');
      return null;
    }

    // Separate questions by type
    const fitQuestions = allQuestions.filter(q => (q as any).question_type === 'fit' || !(q as any).question_type);
    const customQuestions = allQuestions.filter(q => (q as any).question_type === 'custom');

    console.log('📊 Questions:', { total: allQuestions.length, fit: fitQuestions.length, custom: customQuestions.length });

    // Check if we have custom questions to show
    const hasCustomQuestions = customQuestions.length > 0;
    const alreadyAskedCustomIds = askedCombinations
      .filter(combo => combo.color === 'custom') // Custom questions use 'custom' as color marker
      .map(combo => combo.questionId);
    
    const availableCustomQuestions = customQuestions.filter(
      q => !alreadyAskedCustomIds.includes(q.id)
    );

    // Decide whether to show a custom question (30% chance if available)
    const shouldShowCustom = hasCustomQuestions && 
                             availableCustomQuestions.length > 0 && 
                             Math.random() < 0.3;

    if (shouldShowCustom) {
      // Generate custom question
      return this.generateCustomQuestion(availableCustomQuestions);
    }

    // Continue with fit question logic (existing code)
    // Filter out questions that have been asked with all their colors
    const availableQuestions = fitQuestions.filter(q => {
      // Get all colors for this question
      const questionColors = q.images && Array.isArray(q.images) 
        ? q.images.map((img: ProductImage) => img.color)
        : ['default']; // Tek görselli sorular için default

      // Check which colors have been asked
      const askedColors = askedCombinations
        .filter(combo => combo.questionId === q.id)
        .map(combo => combo.color);

      // If not all colors have been asked, this question is available
      return askedColors.length < questionColors.length;
    });

    console.log('Total fit questions:', fitQuestions.length, 'Available combinations:', availableQuestions.length, 'Already asked:', askedCombinations.length);

    // 🎉 ALL QUESTIONS COMPLETED!
    if (availableQuestions.length < 3 && availableCustomQuestions.length === 0) {
      console.log('🎉 All questions completed! Returning completion flag.');
      // Return a special completion marker instead of null
      return {
        questionId: 'COMPLETED',
        correctAnswerId: 'COMPLETED',
        options: [],
        questionText: 'COMPLETED',
        description: 'All questions completed',
        imageUrl: '',
        color: '',
      } as GameQuestion;
    }

    // If not enough fit questions but have custom questions, show custom
    if (availableQuestions.length < 3 && availableCustomQuestions.length > 0) {
      return this.generateCustomQuestion(availableCustomQuestions);
    }

    // Continue with existing fit question generation logic...
    // Select random correct answer from available questions
    const correctAnswer = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Get available colors for the correct answer
    const correctAnswerColors = correctAnswer.images && Array.isArray(correctAnswer.images)
      ? correctAnswer.images.map((img: ProductImage) => img.color)
      : ['default'];
    
    const askedColorsForCorrect = askedCombinations
      .filter(combo => combo.questionId === correctAnswer.id)
      .map(combo => combo.color);
    
    const availableColorsForCorrect = correctAnswerColors.filter(
      (color: string) => !askedColorsForCorrect.includes(color)
    );
    
    // Select a random available color for correct answer
    const selectedColor = availableColorsForCorrect.length > 0
      ? availableColorsForCorrect[Math.floor(Math.random() * availableColorsForCorrect.length)]
      : 'default';
    
    // Filter questions by same category AND same gender (to avoid mixing categories and Kadın/Erkek)
    // ALSO exclude questions with the same description as correct answer (to avoid confusion)
    const correctDescription = (correctAnswer.description || correctAnswer.explanation || '').trim().toLowerCase();
    
    let sameGenderQuestions = allQuestions.filter(
      (q) => {
        const qDescription = (q.description || q.explanation || '').trim().toLowerCase();
        return q.id !== correctAnswer.id && 
               q.gender === correctAnswer.gender &&
               q.category_id === correctAnswer.category_id &&
               qDescription !== correctDescription; // Aynı açıklamaya sahip fitler şıklarda yer almasın
      }
    );

    // If not enough same-gender questions from same category, fallback to same gender only
    if (sameGenderQuestions.length < 2) {
      console.log('Not enough same-gender questions from same category, using same gender from all categories');
      sameGenderQuestions = allQuestions.filter(
        (q) => {
          const qDescription = (q.description || q.explanation || '').trim().toLowerCase();
          return q.id !== correctAnswer.id && 
                 q.gender === correctAnswer.gender &&
                 qDescription !== correctDescription; // Aynı açıklamaya sahip fitler şıklarda yer almasın
        }
      );
      
      if (sameGenderQuestions.length < 2) {
        console.log('Not enough same-gender questions, using all questions from same category');
        sameGenderQuestions = allQuestions.filter(
          (q) => {
            const qDescription = (q.description || q.explanation || '').trim().toLowerCase();
            return q.id !== correctAnswer.id && 
                   q.category_id === correctAnswer.category_id &&
                   qDescription !== correctDescription; // Aynı açıklamaya sahip fitler şıklarda yer almasın
          }
        );
        
        if (sameGenderQuestions.length < 2) {
          console.error('Not enough questions in database. Need at least 3 total.');
          return null;
        }
      }
    }

    // Distractor 1: Prefer same fit_category, fallback to any same gender
    const sameFitCategory = sameGenderQuestions.filter(
      (q) => q.fit_category === correctAnswer.fit_category
    );
    
    const distractor1 = sameFitCategory.length > 0
      ? sameFitCategory[Math.floor(Math.random() * sameFitCategory.length)]
      : sameGenderQuestions[Math.floor(Math.random() * sameGenderQuestions.length)];

    // Distractor 2: Prefer different fit_category, fallback to any remaining same gender
    const remainingQuestions = sameGenderQuestions.filter((q) => q.id !== distractor1.id);
    
    if (remainingQuestions.length === 0) {
      console.error('Not enough questions for second distractor');
      return null;
    }

    // Try to find different fit_category first
    const differentFitCategory = remainingQuestions.filter(
      (q) => q.fit_category !== correctAnswer.fit_category
    );

    const distractor2 = differentFitCategory.length > 0
      ? differentFitCategory[Math.floor(Math.random() * differentFitCategory.length)]
      : remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];

    // 🎨 Doğru cevap için seçilen rengi kullan
    const correctImage = correctAnswer.images && Array.isArray(correctAnswer.images)
      ? correctAnswer.images.find((img: ProductImage) => img.color === selectedColor)
      : null;
    
    console.log('🎨 Image Selection Debug:');
    console.log('  Correct Answer:', correctAnswer.name);
    console.log('  Selected Color:', selectedColor);
    console.log('  Images Array:', correctAnswer.images);
    console.log('  Found Image:', correctImage);
    console.log('  Fallback image_url:', correctAnswer.image_url);
    
    const correctImageUrl = correctImage?.url || correctAnswer.image_url || '';
    console.log('  Final Image URL:', correctImageUrl);

    // Distractorlar için rastgele görsel seç (used_colors'ı dikkate alarak)
    const distractor1Image = this.selectRandomImage(distractor1, usedColors);
    const distractor2Image = this.selectRandomImage(distractor2, usedColors);

    // Kullanılan renkleri kaydet
    const newUsedColors = [
      ...usedColors,
      selectedColor,
      distractor1Image.color,
      distractor2Image.color,
    ].filter(color => color !== '' && color !== 'default'); // Boş ve default renkleri filtrele

    // Session'a kullanılan renkleri kaydet
    await supabase
      .from('game_sessions')
      .update({ used_colors: newUsedColors })
      .eq('id', sessionId);

    // Shuffle options
    const options: QuestionOption[] = [
      { id: correctAnswer.id, name: correctAnswer.name, imageUrl: correctImageUrl },
      { id: distractor1.id, name: distractor1.name, imageUrl: distractor1Image.url },
      { id: distractor2.id, name: distractor2.name, imageUrl: distractor2Image.url },
    ].sort(() => Math.random() - 0.5);

    return {
      questionId: correctAnswer.id,
      correctAnswerId: correctAnswer.id,
      options,
      questionText: `Hangi fit bu?`,
      description: correctAnswer.description || correctAnswer.explanation || `Hangi fit bu?`,
      imageUrl: correctImageUrl,
      color: selectedColor,
    };
  },

  async startGame(userId: string, categoryId: string): Promise<GameSession | null> {
    const supabase = createClient();

    console.log('Creating game session for:', { userId, categoryId });

    // Get category information to determine total available questions
    const { data: category } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    let totalAvailableQuestions = 0;

    if (category) {
      let categoryIds: string[];

      if (category.is_all_categories) {
        // Get all active categories
        const { data: allCategories } = await supabase
          .from('quiz_categories')
          .select('id')
          .eq('is_active', true)
          .neq('is_all_categories', true);

        categoryIds = allCategories ? allCategories.map(c => c.id) : [];
      } else {
        categoryIds = [categoryId];
      }

      // Count total active questions in these categories
      const { count } = await supabase
        .from('question_items')
        .select('*', { count: 'exact', head: true })
        .in('category_id', categoryIds)
        .eq('is_active', true);

      totalAvailableQuestions = count || 0;
    }

    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        score: 0,
        total_questions: 0,
        total_available_questions: totalAvailableQuestions,
        current_streak: 0,
        highest_streak: 0,
        lifeline_50_used: false,
        lifeline_skip_used: false,
        asked_questions: [],
        used_colors: [],
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return null;
    }

    if (!session) {
      console.error('No session returned');
      return null;
    }

    console.log('Session created successfully:', session.id);

    const question = await this.generateQuestion(session.id, []);

    if (!question) {
      console.error('Failed to generate question');
      return null;
    }

    // Update session with first asked combination (question + color)
    const firstCombination: AskedCombination = {
      questionId: question.questionId,
      color: question.color || 'default'
    };
    
    await supabase
      .from('game_sessions')
      .update({ asked_questions: [firstCombination] })
      .eq('id', session.id);

    console.log('Question generated successfully');

    return {
      id: session.id,
      userId: session.user_id,
      categoryId: session.category_id,
      score: session.score,
      totalQuestions: session.total_questions,
      totalAvailableQuestions: session.total_available_questions || 0,
      lifeline50Used: session.lifeline_50_used,
      lifelineSkipUsed: session.lifeline_skip_used,
      startedAt: session.started_at,
      currentQuestion: question,
    };
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    selectedAnswerId: string,
    responseTimeMs: number,
    lifelineUsed?: string,
    questionColor?: string
  ): Promise<{
    isCorrect: boolean;
    newScore: number;
    currentStreak: number;
    multiplier: number;
    pointsEarned: number;
    streakLevel: { level: string; emoji: string; color: string };
    nextQuestion: GameQuestion | null;
    fitName?: string;
    explanation?: string;
    userAnswerExplanation?: string;
  }> {
    const supabase = createClient();

    const { data: session } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Session not found');

    const usedColors = session.used_colors || [];

    // Get question to check if it's custom type
    const { data: question } = await supabase
      .from('question_items')
      .select('question_type, custom_options')
      .eq('id', questionId)
      .single();

    let isCorrect = false;
    let correctAnswerId = questionId; // Default for fit questions

    if (question && question.question_type === 'custom' && question.custom_options) {
      // For custom questions, check if selected option is marked as correct
      const selectedOption = question.custom_options.find((opt: any) => opt.id === selectedAnswerId);
      isCorrect = selectedOption?.isCorrect || false;
      
      // Find the correct answer ID for analytics
      const correctOption = question.custom_options.find((opt: any) => opt.isCorrect);
      correctAnswerId = correctOption?.id || questionId;
    } else {
      // For fit questions, questionId === selectedAnswerId
      isCorrect = questionId === selectedAnswerId;
    }
    
    // Calculate new streak and score with multiplier
    let newStreak = isCorrect ? (session.current_streak || 0) + 1 : 0;
    let newHighestStreak = Math.max(newStreak, session.highest_streak || 0);
    
    // Calculate points based on streak (before incrementing for next question)
    const pointsEarned = isCorrect ? this.calculatePoints(newStreak) : 0;
    const newScore = session.score + pointsEarned;

    await supabase.from('answer_analytics').insert({
      session_id: sessionId,
      user_id: session.user_id,
      question_id: questionId,
      correct_answer_id: correctAnswerId,
      selected_answer_id: selectedAnswerId,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
      lifeline_used: lifelineUsed || null,
    });

    await supabase
      .from('game_sessions')
      .update({ 
        score: newScore, 
        total_questions: session.total_questions + 1,
        current_streak: newStreak,
        highest_streak: newHighestStreak
      })
      .eq('id', sessionId);

    if (!isCorrect) {
      await this.endGame(sessionId);
      const explanationData = await this.getQuestionExplanation(questionId, correctAnswerId);
      const userAnswerData = await this.getQuestionExplanation(questionId, selectedAnswerId);
      return { 
        isCorrect: false, 
        newScore,
        currentStreak: 0,
        multiplier: 1,
        pointsEarned: 0,
        streakLevel: this.getStreakLevel(0),
        nextQuestion: null, 
        fitName: explanationData?.fitName,
        explanation: explanationData?.explanation,
        userAnswerExplanation: userAnswerData?.explanation
      };
    }

    // Get asked combinations and add current one
    const askedCombinations: AskedCombination[] = session.asked_questions || [];
    const currentCombination: AskedCombination = {
      questionId: questionId,
      color: questionColor || 'default'
    };
    askedCombinations.push(currentCombination);

    const nextQuestion = await this.generateQuestion(sessionId, askedCombinations);

    // Update asked combinations - sadece şu anki kombinasyonu ekle
    // nextQuestion bir sonraki turda eklenecek
    await supabase
      .from('game_sessions')
      .update({ asked_questions: askedCombinations })
      .eq('id', sessionId);

    return { 
      isCorrect: true, 
      newScore,
      currentStreak: newStreak,
      multiplier: this.calculateMultiplier(newStreak),
      pointsEarned,
      streakLevel: this.getStreakLevel(newStreak),
      nextQuestion 
    };
  },

  async endGame(sessionId: string): Promise<{
    score: number;
    highestStreak: number;
    totalQuestions: number;
    userId: string;
  } | null> {
    const supabase = createClient();

    const { data: session } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) return null;

    const durationSeconds = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

    await supabase
      .from('game_sessions')
      .update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds })
      .eq('id', sessionId);

    // Return game data for badge checking
    return {
      score: session.score,
      highestStreak: session.highest_streak || 0,
      totalQuestions: session.total_questions,
      userId: session.user_id,
    };
  },

  async getQuestionExplanation(questionId: string, optionId?: string): Promise<{ fitName: string; explanation: string } | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('question_items')
      .select('name, explanation, description, question_type, custom_options')
      .eq('id', questionId)
      .single();

    if (error || !data) return null;

    // For custom questions with option ID, return the option text
    if (data.question_type === 'custom' && optionId && data.custom_options) {
      const option = data.custom_options.find((opt: any) => opt.id === optionId);
      if (option) {
        return {
          fitName: `Şık ${optionId}`,
          explanation: option.text
        };
      }
    }

    // For fit questions or custom questions without option ID
    return {
      fitName: data.name,
      explanation: data.explanation || data.description || ''
    };
  },

  async use5050Lifeline(sessionId: string, question: GameQuestion): Promise<GameQuestion | null> {
    const supabase = createClient();

    const { data: session } = await supabase
      .from('game_sessions')
      .select('lifeline_50_used')
      .eq('id', sessionId)
      .single();

    if (!session || session.lifeline_50_used) return null;

    await supabase.from('game_sessions').update({ lifeline_50_used: true }).eq('id', sessionId);

    const incorrectOptions = question.options.filter((opt) => opt.id !== question.correctAnswerId);
    const toEliminate = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];

    return {
      ...question,
      options: question.options.filter((opt) => opt.id !== toEliminate.id),
    };
  },

  async useSkipLifeline(sessionId: string): Promise<GameQuestion | null> {
    const supabase = createClient();

    const { data: session } = await supabase
      .from('game_sessions')
      .select('lifeline_skip_used, asked_questions')
      .eq('id', sessionId)
      .single();

    if (!session || session.lifeline_skip_used) return null;

    await supabase.from('game_sessions').update({ lifeline_skip_used: true }).eq('id', sessionId);

    const askedCombinations: AskedCombination[] = session.asked_questions || [];
    const nextQuestion = await this.generateQuestion(sessionId, askedCombinations);

    // Skip lifeline kullanıldığında yeni kombinasyonu asked_questions'a ekle
    // Çünkü bu soru gösterilecek
    if (nextQuestion) {
      const newCombination: AskedCombination = {
        questionId: nextQuestion.questionId,
        color: nextQuestion.color || 'default'
      };
      await supabase
        .from('game_sessions')
        .update({ asked_questions: [...askedCombinations, newCombination] })
        .eq('id', sessionId);
    }

    return nextQuestion;
  },
};
