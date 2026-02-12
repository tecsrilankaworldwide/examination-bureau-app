{
  "project": "Examination Evaluation Bureau Platform (Sri Lanka Scholarship Exams, Grades 2-5)",
  "brand_personality": ["official", "trustworthy", "student-friendly", "inclusive", "calm", "clarity-first"],
  "audience": {
    "primary": ["Students (7-11 years)"],
    "secondary": ["Parents", "Teachers", "Administrators"],
    "locale": "Sri Lanka",
    "languages": ["Sinhala", "English"],
    "bilingual_notes": "UI must gracefully accommodate mixed Sinhala/English text without layout shift. Prefer generous line-height and wider letterspacing for Sinhala, avoid ultra-condensed headings."
  },
  "visual_style": {
    "aesthetic": "Government/Education professional with friendly edges",
    "layout_style": ["Grid Layout", "Card Layout", "Bento Grid for dashboards", "Split-Screen hero"],
    "effects": ["subtle glassmorphism on overlays", "micro-elevations", "light parallax in hero"],
    "avoid": ["playful neon", "overly saturated gradients", "busy patterns"]
  },
  "color_system": {
    "rationale": "Grounded in Sri Lankan government tone: deep navy authority, sapphire for trust, Lankan gold accents for emphasis. Pastel tints for child-appropriate warmth without being childish.",
    "tokens": {
      "--background": "210 20% 98%",              
      "--foreground": "224 71% 8%",                
      "--muted": "210 16% 94%",                    
      "--muted-foreground": "220 10% 40%",          
      "--card": "0 0% 100%",                       
      "--card-foreground": "224 71% 8%",

      "--primary": "215 47% 18%",                  
      "--primary-foreground": "0 0% 100%",

      "--secondary": "209 42% 32%",                
      "--secondary-foreground": "0 0% 100%",

      "--accent": "44 62% 46%",                    
      "--accent-foreground": "215 47% 18%",

      "--info": "184 64% 33%",                    
      "--success": "142 38% 36%",                 
      "--warning": "32 95% 44%",                  
      "--destructive": "0 72% 45%",               
      "--ring": "210 20% 40%",

      "--border": "210 16% 90%",                  
      "--input": "210 16% 90%",

      "--radius": "0.6rem"
    },
    "charts": {
      "qualitative_10": [
        "197 66% 45%", 
        "171 52% 40%", 
        "34 88% 44%", 
        "14 86% 50%", 
        "210 60% 44%", 
        "160 43% 36%", 
        "186 48% 35%", 
        "28 72% 44%", 
        "204 56% 36%", 
        "46 72% 48%"
      ],
      "good": "142 38% 36%",
      "average": "44 62% 46%",
      "needs_attention": "14 86% 50%"
    },
    "gradients": {
      "hero_background": {
        "description": "Calm daylight wash, authority to warmth",
        "class": "bg-[radial-gradient(80%_60%_at_50%_10%,hsl(210_20%_98%)_0%,hsl(209_42%_95%)_40%,hsl(197_66%_96%)_70%,hsl(44_62%_95%)_100%)]",
        "coverage_note": "Keep gradient areas under 20% viewport height except hero."
      },
      "accent_strip": {
        "description": "Thin decorative strip for section dividers",
        "class": "bg-[linear-gradient(90deg,hsl(209_42%_32%/0.08),hsl(44_62%_46%/0.08))]"
      }
    }
  },
  "typography": {
    "font_pairs": {
      "headings_en": "Chivo, Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, sans-serif",
      "body_en": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, sans-serif",
      "bilingual_sinhala": "\"Noto Sans Sinhala\", Malithi Web, \"Iskoola Pota\", sans-serif"
    },
    "load_instructions": {
      "google_fonts": [
        "https://fonts.googleapis.com/css2?family=Chivo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;700&display=swap"
      ],
      "apply_css": "body { font-family: var(--font-body); } .font-sinhala { font-family: var(--font-sinhala); } .font-heading { font-family: var(--font-heading); }"
    },
    "css_vars": {
      "--font-heading": "Chivo, Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, sans-serif",
      "--font-body": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, sans-serif",
      "--font-sinhala": "'Noto Sans Sinhala', 'Malithi Web', 'Iskoola Pota', sans-serif"
    },
    "scales": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-[-0.01em]",
      "h2": "text-base md:text-lg font-semibold",
      "body": "text-base sm:text-sm leading-7",
      "small": "text-sm leading-6",
      "label": "text-sm font-medium tracking-wide"
    },
    "sinhala_readability": "Use line-height 1.6–1.75 for Sinhala paragraphs, letter-spacing 0.2px–0.3px. Avoid all caps."
  },
  "spacing_and_grid": {
    "unit": 4,
    "scale": [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64],
    "container": "max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8",
    "grid": {
      "mobile": 4,
      "tablet": 8,
      "desktop": 12,
      "gaps": {"mobile": 12, "tablet": 16, "desktop": 24}
    }
  },
  "iconography": {
    "library": "lucide-react is preferred. Do not use emoji for UI icons.",
    "size": {"sm": 16, "md": 20, "lg": 24}
  },
  "buttons": {
    "shape": "Professional / Corporate",
    "radius_token": "--btn-radius: 10px",
    "variants": {
      "primary": "bg-primary text-primary-foreground hover:bg-[hsl(215_47%_16%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(44_62%_46%)]",
      "secondary": "bg-secondary text-secondary-foreground hover:bg-[hsl(209_42%_28%)]",
      "ghost": "bg-transparent border border-[hsl(210_16%_90%)] hover:bg-[hsl(210_16%_94%)]"
    },
    "sizes": {
      "sm": "h-9 px-3 text-sm",
      "md": "h-11 px-5 text-base",
      "lg": "h-12 px-7 text-base"
    },
    "motion": "hover:shadow-sm transition-colors duration-200 focus:scale-[0.99]"
  },
  "components": {
    "paths": {
      "button": "./components/ui/button.jsx",
      "card": "./components/ui/card.jsx",
      "progress": "./components/ui/progress.jsx",
      "tabs": "./components/ui/tabs.jsx",
      "table": "./components/ui/table.jsx",
      "switch": "./components/ui/switch.jsx",
      "select": "./components/ui/select.jsx",
      "dialog": "./components/ui/dialog.jsx",
      "alert": "./components/ui/alert.jsx",
      "toast": "./components/ui/sonner.jsx",
      "input": "./components/ui/input.jsx",
      "textarea": "./components/ui/textarea.jsx",
      "radio_group": "./components/ui/radio-group.jsx",
      "checkbox": "./components/ui/checkbox.jsx",
      "badge": "./components/ui/badge.jsx",
      "carousel": "./components/ui/carousel.jsx",
      "calendar": "./components/ui/calendar.jsx",
      "tabs_group": "./components/ui/tabs.jsx",
      "tooltip": "./components/ui/tooltip.jsx",
      "skeleton": "./components/ui/skeleton.jsx"
    },
    "patterns": {
      "hero": {
        "layout": "Split-screen on desktop: left content, right decorative SVG/map and subtle parallax. Mobile: single column.",
        "classes": "relative overflow-hidden",
        "content_block": "py-16 sm:py-20 lg:py-24 space-y-6",
        "title": "font-heading text-4xl sm:text-5xl lg:text-6xl text-[hsl(215_47%_18%)]",
        "subtitle": "text-[hsl(220_10%_40%)] max-w-prose",
        "actions": "flex flex-col sm:flex-row gap-3 sm:gap-4"
      },
      "exam_interface": {
        "layout": "Header with timer and progress; two-column body on desktop (question + side navigation); single-column on mobile.",
        "header_classes": "sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b",
        "timer_classes": "text-[hsl(14_86%_50%)] font-semibold tracking-wide",
        "question_card": "bg-card rounded-lg border p-5 sm:p-6",
        "option": "rounded-lg border px-4 py-3 text-left hover:bg-[hsl(210_16%_94%)] focus-visible:ring-2 focus-visible:ring-[hsl(184_64%_33%)]",
        "flag": "data-[active=true]:bg-[hsl(44_62%_96%)] data-[active=true]:ring-1 data-[active=true]:ring-[hsl(44_62%_46%)]"
      },
      "dashboard_cards": {
        "card": "bg-white border rounded-xl p-5 hover:shadow-md transition-shadow",
        "kpi_value": "text-2xl font-semibold text-[hsl(215_47%_18%)]",
        "kpi_label": "text-[hsl(220_10%_40%)]"
      },
      "file_upload": {
        "dropzone": "rounded-xl border-2 border-dashed border-[hsl(210_16%_90%)] bg-[hsl(210_16%_94%/0.5)] p-6 text-center hover:border-[hsl(209_42%_32%)] focus-visible:ring-2 focus-visible:ring-[hsl(184_64%_33%)]",
        "preview": "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      },
      "teacher_marking": {
        "rubric_row": "grid grid-cols-1 sm:grid-cols-12 items-center gap-3 p-3 rounded-lg hover:bg-[hsl(210_16%_94%/0.6)]",
        "rubric_label": "sm:col-span-5 font-medium",
        "rubric_control": "sm:col-span-7"
      },
      "language_toggle": {
        "component": "switch",
        "labeling": "Use 'සි' and 'EN' labels around Switch; ensure aria-label and data-testid attributes.",
        "classes": "flex items-center gap-2 text-sm text-[hsl(220_10%_40%)]"
      }
    }
  },
  "pages": {
    "landing_hero": {
      "structure": ["Top bar with language toggle", "Hero split content", "3 trust badges (Gov crest, Data secure, WCAG AA)", "Callouts: Students | Parents | Teachers"],
      "tailwind": {
        "wrapper": "relative bg-white",
        "hero": "container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-16 lg:py-20",
        "left": "lg:col-span-7 space-y-6",
        "right": "lg:col-span-5 relative"
      },
      "cta_buttons": [
        {"text": "Start Practice - සි", "variant": "primary", "data-testid": "hero-start-practice-button"},
        {"text": "View Guidelines - EN", "variant": "ghost", "data-testid": "hero-view-guidelines-button"}
      ]
    },
    "login": {
      "layout": "Centered card with ministry crest, bilingual title, and social proof below",
      "card": "max-w-md mx-auto p-6 sm:p-8 rounded-2xl border bg-white shadow-sm",
      "fields": ["Email/ID", "Password", "Role select (Student/Parent/Teacher/Admin)"]
    },
    "student_dashboard": {
      "layout": "Bento grid: Next Exam card, Quick Resume, Progress snapshot, Recent attempts",
      "grid": "grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6",
      "areas": {
        "next_exam": "md:col-span-4",
        "progress": "md:col-span-2",
        "recent": "md:col-span-6"
      }
    },
    "exam_interface": {
      "header": ["Logo + title", "Timer prominent", "Question progress dots", "Flag button"],
      "question_area": "MCQ options with radio-group, image where applicable, previous/next controls",
      "nav_panel": "Question list with answered/flagged states and quick jump",
      "accessibility": "All options reachable via keyboard; timer has aria-live polite until last 60s then assertive; never rely on color alone for states."
    },
    "results_page": {
      "primary_viz": "Recharts RadarChart for 10 skills (blood report style) with colored bands and clear labels",
      "secondary_viz": "Bar chart for recent 6 exams; badges for improvements",
      "actions": ["Download PDF", "Share to Parent", "Start Remedial Practice"]
    },
    "paper2_submission": {
      "flow": ["Instructions bilingual", "Drag-drop area", "Image previews with rotate/delete", "Submit with confirmation"],
      "notes": "Compress images client-side if >2MB (downscale to 1600px wide)."
    },
    "teacher_dashboard": {
      "sections": ["Submissions inbox with filters", "Rubric-based marking panel", "Image carousel preview"],
      "filters": ["Status", "Grade", "School", "Date"]
    },
    "parent_dashboard": {
      "widgets": ["Child card selector", "Progress snapshot", "Attendance/attempt history", "Recommendations"],
      "mobile_first": true
    },
    "progress_report": {
      "charts": ["Radar (10 skills)", "Bar (trend)", "Donut (accuracy vs attempts)"],
      "export": "PDF/A4 with bilingual headers"
    }
  },
  "micro_interactions_and_motion": {
    "library": "framer-motion",
    "rules": [
      "Use motion only on entrance and hover; prefer 150–250ms ease-out.",
      "Do not use transition: all; target only color, opacity, shadow.",
      "Timer blinks and gently shakes at <60s, increases at <10s.",
      "Correct answer: subtle confetti via lottie; wrong: supportive hint pulse."
    ],
    "examples": {
      "button": "hover:translate-y-[-1px] hover:shadow-sm transition-colors duration-200",
      "card_entrance": "Spring up from 4px with opacity fade-in"
    }
  },
  "accessibility": {
    "contrast": "All text meets WCAG AA. Primary on white >= 7:1 for small text.",
    "touch_targets": ">=44px on mobile for options and nav dots.",
    "focus": "Visible 2px ring using --info color; never removed.",
    "aria": ["aria-live for timer", "aria-describedby for question images", "role=group for option sets"],
    "lang_attr": "Set html lang dynamically: si or en"
  },
  "testing_attributes": {
    "policy": "Every interactive and key informational element MUST include data-testid in kebab-case describing role.",
    "examples": [
      "data-testid=\"login-form-submit-button\"",
      "data-testid=\"exam-timer\"",
      "data-testid=\"mcq-option-1\"",
      "data-testid=\"question-flag-toggle\"",
      "data-testid=\"paper2-dropzone\"",
      "data-testid=\"teacher-rubric-score-select\"",
      "data-testid=\"results-radar-chart\""
    ]
  },
  "code_scaffolds_jsx": {
    "LanguageToggle": "import { Switch } from './components/ui/switch.jsx';\nexport const LanguageToggle = ({ value='si', onChange }) => (\n  <div className=\"flex items-center gap-2\" data-testid=\"language-toggle\">\n    <span className=\"text-sm\">සි</span>\n    <Switch checked={value==='en'} onCheckedChange={(v)=>onChange(v?'en':'si')} aria-label=\"Language toggle\" data-testid=\"language-toggle-switch\"/>\n    <span className=\"text-sm\">EN</span>\n  </div>\n);",
    "ExamHeader": "import { Button } from './components/ui/button.jsx';\nimport { Progress } from './components/ui/progress.jsx';\nexport const ExamHeader = ({ timeLeft, progress }) => (\n  <header className=\"sticky top-0 z-30 bg-white/90 backdrop-blur border-b\">\n    <div className=\"max-w-[1120px] mx-auto px-4 h-14 flex items-center justify-between\">\n      <div className=\"font-semibold\">Scholarship Examination</div>\n      <div className=\"flex items-center gap-4\">\n        <div className=\"text-[hsl(14_86%_50%)] font-semibold\" aria-live=\"polite\" data-testid=\"exam-timer\">{timeLeft}</div>\n        <Button variant=\"ghost\" data-testid=\"question-flag-toggle\">Flag</Button>\n      </div>\n    </div>\n    <div className=\"max-w-[1120px] mx-auto px-4 py-2\">\n      <Progress value={progress} data-testid=\"exam-progress\" />\n    </div>\n  </header>\n);",
    "MCQOptions": "import { RadioGroup, RadioGroupItem } from './components/ui/radio-group.jsx';\nimport { Label } from './components/ui/label.jsx';\nexport const MCQOptions = ({ options, value, onChange }) => (\n  <RadioGroup value={value} onValueChange={onChange} className=\"grid gap-3\" data-testid=\"mcq-options\">\n    {options.map((opt, idx) => (\n      <div key={idx} className=\"rounded-lg border px-4 py-3 hover:bg-[hsl(210_16%_94%)]\">\n        <div className=\"flex items-start gap-3\">\n          <RadioGroupItem value={String(idx)} id={\`opt-\${idx}\`} data-testid={\`mcq-option-\${idx}\`} />\n          <Label htmlFor={\`opt-\${idx}\`} className=\"flex-1 cursor-pointer\">{opt}</Label>\n        </div>\n      </div>\n    ))}\n  </RadioGroup>\n);",
    "Paper2Dropzone": "import { useCallback } from 'react';\nimport { useDropzone } from 'react-dropzone';\nexport const Paper2Dropzone = ({ onFiles }) => {\n  const onDrop = useCallback((accepted) => onFiles(accepted), [onFiles]);\n  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });\n  return (\n    <div {...getRootProps()} className=\"rounded-xl border-2 border-dashed p-6 text-center bg-[hsl(210_16%_94%/0.5)]\" data-testid=\"paper2-dropzone\">\n      <input {...getInputProps()} />\n      {isDragActive ? 'Drop images here' : 'Drag & drop answer images, or click to select'}\n    </div>\n  );\n};",
    "ResultsRadar": "import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';\nexport const ResultsRadar = ({ data }) => (\n  <div className=\"w-full h-[360px]\" data-testid=\"results-radar-chart\">\n    <RadarChart cx=\"50%\" cy=\"50%\" outerRadius=\"80%\" width={600} height={360} data={data}>\n      <PolarGrid />\n      <PolarAngleAxis dataKey=\"skill\" tick={{ fontSize: 12 }} />\n      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />\n      <Radar dataKey=\"score\" stroke=\"#1F8A70\" fill=\"#1F8A70\" fillOpacity={0.4} />\n    </RadarChart>\n  </div>\n);"
  },
  "libraries_and_setup": {
    "required": [
      {"name": "recharts", "reason": "Charts for progress and radar"},
      {"name": "framer-motion", "reason": "Entrance/micro animations"},
      {"name": "react-dropzone", "reason": "Accessible drag & drop upload"},
      {"name": "lottie-react", "reason": "Subtle confetti on success"}
    ],
    "install": "npm i recharts framer-motion react-dropzone lottie-react",
    "usage_notes": [
      "Always wrap toasts using ./components/ui/sonner.jsx",
      "Prefer shadcn/ui components from ./components/ui for inputs, selects, dialogs, calendars"
    ]
  },
  "charts_spec": {
    "radar_10_skills": {
      "data_shape": "[{ skill: 'Math', score: 80 }, ...] (10 items)",
      "palette_indexing": "Map in order to color fill or stroke subtly; keep 0.4 opacity",
      "empty_state": "Show dashed grid with 'No data yet' and CTA to start practice"
    },
    "bar_trend": {
      "bars": 6,
      "colors": "Use --secondary for bars, --accent for highlight",
      "axes": "12px ticks, 10px labels on mobile"
    }
  },
  "images": {
    "usage": "Use culturally relevant, respectful imagery of Sri Lankan classrooms and learning moments. Do not overuse photos; 1 hero, 1-2 supporting in dashboards.",
    "image_urls": [
      {
        "url": "https://images.unsplash.com/photo-1603056218836-485b716ac4ad",
        "description": "Sri Lankan students walking in town (contextual, neutral)",
        "category": "hero_supporting"
      },
      {
        "url": "https://images.unsplash.com/photo-1745184153304-950a6449c0ea",
        "description": "Primary school style building entrance (abstract backdrop)",
        "category": "dashboard_banner"
      },
      {
        "url": "https://images.unsplash.com/photo-1707879406529-1c6b24794005",
        "description": "Historic school architecture feel (texture card)",
        "category": "content_illustration"
      }
    ]
  },
  "i18n": {
    "strategy": "Centralize strings with keys; provide Sinhala and English translations. Auto-size headings; avoid hard widths on labels.",
    "components": ["LanguageToggle", "Bilingual page titles", "PDF export supports Unicode Sinhala"]
  },
  "page_specific_details": {
    "landing": {
      "bilingual_title_example": "\u0dc3\u0dbb\u0da7\u0dba\u0db1\u0db8\u0dca \u0db4\u0dcf\u0dab\u0db1\u0dca \u0d9c\u0ddc\u0dab\u0dd2\u0daf\u0dd2\u0daf\u0dd2 | Building the Nation's New Generation",
      "trust_row": "3 simple badges with concise captions; no animation"
    },
    "login": {
      "fields_testids": ["login-email-input", "login-password-input", "login-role-select", "login-form-submit-button"]
    },
    "exam": {
      "states": ["unanswered (neutral border)", "answered (solid secondary)", "flagged (accent ring)", "current (primary outline)"],
      "timer_thresholds": {"warn": 60, "critical": 10}
    },
    "results": {
      "badges": ["Top 10%", "Improved", "Consistent"],
      "pdf_header": "Include bilingual masthead + student details + seal"
    },
    "paper2": {
      "image_controls": ["rotate", "delete", "caption optional"],
      "validation": "Min 1 image, max 8, only jpg/png, each < 2MB suggested"
    },
    "teacher": {
      "rubric_fields": ["Clarity", "Grammar", "Structure", "Relevance", "Creativity"],
      "shortcuts": "Arrow keys to move submissions; S to save; F to toggle full image"
    },
    "parent": {
      "callouts": ["Strengths", "Areas to focus", "Recommended practice sets"]
    }
  },
  "noise_and_textures": {
    "subtle_noise_css": "background-image: radial-gradient(hsla(0,0%,0%,0.02) 1px, transparent 1px); background-size: 24px 24px;",
    "where": ["hero overlay", "section dividers", "empty states"]
  },
  "component_path": {
    "shadcn": [
      "./components/ui/button.jsx",
      "./components/ui/card.jsx",
      "./components/ui/progress.jsx",
      "./components/ui/tabs.jsx",
      "./components/ui/table.jsx",
      "./components/ui/switch.jsx",
      "./components/ui/select.jsx",
      "./components/ui/dialog.jsx",
      "./components/ui/alert.jsx",
      "./components/ui/sonner.jsx",
      "./components/ui/input.jsx",
      "./components/ui/textarea.jsx",
      "./components/ui/radio-group.jsx",
      "./components/ui/checkbox.jsx",
      "./components/ui/badge.jsx",
      "./components/ui/carousel.jsx",
      "./components/ui/calendar.jsx",
      "./components/ui/tooltip.jsx",
      "./components/ui/skeleton.jsx"
    ],
    "third_party": ["recharts", "react-dropzone", "framer-motion", "lottie-react"]
  },
  "instructions_to_main_agent": [
    "Set CSS custom properties in :root to match color_system.tokens; do not rely on defaults.",
    "Adopt font loading snippet in index.html and update body font via --font-body; add .font-sinhala where Sinhala is forced (e.g., headings in Sinhala locales).",
    "Implement data-testid attributes on every interactive and key informational element using kebab-case role names.",
    "Use shadcn components from ./components/ui only; do not use native HTML selects/dropdowns where a shadcn equivalent exists.",
    "Add react-dropzone for Paper 2 upload. Style with file_upload.dropzone classes and include preview grid.",
    "Use Recharts RadarChart and BarChart exactly as specified; keep fonts readable (>=12px ticks).",
    "Respect gradient restriction rule: limit decorative gradients to hero and thin section accents only.",
    "Mobile-first: stack columns; ensure 44px tap targets for options and navigation.",
    "Timer: aria-live polite; switch to assertive below 10s and add subtle shake animation.",
    "WCAG: Ensure focus rings visible and maintain 2–3x whitespace vs dense defaults."
  ],
  "data_testid_matrix": {
    "landing": ["language-toggle", "hero-start-practice-button", "hero-view-guidelines-button"],
    "login": ["login-email-input", "login-password-input", "login-role-select", "login-form-submit-button"],
    "student_dashboard": ["next-exam-card", "progress-widget", "recent-attempts-table"],
    "exam": ["exam-timer", "mcq-options", "mcq-option-0", "question-flag-toggle", "question-next-button", "question-prev-button"],
    "results": ["results-radar-chart", "results-trend-chart", "download-pdf-button"],
    "paper2": ["paper2-dropzone", "paper2-preview-0", "paper2-submit-button"],
    "teacher": ["teacher-filter-select", "teacher-submission-row", "teacher-rubric-score-select", "teacher-save-grade-button"],
    "parent": ["child-selector", "parent-progress-radar", "recommendation-card"]
  }
}


<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
