import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, Award, Users, TrendingUp } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const isTamil = i18n.language === 'ta';

  const benefits = [
    {
      icon: BookOpen,
      title: isSinhala ? 'සමුල්ල විභාග පද්ධතිය' : 'Comprehensive Exam System',
      description: isSinhala ? 'ශ්‍රේණි 2-5 සඳහා MCQ සහ ලියන විභාග' : 'Paper 1 MCQ & Paper 2 written exams for Grades 2-5',
    },
    {
      icon: Award,
      title: isSinhala ? 'ලඛු වාර්තාකරණ' : 'Instant Results',
      description: isSinhala ? 'ස්වයංක්‍රිය ලකුණු කිරීම සහ 10 කුසලතා විශ්ලේෂණය' : 'Auto-grading with 10-skill performance analysis',
    },
    {
      icon: Users,
      title: isSinhala ? 'බහු විද්‍යාල හැකිලි' : 'Multi-role Access',
      description: isSinhala ? 'ශිෂ්‍යයන්, මාපියන්, ගුරුවරුන් සහ ප්‍රභානියන්' : 'Dashboards for Students, Parents, Teachers & Admins',
    },
    {
      icon: TrendingUp,
      title: isSinhala ? 'ප්‍රගති පිළිබංදීම' : 'Progress Tracking',
      description: isSinhala ? 'විස්තරවත් කුසලතා පූරණ සහ මාසික වාර්තා' : 'Detailed skill breakdown and monthly reports',
    },
  ];

  const pricing = [
    { grade: '2-3', price: 'LKR 500' },
    { grade: '4-5', price: 'LKR 750' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FDF4E7 50%, #F5FBF6 100%)' }}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇱🇰</span>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#8D153A' }}>
                  {isSinhala ? 'පරීක්ෂණ ඇගයීම කිරීම් බ්‍යුරෝව' : isTamil ? 'தேர்வு மதிப்பீட்டு பணியகம்' : 'Examination Evaluation Bureau'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isSinhala ? 'ඉංග්‍රීසියන් ඇසුරුවදින්' : isTamil ? 'தேசத்தின் புதிய தலைமுறையை உருவாக்குதல்' : 'Building the Nation\'s New Generation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline"
                data-testid="hero-login-button"
              >
                {t('sign_in')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: '#FFF3D6', color: '#8D153A' }}
              >
                {isSinhala ? 'ශිෂ්‍යත්ව විභාග 2026' : isTamil ? 'புலமைப்பரிசில் தேர்வுகள் 2026' : 'Scholarship Exams 2026'}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {isSinhala && (
                  <span className="font-sinhala block mb-2" style={{ color: '#8D153A', lineHeight: 1.75 }}>
                    ශ්‍රී ලංකා ශිෂ්‍යත්ව විභාග
                  </span>
                )}
                {isTamil && (
                  <span className="font-tamil block mb-2" style={{ color: '#8D153A', lineHeight: 1.75 }}>
                    இலங்கை புலமைப்பரிசில் தேர்வுகள்
                  </span>
                )}
                <span style={{ color: '#137B10' }}>
                  Sri Lanka Scholarship Exams
                </span>
                <span className="block mt-2" style={{ color: '#E68100' }}>
                  {isSinhala ? 'ඇගයීම පොර්ටලය' : isTamil ? 'மதிப்பீட்டு நுழைவாயில்' : 'Evaluation Portal'}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground">
                {isSinhala
                  ? 'ශ්‍රේණි 2-5 ශිෂ්‍යයන් සඳහා සමුල්ල විභාග පද්ධතියක් සහ ලඛු ප්‍රගති පිළිබංදීමක්'
                  : isTamil
                  ? 'வகுப்பு 2-5 மாணவர்களுக்கு முழுமையான தேர்வு முறை மற்றும் உடனடி முன்னேற்ற கண்காணிப்பு'
                  : 'Comprehensive exam system with instant results and progress tracking for Grades 2-5 students'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center rounded-md px-8 py-3 text-base font-medium text-white"
                  style={{ backgroundColor: '#8D153A' }}
                  data-testid="hero-login-cta"
                >
                  {t('sign_in')}
                </motion.button>
              </div>
              
              {/* Gold separator */}
              <div className="h-1 w-24 rounded" style={{ backgroundColor: '#F4C430' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1720944519195-76650ee46844?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Sri Lankan students"
                className="w-full h-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#8D153A' }}>
              {isSinhala ? 'මුඛ්‍ය ඇංගිත' : isTamil ? 'முக்கிய அம்சங்கள்' : 'Key Features'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isSinhala
                ? 'ඔබගේ ශිෂ්‍යයාගේ සාර්ථකතාවය සඳහා ඇස දේ'
                : isTamil
                ? 'வெற்றிகரமான தேர்வு தயாரிப்புக்கு தேவையான அனைத்தும்'
                : 'Everything you need for successful exam preparation'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-border hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: '#FAFAFA' }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FFF3D6' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#8D153A' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#137B10' }}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#8D153A' }}>
              {isSinhala ? 'මිලදී ඇංගිත' : 'Pricing'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isSinhala ? 'ශ්‍රේණි අනුව මිල' : 'Affordable pricing by grade'}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-xl border-2 hover:shadow-xl transition-shadow bg-white"
                style={{ borderColor: index === 1 ? '#8D153A' : '#E5E7EB', minWidth: '250px' }}
              >
                <div className="text-center">
                  <p className="text-sm font-medium mb-2" style={{ color: '#667085' }}>
                    {isSinhala ? `ශ්‍රේණි ${plan.grade}` : `Grade ${plan.grade}`}
                  </p>
                  <p className="text-4xl font-bold mb-4" style={{ color: '#8D153A' }}>
                    {plan.price}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {isSinhala ? 'මාසයකට' : 'per month'}
                  </p>
                  <button
                    className="w-full py-2 rounded-md text-sm font-medium"
                    style={{
                      backgroundColor: index === 1 ? '#8D153A' : '#137B10',
                      color: 'white',
                    }}
                  >
                    {t('sign_in')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: '#E8F5E9', color: '#137B10' }}
            >
              <span>💳</span>
              <span>{isSinhala ? 'LankaQR හා විවිධ යැතී පද්ධති සහාය' : 'LankaQR and multiple payment methods accepted'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {isSinhala
                ? 'ස්‍රී ලංකා පරීක්ෂණ ඇගයීම කිරීම් බ්‍යුරෝව'
                : 'Sri Lanka Examination Evaluation Bureau'}
            </p>
            <p className="mt-2">© 2026 {isSinhala ? 'සියළු හක්කම් සුරක්ෂිතයි' : 'All rights reserved'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroSection;