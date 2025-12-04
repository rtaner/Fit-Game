'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Filter, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FitCard {
  id: string;
  name: string;
  description: string;
  explanation: string;
  imageUrl: string;
  gender: string;
  category: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [allCards, setAllCards] = useState<FitCard[]>([]);
  const [cards, setCards] = useState<FitCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [quizCategories, setQuizCategories] = useState<any[]>([]);
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string>(''); // Empty to show category selection first
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  useEffect(() => {
    loadQuizCategories();
  }, []);

  useEffect(() => {
    if (selectedQuizCategory) {
      loadFitCards();
    }
  }, [selectedQuizCategory]);

  const loadQuizCategories = async () => {
    try {
      const supabase = createClient();
      const { data: categories } = await supabase
        .from('quiz_categories')
        .select('*')
        .eq('is_quiz_active', true)
        .order('display_order');

      if (categories) {
        setQuizCategories(categories);
        // Don't auto-select, let user choose
      }
    } catch (error) {
      console.error('Error loading quiz categories:', error);
    }
  };

  const loadFitCards = async () => {
    try {
      const supabase = createClient();

      let categoryIds: string[] = [];

      if (selectedQuizCategory === 'all') {
        // Get all active categories for "All Categories"
        const { data: activeCategories } = await supabase
          .from('quiz_categories')
          .select('id')
          .eq('is_active', true)
          .neq('is_all_categories', true);

        if (!activeCategories || activeCategories.length === 0) {
          return;
        }

        categoryIds = activeCategories.map(c => c.id);
      } else {
        // Use selected category
        categoryIds = [selectedQuizCategory];
      }

      // Get all active questions
      const { data: questions, error } = await supabase
        .from('question_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading fit cards:', error);
        return;
      }

      if (questions) {
        const fitCards: FitCard[] = questions.map(q => ({
          id: q.id,
          name: q.name,
          description: q.description || '',
          explanation: q.explanation || q.description || '',
          imageUrl: q.images && Array.isArray(q.images) && q.images.length > 0
            ? q.images[0].url
            : q.image_url || '',
          gender: q.gender || 'Unisex',
          category: q.fit_category || 'Genel',
        }));

        setAllCards(fitCards);
        setCards(fitCards);

        // Extract unique genders and categories
        const genders = Array.from(new Set(fitCards.map(c => c.gender))).sort();
        const categories = Array.from(new Set(fitCards.map(c => c.category))).sort();
        
        setAvailableGenders(genders);
        setAvailableCategories(categories);
      }
    } catch (error) {
      console.error('Error loading fit cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = allCards;

    if (selectedGenders.length > 0) {
      filtered = filtered.filter(card => selectedGenders.includes(card.gender));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(card => selectedCategories.includes(card.category));
    }

    setCards(filtered);
    setCurrentIndex(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setSelectedGenders([]);
    setSelectedCategories([]);
    setCards(allCards);
    setCurrentIndex(0);
    setShowFilterModal(false);
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev =>
      prev.includes(gender)
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 150; // Tinder-style threshold
    const swipeVelocity = 500; // Velocity threshold for quick swipes
    
    const isSwipeRight = info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity;
    const isSwipeLeft = info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity;
    
    // Sağa kaydır → Biliyorum (bu oturumda gösterme)
    if (isSwipeRight) {
      setShowSwipeHint(false);
      
      // Animate out
      setTimeout(() => {
        const newCards = cards.filter((_, index) => index !== currentIndex);
        setCards(newCards);
        if (currentIndex >= newCards.length) {
          setCurrentIndex(Math.max(0, newCards.length - 1));
        }
        // Reset direction after card change
        setDirection(0);
      }, 200);
    } 
    // Sola kaydır → Tekrar et (4-5 kart sonra)
    else if (isSwipeLeft) {
      setShowSwipeHint(false);
      
      // Animate out
      setTimeout(() => {
        const currentCard = cards[currentIndex];
        const newCards = [...cards];
        newCards.splice(currentIndex, 1);
        const insertPosition = Math.min(currentIndex + 4, newCards.length);
        newCards.splice(insertPosition, 0, currentCard);
        setCards(newCards);
        if (currentIndex >= newCards.length) {
          setCurrentIndex(Math.max(0, newCards.length - 1));
        }
        // Reset direction after card change
        setDirection(0);
      }, 200);
    } else {
      // Reset direction if not swiped
      setDirection(0);
    }
  };

  // Show category selection first
  if (!selectedQuizCategory || selectedQuizCategory === '') {
    return (
      <div className="h-screen max-h-screen flex flex-col bg-slate-50 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Eğitim</h1>
            <p className="text-sm text-muted-foreground mt-1">Bir kategori seçerek öğrenmeye başla</p>
          </div>

          <div className="px-5 pb-24 space-y-3">
            {quizCategories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedQuizCategory(category.is_all_categories ? 'all' : category.id);
                }}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mavi-navy border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-sm text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <div className="flex-none px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedQuizCategory('')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Eğitim</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-1">Henüz İçerik Yok</h2>
            <p className="text-sm text-muted-foreground">Bu kategoride eğitim kartı bulunmuyor.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="h-screen max-h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedQuizCategory('')}
              className="w-9 h-9 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              {quizCategories.find(c => (c.is_all_categories && selectedQuizCategory === 'all') || c.id === selectedQuizCategory)?.name || 'Fit Rehberi'}
            </h1>
          </div>
          <div className="text-lg font-bold text-mavi-navy">
            {currentIndex + 1}/{cards.length}
          </div>
        </div>
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-mavi-navy rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-4 bg-white rounded-2xl shadow-2xl z-50 max-w-lg mx-auto max-h-[70vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-foreground">Filtrele</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-95 transition-all"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-140px)]">
                <div className="space-y-4">
                  {/* Gender Row */}
                  {availableGenders.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Cinsiyet</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableGenders.map(gender => (
                          <button
                            key={gender}
                            onClick={() => toggleGender(gender)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedGenders.includes(gender)
                                ? 'bg-mavi-navy text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Row */}
                  {availableCategories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Kategori</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map(category => (
                          <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedCategories.includes(category)
                                ? 'bg-mavi-navy text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-2 p-4 border-t border-slate-200">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold active:scale-95 transition-all"
                >
                  Temizle
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-mavi-navy text-white font-semibold active:scale-95 transition-all"
                >
                  Uygula
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Flash Card - Tinder Style with Swipe */}
      <div className="flex-1 flex flex-col px-5 py-3 overflow-hidden">
        {currentIndex >= cards.length ? (
          // Completion Screen
          <div className="text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Tebrikler!</h2>
            <p className="text-sm text-muted-foreground mb-4">Bu kategoriyi tamamladın</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setCurrentIndex(0)}
                className="px-5 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Tekrar
              </button>
              <button
                onClick={() => setSelectedQuizCategory('')}
                className="px-5 py-2 bg-mavi-navy text-white font-semibold rounded-xl active:scale-95 transition-transform"
              >
                Kategoriler
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDrag={(event, info) => {
                if (info.offset.x > 50) {
                  setDirection(1);
                } else if (info.offset.x < -50) {
                  setDirection(-1);
                } else {
                  setDirection(0);
                }
              }}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing max-h-[calc(100vh-280px)]"
            >
              {/* Image Container */}
              <div className="relative flex-1 bg-slate-100 flex items-center justify-center overflow-hidden rounded-t-3xl min-h-0">
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                
                {/* Swipe Indicators */}
                <motion.div
                  className="absolute top-6 left-6 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-xl border-2 border-white transform -rotate-12"
                  animate={{ 
                    opacity: direction < 0 ? 1 : 0,
                    scale: direction < 0 ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  🔄 TEKRAR ET
                </motion.div>
                
                <motion.div
                  className="absolute top-6 right-6 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl shadow-xl border-2 border-white transform rotate-12"
                  animate={{ 
                    opacity: direction > 0 ? 1 : 0,
                    scale: direction > 0 ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  ✅ ÖĞRENDİM
                </motion.div>
                
                {/* Category Tag */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
                  <span className="text-xs font-bold text-mavi-navy">{currentCard.category}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-none px-4 py-3 bg-white">
                <h3 className="text-base font-bold text-slate-900 mb-1">{currentCard.name}</h3>
                {currentCard.description && (
                  <p className="text-xs text-slate-600 leading-tight line-clamp-2 mb-3">
                    {currentCard.description}
                  </p>
                )}
                
                {/* Navigation Buttons - Inside Card */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const currentCard = cards[currentIndex];
                      const newCards = [...cards];
                      newCards.splice(currentIndex, 1);
                      const insertPosition = Math.min(currentIndex + 4, newCards.length);
                      newCards.splice(insertPosition, 0, currentCard);
                      setCards(newCards);
                      if (currentIndex >= newCards.length) {
                        setCurrentIndex(Math.max(0, newCards.length - 1));
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 font-medium text-sm active:scale-95 transition-transform"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Tekrar Et</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const newCards = cards.filter((_, index) => index !== currentIndex);
                      setCards(newCards);
                      if (currentIndex >= newCards.length) {
                        setCurrentIndex(Math.max(0, newCards.length - 1));
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-mavi-navy font-medium text-sm active:scale-95 transition-transform"
                  >
                    <span>Öğrendim</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
