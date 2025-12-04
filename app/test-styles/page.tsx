'use client';

import { useState } from 'react';

/**
 * iOS-Inspired Design Demo
 * Bu sayfa yeni tasarım component'lerini gösterir
 * Mevcut uygulamayı değiştirmez - sadece demo amaçlıdır
 */
export default function TestStylesPage() {
  const [selectedTab, setSelectedTab] = useState<'buttons' | 'cards' | 'game' | 'leaderboard' | 'profile'>('buttons');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* iOS Style Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            🎨 iOS Tasarım Demo
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Temiz iOS görünümü + Canlı oyunlaştırma butonları
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-2 inline-flex gap-2 shadow-sm">
          <button
            onClick={() => setSelectedTab('buttons')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectedTab === 'buttons'
                ? 'bg-white text-blue-600 shadow-md scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Butonlar
          </button>
          <button
            onClick={() => setSelectedTab('cards')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectedTab === 'cards'
                ? 'bg-white text-blue-600 shadow-md scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kartlar
          </button>
          <button
            onClick={() => setSelectedTab('game')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectedTab === 'game'
                ? 'bg-white text-blue-600 shadow-md scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Oyun Demo
          </button>
          <button
            onClick={() => setSelectedTab('leaderboard')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectedTab === 'leaderboard'
                ? 'bg-white text-blue-600 shadow-md scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Liderlik
          </button>
          <button
            onClick={() => setSelectedTab('profile')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectedTab === 'profile'
                ? 'bg-white text-blue-600 shadow-md scale-105'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profil
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        {selectedTab === 'buttons' && <ButtonsDemo />}
        {selectedTab === 'cards' && <CardsDemo />}
        {selectedTab === 'game' && <GameDemo />}
        {selectedTab === 'leaderboard' && <LeaderboardDemo />}
        {selectedTab === 'profile' && <ProfileDemo />}
      </main>
    </div>
  );
}

function ButtonsDemo() {
  return (
    <div className="space-y-8">
      {/* Primary Buttons - iOS Style Clean */}
      <section className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Primary Butonlar (iOS Temiz Stil)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* iOS Gray Primary */}
          <button className="px-8 py-3.5 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 active:scale-95">
            iOS Gri (Primary)
          </button>

          {/* iOS Clean with subtle shadow */}
          <button className="px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-95">
            iOS Beyaz
          </button>

          {/* iOS Blue Accent */}
          <button className="px-8 py-3.5 bg-blue-500 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-600 transition-all duration-200 active:scale-95">
            iOS Mavi (Accent)
          </button>

          {/* iOS Teal Accent */}
          <button className="px-8 py-3.5 bg-teal-500 text-white rounded-xl font-semibold shadow-sm hover:bg-teal-600 transition-all duration-200 active:scale-95">
            iOS Teal (Accent)
          </button>
        </div>
      </section>

      {/* Answer Buttons */}
      <section className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cevap Butonları</h2>
        <div className="space-y-3">
          {/* Normal State */}
          <button className="w-full group relative px-6 py-5 bg-white border-2 border-gray-200 rounded-2xl text-left font-medium transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-600 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                A
              </div>
              <span className="flex-1 text-gray-700 group-hover:text-gray-900">Normal Cevap Seçeneği</span>
            </div>
          </button>

          {/* Correct State */}
          <button className="w-full px-6 py-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl text-left font-medium shadow-lg shadow-green-200/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                ✓
              </div>
              <span className="flex-1 text-green-800 font-semibold">Doğru Cevap! 🎉</span>
            </div>
          </button>

          {/* Wrong State */}
          <button className="w-full px-6 py-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-2xl text-left font-medium shadow-lg shadow-red-200/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white">
                ✕
              </div>
              <span className="flex-1 text-red-800 font-semibold">Yanlış Cevap</span>
            </div>
          </button>
        </div>
      </section>

      {/* Lifeline Buttons */}
      <section className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Joker Butonları</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="group relative px-6 py-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-3xl">🎯</span>
              <span className="text-sm">50:50</span>
            </div>
          </button>

          <button className="group relative px-6 py-6 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-3xl">⏭️</span>
              <span className="text-sm">Atla</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

function CardsDemo() {
  return (
    <div className="space-y-8">
      {/* Category Cards */}
      <section className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Kategori Kartları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Kadın Jean', icon: '👖', color: 'from-blue-500 to-blue-600', count: 45 },
            { name: 'Erkek Jean', icon: '👔', color: 'from-cyan-500 to-cyan-600', count: 38 },
            { name: 'Kumaş Bilgisi', icon: '🧵', color: 'from-purple-500 to-purple-600', count: 52 },
          ].map((category, idx) => (
            <button
              key={idx}
              className="group relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} soru</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Cards */}
      <section className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">İstatistik Kartları</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Puan', value: '1,250', icon: '⭐', color: 'from-yellow-400 to-orange-500' },
            { label: 'Doğru Cevap', value: '85%', icon: '✓', color: 'from-green-400 to-emerald-500' },
            { label: 'Sıralama', value: '#12', icon: '🏆', color: 'from-purple-400 to-pink-500' },
            { label: 'Seri', value: '7 gün', icon: '🔥', color: 'from-red-400 to-orange-500' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border border-gray-100"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
              <div className="relative z-10">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LeaderboardDemo() {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');

  const leaderboardData = [
    { rank: 1, name: 'Ahmet Yılmaz', store: 'Mavi İstanbul AVM', points: 2850, avatar: '👨', trend: 'up' },
    { rank: 2, name: 'Ayşe Demir', store: 'Mavi Ankara Kızılay', points: 2720, avatar: '👩', trend: 'same' },
    { rank: 3, name: 'Mehmet Kaya', store: 'Mavi İzmir Forum', points: 2650, avatar: '👨‍💼', trend: 'down' },
    { rank: 4, name: 'Zeynep Şahin', store: 'Mavi Bursa Kent', points: 2580, avatar: '👩‍💼', trend: 'up' },
    { rank: 5, name: 'Can Öztürk', store: 'Mavi Antalya Migros', points: 2490, avatar: '👨‍🦱', trend: 'up' },
    { rank: 12, name: 'Sen', store: 'Mavi İstanbul Cevahir', points: 1850, avatar: '⭐', trend: 'up', isCurrentUser: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 Liderlik Tablosu</h1>
            <p className="text-white/80">En iyi performans gösterenler</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">#12</div>
            <div className="text-sm text-white/80">Senin Sıran</div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 bg-white/20 backdrop-blur-lg rounded-2xl p-2">
          {[
            { key: 'daily', label: 'Günlük' },
            { key: 'weekly', label: 'Haftalık' },
            { key: 'monthly', label: 'Aylık' },
            { key: 'alltime', label: 'Tüm Zamanlar' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as any)}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                timeFilter === filter.key
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 2nd Place */}
        <div className="pt-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-3xl">
              {leaderboardData[1].avatar}
            </div>
            <div className="text-4xl mb-2">🥈</div>
            <div className="font-bold text-gray-900 mb-1">{leaderboardData[1].name.split(' ')[0]}</div>
            <div className="text-sm text-gray-600 mb-2">{leaderboardData[1].store}</div>
            <div className="text-2xl font-bold text-gray-700">{leaderboardData[1].points}</div>
          </div>
        </div>

        {/* 1st Place */}
        <div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-2xl text-center text-white">
            <div className="w-20 h-20 mx-auto mb-3 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-4xl border-4 border-white/30">
              {leaderboardData[0].avatar}
            </div>
            <div className="text-5xl mb-2">👑</div>
            <div className="font-bold text-xl mb-1">{leaderboardData[0].name.split(' ')[0]}</div>
            <div className="text-sm opacity-90 mb-2">{leaderboardData[0].store}</div>
            <div className="text-3xl font-bold">{leaderboardData[0].points}</div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="pt-12">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-3xl">
              {leaderboardData[2].avatar}
            </div>
            <div className="text-4xl mb-2">🥉</div>
            <div className="font-bold text-gray-900 mb-1">{leaderboardData[2].name.split(' ')[0]}</div>
            <div className="text-sm text-gray-600 mb-2">{leaderboardData[2].store}</div>
            <div className="text-2xl font-bold text-gray-700">{leaderboardData[2].points}</div>
          </div>
        </div>
      </div>

      {/* Rest of Leaderboard */}
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Diğer Sıralamalar</h3>
        <div className="space-y-2">
          {leaderboardData.slice(3).map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                user.isCurrentUser
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                user.isCurrentUser
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                  : 'bg-white text-gray-700'
              }`}>
                {user.rank}
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl">
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">{user.store}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{user.points}</div>
                <div className="text-xs text-gray-500">puan</div>
              </div>
              <div className="text-2xl">
                {user.trend === 'up' && '📈'}
                {user.trend === 'down' && '📉'}
                {user.trend === 'same' && '➡️'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileDemo() {
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'history'>('stats');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-5xl border-4 border-white/30">
            ⭐
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Ahmet Yılmaz</h1>
            <p className="text-white/80 mb-3">Mavi İstanbul Cevahir</p>
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl">
                <div className="text-sm opacity-80">Seviye</div>
                <div className="text-xl font-bold">12</div>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl">
                <div className="text-sm opacity-80">Toplam Puan</div>
                <div className="text-xl font-bold">1,850</div>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl">
                <div className="text-sm opacity-80">Sıralama</div>
                <div className="text-xl font-bold">#12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Seviye 12</span>
            <span>850 / 2000 XP</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: '42.5%' }} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-2 flex gap-2 shadow-sm">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'stats'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 İstatistikler
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'badges'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏅 Rozetler
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📜 Geçmiş
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Toplam Oyun', value: '127', icon: '🎮', color: 'from-blue-400 to-blue-600' },
              { label: 'Doğru Cevap', value: '85%', icon: '✓', color: 'from-green-400 to-green-600' },
              { label: 'Günlük Seri', value: '7 gün', icon: '🔥', color: 'from-orange-400 to-red-500' },
              { label: 'Ortalama Süre', value: '45s', icon: '⏱️', color: 'from-purple-400 to-pink-500' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Category Performance */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kategori Performansı</h3>
            <div className="space-y-4">
              {[
                { name: 'Kadın Jean', progress: 92, color: 'blue', icon: '👖' },
                { name: 'Erkek Jean', progress: 78, color: 'cyan', icon: '👔' },
                { name: 'Kumaş Bilgisi', progress: 85, color: 'purple', icon: '🧵' },
                { name: 'Fit Bilgisi', progress: 88, color: 'teal', icon: '📏' },
              ].map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-700">{category.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${category.color}-400 to-${category.color}-600 rounded-full transition-all duration-500`}
                      style={{ width: `${category.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kazanılan Rozetler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'İlk Adım', icon: '🎯', earned: true, color: 'from-blue-400 to-blue-600' },
                { name: 'Hızlı Cevap', icon: '⚡', earned: true, color: 'from-yellow-400 to-orange-500' },
                { name: 'Mükemmel Seri', icon: '🔥', earned: true, color: 'from-red-400 to-red-600' },
                { name: 'Jean Uzmanı', icon: '👖', earned: true, color: 'from-purple-400 to-purple-600' },
                { name: 'Haftalık Şampiyon', icon: '👑', earned: false, color: 'from-gray-300 to-gray-400' },
                { name: 'Süper Öğrenci', icon: '📚', earned: false, color: 'from-gray-300 to-gray-400' },
                { name: 'Lider', icon: '🏆', earned: false, color: 'from-gray-300 to-gray-400' },
                { name: 'Efsane', icon: '⭐', earned: false, color: 'from-gray-300 to-gray-400' },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`relative p-6 rounded-2xl shadow-lg text-center transition-all duration-300 ${
                    badge.earned
                      ? 'bg-gradient-to-br ' + badge.color + ' text-white hover:scale-105'
                      : 'bg-gray-100 text-gray-400 opacity-50'
                  }`}
                >
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <div className="font-bold text-sm">{badge.name}</div>
                  {!badge.earned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl opacity-20">🔒</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Son Oyunlar</h3>
          <div className="space-y-3">
            {[
              { category: 'Kadın Jean', score: 450, correct: 9, total: 10, time: '2 saat önce', result: 'win' },
              { category: 'Erkek Jean', score: 380, correct: 7, total: 10, time: '5 saat önce', result: 'win' },
              { category: 'Kumaş Bilgisi', score: 420, correct: 8, total: 10, time: 'Dün', result: 'win' },
              { category: 'Fit Bilgisi', score: 320, correct: 6, total: 10, time: 'Dün', result: 'loss' },
            ].map((game, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  game.result === 'win'
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : 'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  {game.result === 'win' ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{game.category}</div>
                  <div className="text-sm text-gray-600">
                    {game.correct}/{game.total} doğru • {game.score} puan
                  </div>
                </div>
                <div className="text-sm text-gray-500">{game.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GameDemo() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showLifelineModal, setShowLifelineModal] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setTimeout(() => setShowResult(true), 300);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Game Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-3/5 transition-all duration-500" />
        </div>

        {/* Score & Question Number */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-gray-900">1,250</span>
          </div>
          <div className="px-4 py-1.5 bg-white rounded-full shadow-sm">
            <span className="text-sm font-semibold text-gray-700">Soru 3/5</span>
          </div>
          <button 
            onClick={() => setShowLifelineModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
          >
            <span className="text-xl">🎯</span>
            <span className="text-sm font-semibold">Joker</span>
          </button>
        </div>

        {/* Product Image - Daha yüksek */}
        <div className="relative h-[50vh] bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👖</div>
              <p className="text-gray-500">Ürün Görseli (Daha Yüksek)</p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-4 bg-gradient-to-b from-white to-gray-50">
          <h3 className="text-lg font-bold text-center text-gray-900">
            Bu jean modeli hangi fit kategorisine aittir?
          </h3>
        </div>

        {/* Answers - Daha düşük yükseklik */}
        <div className="px-6 pb-6 space-y-2.5">
          {['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Skinny Fit'].map((answer, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = showResult && idx === 1;
            const isWrong = showResult && isSelected && idx !== 1;

            return (
              <button
                key={idx}
                onClick={() => !showResult && handleAnswer(idx)}
                disabled={showResult}
                className={`w-full group relative px-5 py-3.5 rounded-2xl text-left font-medium transition-all duration-300 ${
                  isCorrect
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg shadow-green-200/50'
                    : isWrong
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 shadow-lg shadow-red-200/50'
                    : isSelected
                    ? 'bg-blue-50 border-2 border-blue-400 shadow-md'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCorrect
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                        : isWrong
                        ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                        : isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white'
                    }`}
                  >
                    {isCorrect ? '✓' : isWrong ? '✕' : String.fromCharCode(65 + idx)}
                  </div>
                  <span
                    className={`flex-1 text-base ${
                      isCorrect
                        ? 'text-green-800 font-semibold'
                        : isWrong
                        ? 'text-red-800 font-semibold'
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}
                  >
                    {answer}
                  </span>
                  {isCorrect && <span className="text-xl">🎉</span>}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Lifeline Modal */}
      {showLifelineModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLifelineModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Joker Seç</h3>
              <p className="text-sm text-gray-600">Kullanmak istediğin jokere tıkla</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowLifelineModal(false);
                  alert('50:50 Joker kullanıldı!');
                }}
                className="w-full group relative px-6 py-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="text-4xl">🎯</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg">50:50</div>
                    <div className="text-sm opacity-90">2 yanlış şık elenir</div>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs">2 kalan</div>
                </div>
              </button>

              <button 
                onClick={() => {
                  setShowLifelineModal(false);
                  alert('Atla Joker kullanıldı!');
                }}
                className="w-full group relative px-6 py-5 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="text-4xl">⏭️</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg">Atla</div>
                    <div className="text-sm opacity-90">Soruyu atla</div>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs">1 kalan</div>
                </div>
              </button>

              <button 
                onClick={() => {
                  setShowLifelineModal(false);
                  alert('Zaman Dondur Joker kullanıldı!');
                }}
                className="w-full group relative px-6 py-5 bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="text-4xl">⏰</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg">Zaman Dondur</div>
                    <div className="text-sm opacity-90">+30 saniye ekle</div>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs">3 kalan</div>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setShowLifelineModal(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-blue-500">
              <span className="text-2xl">🏠</span>
              <span className="text-xs font-semibold">Ana Sayfa</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
              <span className="text-2xl">🎮</span>
              <span className="text-xs font-semibold">Oyna</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
              <span className="text-2xl">🏆</span>
              <span className="text-xs font-semibold">Sıralama</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
              <span className="text-2xl">👤</span>
              <span className="text-xs font-semibold">Profil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-6 bg-blue-50/80 backdrop-blur-lg rounded-2xl border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-2">💡 Tasarım Özellikleri</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ iOS tarzı yumuşak renkler ve gölgeler</li>
          <li>✓ Backdrop blur efekti (cam görünümü)</li>
          <li>✓ Gradient butonlar ve hover animasyonları</li>
          <li>✓ Canlı emoji kullanımı</li>
          <li>✓ Smooth transitions ve scale efektleri</li>
          <li>✓ Temiz, modern ve oyunlaştırılmış görünüm</li>
        </ul>
      </div>
    </div>
  );
}
