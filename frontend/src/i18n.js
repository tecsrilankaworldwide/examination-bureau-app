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
      'dashboard': 'උපකරණ පුවරුව',
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