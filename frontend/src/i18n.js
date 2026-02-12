import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Auth
      'sign_in': 'Sign In',
      'email': 'Email Address',
      'password': 'Password',
      'quick_login': 'Quick Login (For Testing)',
      'logout': 'Logout',
      
      // Dashboard
      'welcome': 'Welcome',
      'dashboard': 'Dashboard',
      'management_board': 'Management Board',
      'my_exams': 'My Exams',
      'progress_report': 'Progress Report',
      'view_progress': 'View Progress',
      'start_exam': 'Start Exam',
      'resume_exam': 'Resume Exam',
      'completed': 'Completed',
      'in_progress': 'In Progress',
      
      // Paper 2
      'paper2_submission': 'Paper 2 Submission',
      'upload_answer_sheets': 'Upload Answer Sheets',
      'drag_drop': 'Drag & drop answer sheet photos here',
      'or_click_select': 'or click to select files',
      'supported_formats': 'Supported: PNG, JPG, JPEG, WEBP',
      'selected_files': 'Selected Files',
      'upload': 'Upload',
      'uploading': 'Uploading...',
      'submission_received': 'Submission Received',
      'under_review': 'Your Paper 2 has been submitted and is under review',
      'no_submission': 'No submission yet',
      'submit': 'Submit',
      
      // Teacher
      'submissions': 'Submissions',
      'filter_by_grade': 'Filter by Grade',
      'filter_by_status': 'Filter by Status',
      'all_grades': 'All Grades',
      'all_statuses': 'All Statuses',
      'student_name': 'Student Name',
      'grade': 'Grade',
      'submitted_at': 'Submitted At',
      'status': 'Status',
      'actions': 'Actions',
      'mark': 'Mark',
      'save_draft': 'Save Draft',
      'finalize': 'Finalize',
      'comments': 'Comments',
      'total_score': 'Total Score',
      
      // Progress
      'skill_analysis': 'Skill Analysis',
      'monthly_progress': 'Monthly Progress',
      'export_pdf': 'Export PDF',
      'average_score': 'Average Score',
      
      // Common
      'back': 'Back',
      'close': 'Close',
      'remove': 'Remove',
      'browse': 'Browse',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success'
    }
  },
  si: {
    translation: {
      // Auth
      'sign_in': 'පුරනය වන්න',
      'email': 'විද්‍යුත් තැපැල් ලිපිනය',
      'password': 'මුරපදය',
      'quick_login': 'ඉක්මන් පුරනය (පරීක්ෂණය සඳහා)',
      'logout': 'පිටවීම',
      
      // Dashboard
      'welcome': 'සාදරයෙන් පිළිගනිමු',
      'dashboard': 'කළමනාකරණ පුවරුව',
      'management_board': 'කළමනාකරණ පුවරුව',
      'my_exams': 'මගේ විභාග',
      'progress_report': 'ප්‍රගති වාර්තාව',
      'view_progress': 'ප්‍රගතිය බලන්න',
      'start_exam': 'විභාගය ආරම්භ කරන්න',
      'resume_exam': 'විභාගය නැවත ආරම්භ කරන්න',
      'completed': 'සම්පූර්ණයි',
      'in_progress': 'ක්‍රියාත්මකයි',
      
      // Paper 2
      'paper2_submission': 'පත්‍රිකාව 2 ඉදිරිපත් කිරීම',
      'upload_answer_sheets': 'පිළිතුරු පත්‍ර උඩුගත කරන්න',
      'drag_drop': 'පිළිතුරු පත්‍රවල ඡායාරූප මෙතැනට ඇදගෙන එන්න',
      'or_click_select': 'හෝ ගොනු තෝරන්න ක්ලික් කරන්න',
      'supported_formats': 'සහාය වන්නේ: PNG, JPG, JPEG, WEBP',
      'selected_files': 'තෝරාගත් ගොනු',
      'upload': 'උඩුගත කරන්න',
      'uploading': 'උඩුගත කරමින්...',
      'submission_received': 'ඉදිරිපත් කිරීම ලැබී ඇත',
      'under_review': 'ඔබගේ පත්‍රිකාව 2 ඉදිරිපත් කර ඇති අතර සමාලෝචනය කෙරේ',
      'no_submission': 'තවම ඉදිරිපත් කිරීමක් නැත',
      'submit': 'ඉදිරිපත් කරන්න',
      
      // Teacher
      'submissions': 'ඉදිරිපත් කිරීම්',
      'filter_by_grade': 'ශ්‍රේණිය අනුව පෙරන්න',
      'filter_by_status': 'තත්ත්වය අනුව පෙරන්න',
      'all_grades': 'සියළුම ශ්‍රේණි',
      'all_statuses': 'සියළුම තත්ත්වයන්',
      'student_name': 'ශිෂ්‍ය නම',
      'grade': 'ශ්‍රේණිය',
      'submitted_at': 'ඉදිරිපත් කළ දිනය',
      'status': 'තත්ත්වය',
      'actions': 'ක්‍රියා',
      'mark': 'ලකුණු කරන්න',
      'save_draft': 'කෙටුම්පත සුරකින්න',
      'finalize': 'අවසන් කරන්න',
      'comments': 'අදහස්',
      'total_score': 'මුළු ලකුණු',
      
      // Progress
      'skill_analysis': 'කුසලතා විශ්ලේෂණය',
      'monthly_progress': 'මාසික ප්‍රගතිය',
      'export_pdf': 'PDF නිර්යාත කරන්න',
      'average_score': 'සාමාන්‍ය ලකුණු',
      
      // Common
      'back': 'ආපසු',
      'close': 'වසන්න',
      'remove': 'ඉවත් කරන්න',
      'browse': 'පිරික්සන්න',
      'loading': 'පූරණය වෙමින්...',
      'error': 'දෝෂයකි',
      'success': 'සාර්ථකයි'
    }
  },
  ta: {
    translation: {
      // Auth
      'sign_in': 'உள்நுழைக',
      'email': 'மின்னஞ்சல் முகவரி',
      'password': 'கடவுச்சொல்',
      'quick_login': 'விரைவு உள்நுழைவு (சோதனைக்கு)',
      'logout': 'வெளியேறு',
      
      // Dashboard
      'welcome': 'வரவேற்பு',
      'dashboard': 'மேலாண்மை பலகை',
      'management_board': 'மேலாண்மை பலகை',
      'my_exams': 'எனது தேர்வுகள்',
      'progress_report': 'முன்னேற்ற அறிக்கை',
      'view_progress': 'முன்னேற்றத்தைக் காண்க',
      'start_exam': 'தேர்வைத் தொடங்கு',
      'resume_exam': 'தேர்வைத் தொடரவும்',
      'completed': 'முடிந்தது',
      'in_progress': 'நடைபெறுகிறது',
      
      // Paper 2
      'paper2_submission': 'தாள் 2 சமர்ப்பிப்பு',
      'upload_answer_sheets': 'பதில் தாள்களைப் பதிவேற்றவும்',
      'drag_drop': 'பதில் தாள் புகைப்படங்களை இங்கே இழுத்து விடவும்',
      'or_click_select': 'அல்லது கோப்புகளைத் தேர்ந்தெடுக்க கிளிக் செய்க',
      'supported_formats': 'ஆதரிக்கப்படுபவை: PNG, JPG, JPEG, WEBP',
      'selected_files': 'தேர்ந்தெடுக்கப்பட்ட கோப்புகள்',
      'upload': 'பதிவேற்று',
      'uploading': 'பதிவேற்றுகிறது...',
      'submission_received': 'சமர்ப்பிப்பு பெறப்பட்டது',
      'under_review': 'உங்கள் தாள் 2 சமர்ப்பிக்கப்பட்டது மற்றும் மதிப்பாய்வு செய்யப்படுகிறது',
      'no_submission': 'இன்னும் சமர்ப்பிப்பு இல்லை',
      'submit': 'சமர்ப்பிக்கவும்',
      
      // Teacher
      'submissions': 'சமர்ப்பிப்புகள்',
      'filter_by_grade': 'வகுப்பின்படி வடிகட்டு',
      'filter_by_status': 'நிலையின்படி வடிகட்டு',
      'all_grades': 'அனைத்து வகுப்புகள்',
      'all_statuses': 'அனைத்து நிலைகள்',
      'student_name': 'மாணவர் பெயர்',
      'grade': 'வகுப்பு',
      'submitted_at': 'சமர்ப்பித்த நேரம்',
      'status': 'நிலை',
      'actions': 'செயல்கள்',
      'mark': 'மதிப்பெண்',
      'save_draft': 'வரைவைச் சேமிக்கவும்',
      'finalize': 'இறுதி செய்யவும்',
      'comments': 'கருத்துகள்',
      'total_score': 'மொத்த மதிப்பெண்',
      
      // Progress
      'skill_analysis': 'திறன் பகுப்பாய்வு',
      'monthly_progress': 'மாதாந்திர முன்னேற்றம்',
      'export_pdf': 'PDF ஏற்றுமதி',
      'average_score': 'சராசரி மதிப்பெண்',
      
      // Common
      'back': 'பின்செல்',
      'close': 'மூடு',
      'remove': 'அகற்று',
      'browse': 'உலாவு',
      'loading': 'ஏற்றுகிறது...',
      'error': 'பிழை',
      'success': 'வெற்றி'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'si',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;