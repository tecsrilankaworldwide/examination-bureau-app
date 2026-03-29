"""
Email notification service using Gmail SMTP
Handles all email notifications for the exam platform
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Email configuration from environment
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "noreply@tecsrilanka.com.lk")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_NAME = "Education Reforms Bureau"


class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email using Gmail SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text fallback (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{FROM_NAME} <{SMTP_EMAIL}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(part1)
            
            part2 = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    @staticmethod
    def send_exam_published_notification(
        parent_email: str,
        student_name: str,
        exam_title: str,
        exam_date: str,
        grade: str,
        language: str = "en"
    ) -> bool:
        """Send notification when exam is published"""
        
        # Translations
        translations = {
            "si": {
                "subject": "නව විභාගය ප්‍රකාශයට පත් කර ඇත",
                "greeting": f"ආයුබෝවන්,",
                "message": f"{student_name} සඳහා නව විභාගයක් ප්‍රකාශයට පත් කර ඇත.",
                "exam": f"විභාගය: {exam_title}",
                "grade": f"ශ්‍රේණිය: {grade}",
                "date": f"දිනය: {exam_date}",
                "action": "කරුණාකර ඔබේ දරුවාට විභාගය සම්පූර්ණ කරන ලෙස මතක් කරන්න.",
                "footer": "ධන්‍යවාද,<br>අධ්‍යාපන ප්‍රතිසංස්කරණ කාර්යාංශය"
            },
            "ta": {
                "subject": "புதிய தேர்வு வெளியிடப்பட்டது",
                "greeting": f"வணக்கம்,",
                "message": f"{student_name} க்கான புதிய தேர்வு வெளியிடப்பட்டுள்ளது.",
                "exam": f"தேர்வு: {exam_title}",
                "grade": f"வகுப்பு: {grade}",
                "date": f"தேதி: {exam_date}",
                "action": "உங்கள் குழந்தைக்கு தேர்வை முடிக்குமாறு நினைவூட்டவும்.",
                "footer": "நன்றி,<br>கல்வி சீர்திருத்த பணியகம்"
            },
            "en": {
                "subject": "New Exam Published",
                "greeting": f"Dear Parent/Guardian,",
                "message": f"A new exam has been published for {student_name}.",
                "exam": f"Exam: {exam_title}",
                "grade": f"Grade: {grade}",
                "date": f"Date: {exam_date}",
                "action": "Please remind your child to complete the exam.",
                "footer": "Thank you,<br>Education Reforms Bureau"
            }
        }
        
        t = translations.get(language, translations["en"])
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #f97316; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                .exam-details {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f97316; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
                .button {{ display: inline-block; background: #f97316; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🎓 {t["subject"]}</h2>
                </div>
                <div class="content">
                    <p>{t["greeting"]}</p>
                    <p>{t["message"]}</p>
                    <div class="exam-details">
                        <strong>{t["exam"]}</strong><br>
                        {t["grade"]}<br>
                        {t["date"]}
                    </div>
                    <p>{t["action"]}</p>
                </div>
                <div class="footer">
                    {t["footer"]}
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(parent_email, t["subject"], html_content)
    
    @staticmethod
    def send_results_ready_notification(
        parent_email: str,
        student_name: str,
        exam_title: str,
        score: int,
        total: int,
        language: str = "en"
    ) -> bool:
        """Send notification when exam results are ready"""
        
        percentage = round((score / total) * 100, 1)
        
        translations = {
            "si": {
                "subject": "විභාග ප්‍රතිඵල සූදානම්",
                "greeting": "ආයුබෝවන්,",
                "message": f"{student_name} ගේ විභාග ප්‍රතිඵල දැන් පැවතී.",
                "exam": f"විභාගය: {exam_title}",
                "score": f"ලකුණු: {score}/{total} ({percentage}%)",
                "action": "සම්පූර්ණ ප්‍රතිඵල සහ කුසලතා විශ්ලේෂණය බැලීමට ප්‍රවේශ වන්න.",
                "footer": "ධන්‍යවාද,<br>අධ්‍යාපන ප්‍රතිසංස්කරණ කාර්යාංශය"
            },
            "ta": {
                "subject": "தேர்வு முடிவுகள் தயார்",
                "greeting": "வணக்கம்,",
                "message": f"{student_name} இன் தேர்வு முடிவுகள் இப்போது கிடைக்கின்றன.",
                "exam": f"தேர்வு: {exam_title}",
                "score": f"மதிப்பெண்கள்: {score}/{total} ({percentage}%)",
                "action": "முழு முடிவுகள் மற்றும் திறன் பகுப்பாய்வு பார்க்க உள்நுழையவும்.",
                "footer": "நன்றி,<br>கல்வி சீர்திருத்த பணியகம்"
            },
            "en": {
                "subject": "Exam Results Ready",
                "greeting": "Dear Parent/Guardian,",
                "message": f"{student_name}'s exam results are now available.",
                "exam": f"Exam: {exam_title}",
                "score": f"Score: {score}/{total} ({percentage}%)",
                "action": "Login to view detailed results and skill analysis.",
                "footer": "Thank you,<br>Education Reforms Bureau"
            }
        }
        
        t = translations.get(language, translations["en"])
        
        # Determine performance color
        if percentage >= 75:
            color = "#10b981"  # green
            emoji = "🎉"
        elif percentage >= 50:
            color = "#f59e0b"  # orange
            emoji = "📊"
        else:
            color = "#ef4444"  # red
            emoji = "📈"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: {color}; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                .score-box {{ background: white; padding: 20px; margin: 15px 0; border-radius: 8px; 
                             text-align: center; border: 3px solid {color}; }}
                .score {{ font-size: 32px; font-weight: bold; color: {color}; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>{emoji} {t["subject"]}</h2>
                </div>
                <div class="content">
                    <p>{t["greeting"]}</p>
                    <p>{t["message"]}</p>
                    <p><strong>{t["exam"]}</strong></p>
                    <div class="score-box">
                        <div class="score">{score}/{total}</div>
                        <div style="font-size: 18px; color: #666;">{percentage}%</div>
                    </div>
                    <p>{t["action"]}</p>
                </div>
                <div class="footer">
                    {t["footer"]}
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(parent_email, t["subject"], html_content)
    
    @staticmethod
    def send_monthly_summary(
        parent_email: str,
        student_name: str,
        month: str,
        exams_taken: int,
        average_score: float,
        improvement: str,
        language: str = "en"
    ) -> bool:
        """Send monthly progress summary to parent"""
        
        translations = {
            "si": {
                "subject": f"{month} - මාසික ප්‍රගති සාරාංශය",
                "greeting": "ආයුබෝවන්,",
                "message": f"{student_name} සඳහා {month} මාසික ප්‍රගති සාරාංශය:",
                "exams": f"විභාග සංඛ්‍යාව: {exams_taken}",
                "average": f"සාමාන්‍ය ලකුණු: {average_score}%",
                "trend": f"ප්‍රවණතාව: {improvement}",
                "footer": "ධන්‍යවාද,<br>අධ්‍යාපන ප්‍රතිසංස්කරණ කාර්යාංශය"
            },
            "ta": {
                "subject": f"{month} - மாதாந்திர முன்னேற்ற சுருக்கம்",
                "greeting": "வணக்கம்,",
                "message": f"{student_name} க்கான {month} மாதாந்திர முன்னேற்ற சுருக்கம்:",
                "exams": f"தேர்வுகள்: {exams_taken}",
                "average": f"சராசரி மதிப்பெண்கள்: {average_score}%",
                "trend": f"போக்கு: {improvement}",
                "footer": "நன்றி,<br>கல்வி சீர்திருத்த பணியகம்"
            },
            "en": {
                "subject": f"{month} - Monthly Progress Summary",
                "greeting": "Dear Parent/Guardian,",
                "message": f"Monthly progress summary for {student_name} ({month}):",
                "exams": f"Exams Taken: {exams_taken}",
                "average": f"Average Score: {average_score}%",
                "trend": f"Trend: {improvement}",
                "footer": "Thank you,<br>Education Reforms Bureau"
            }
        }
        
        t = translations.get(language, translations["en"])
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #3b82f6; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                .stats {{ background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>📊 {t["subject"]}</h2>
                </div>
                <div class="content">
                    <p>{t["greeting"]}</p>
                    <p>{t["message"]}</p>
                    <div class="stats">
                        <p><strong>{t["exams"]}</strong></p>
                        <p><strong>{t["average"]}</strong></p>
                        <p><strong>{t["trend"]}</strong></p>
                    </div>
                </div>
                <div class="footer">
                    {t["footer"]}
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(parent_email, t["subject"], html_content)


# Test function
async def test_email_service():
    """Test the email service"""
    success = EmailService.send_exam_published_notification(
        parent_email="exams@tecsrilanka.com.lk",
        student_name="Test Student",
        exam_title="January 2024 Practice Exam",
        exam_date="2024-01-15",
        grade="Grade 5",
        language="si"  # Test in Sinhala
    )
    return success
