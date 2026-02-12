{
  "brand_attributes": {
    "name": "Examination Evaluation Bureau (EEB) – Scholarship Exams",
    "personality": ["trustworthy", "government-standard", "student-first", "calm", "precise"],
    "tone": "formal, bilingual (Sinhala + English), accessible, respectful"
  },
  "goals_and_success": {
    "student_parent": [
      "Upload Paper 2 answer photos successfully",
      "See per-file progress and a clear final submission state",
      "Fix issues (retake, reorder, delete) before final submit"
    ],
    "teacher": [
      "Filter submissions by grade/month/status",
      "Open a submission, review photos in a carousel",
      "Score 10 rubric skills quickly with sliders or inputs",
      "Save Draft, add comments, then Finalize with confidence"
    ],
    "analytics": [
      "Understand monthly skill-wise progress",
      "Export charts to PDF for reports"
    ]
  },
  "color_system": {
    "notes": "Sri Lankan flag colors applied with accessibility-first usage. Maroon as primary, green and saffron/orange as accents; gold as highlight/border.",
    "tokens_hex": {
      "maroon_primary": "#8D153A",
      "maroon_primary_700": "#761233",
      "green_accent": "#137B10",
      "saffron_accent": "#E68100",
      "gold": "#F4C430",
      "neutral_bg": "#F5F7FA",
      "neutral_card": "#FFFFFF",
      "neutral_border": "#E5E7EB",
      "text_strong": "#101828",
      "text_muted": "#667085",
      "success": "#1A7F37",
      "warning": "#F79009",
      "danger": "#D92D20",
      "info": "#0F766E"
    },
    "tokens_hsl": {
      "--background": "210 20% 98%",
      "--foreground": "224 71% 8%",
      "--card": "0 0% 100%",
      "--border": "210 16% 90%",
      "--primary": "338 74% 32%", 
      "--primary-foreground": "0 0% 100%",
      "--secondary": "148 79% 27%", 
      "--secondary-foreground": "0 0% 100%",
      "--accent": "32 100% 45%", 
      "--accent-foreground": "224 71% 8%",
      "--gold": "47 88% 58%", 
      "--muted": "210 16% 94%",
      "--muted-foreground": "220 10% 40%",
      "--ring": "210 20% 40%",
      "--success": "142 60% 32%",
      "--warning": "32 95% 44%",
      "--destructive": "0 72% 45%"
    },
    "usage": {
      "primary": "Headings, primary CTAs, chart strokes for key metrics, active nav.",
      "secondary": "Accents for success/positive states, toggle on hero badges.",
      "accent": "Highlights, progress bars, file chip borders, hover states.",
      "gold": "Hero separator lines, table header hairlines, stat highlights.",
      "content_bg": "White cards on neutral background for readability.",
      "status": {
        "success": "Use on success badges, toasts, and finalized states.",
        "warning": "Pending/in-progress; do not use for destructive actions.",
        "danger": "Errors, deletions, rejections only."
      }
    },
    "gradients": {
      "rule": "Max 20% viewport, not for text-heavy areas. No dark/saturated stacks; enforce solid fallback.",
      "hero_background": ["#FFF8E1", "#FDF4E7", "#F5FBF6"],
      "cta_subtle": ["#FFF3D6", "#FFFDF5"],
      "decorative_strip": ["#8D153A", "#F4C430", "#137B10"],
      "fallback_if_breach": "Use solid #FFFFFF with gold hairlines if gradient harms readability."
    }
  },
  "typography": {
    "english": {
      "heading": "Chivo (existing)",
      "body": "Inter (existing)"
    },
    "sinhala": {
      "family": "Noto Sans Sinhala, Malithi Web, Iskoola Pota (existing var --font-sinhala)",
      "recommendations": "Use .font-sinhala class on Sinhala blocks; line-height 1.75; letter-spacing 0.025em for legibility."
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs sm:text-sm"
    },
    "do_dont": [
      "Do not mix Sinhala/English fonts on the same word.",
      "Use Sinhala numerals only where culturally expected (otherwise Arabic numerals).",
      "Maintain consistent bilingual headings: Sinhala first, then English below."
    ]
  },
  "layout_and_grids": {
    "container": {
      "max_width": "1200px",
      "padding": "0 1rem",
      "mobile_first": true
    },
    "paper2_upload": {
      "mobile": "single column: dropzone -> file list -> submission panel",
      "md_up": "grid-cols-[1.5fr,1fr] with 24px gap: left dropzone + previews; right submission status panel"
    },
    "teacher_marking": {
      "filters_row": "responsive wrap row of Selects and Search (1fr auto auto)",
      "content_split": "md_up: 2 columns: list (1fr) | details drawer/carousel (sheet/drawer on mobile)",
      "rubric_grid": "5x2 rubric cards or a single Card with 10 Slider rows"
    },
    "analytics": {
      "top_filters": "month Select + grade Tabs",
      "grid": "md: grid-cols-2 (left per-skill line chart, right radar); sm: stacked"
    },
    "hero": {
      "structure": "split-screen on lg: left bilingual copy + CTAs; right illustrative image/card stack; stacked on mobile",
      "compliance": "Government-standard clarity: logo, title, description, primary action first"
    }
  },
  "components_spec": {
    "shared": {
      "button": {
        "use": "./frontend/src/components/ui/button.jsx",
        "variants": {
          "primary": "maroon fill, white text",
          "secondary": "green fill, white text",
          "ghost": "text maroon, subtle bg hover"
        },
        "motion": "hover:bg-opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2",
        "testing": "Add data-testid=\"primary-cta-button\" etc"
      },
      "card": "./frontend/src/components/ui/card.jsx",
      "badge": "./frontend/src/components/ui/badge.jsx",
      "progress": "./frontend/src/components/ui/progress.jsx",
      "input": "./frontend/src/components/ui/input.jsx",
      "textarea": "./frontend/src/components/ui/textarea.jsx",
      "select": "./frontend/src/components/ui/select.jsx",
      "tabs": "./frontend/src/components/ui/tabs.jsx",
      "table": "./frontend/src/components/ui/table.jsx",
      "slider": "./frontend/src/components/ui/slider.jsx",
      "dialog": "./frontend/src/components/ui/dialog.jsx",
      "sheet": "./frontend/src/components/ui/sheet.jsx",
      "carousel": "./frontend/src/components/ui/carousel.jsx",
      "tooltip": "./frontend/src/components/ui/tooltip.jsx",
      "sonner_toast": "./frontend/src/components/ui/sonner.jsx"
    },
    "paper2_photo_upload": {
      "layout": "Card with header (title + Sinhala subtitle) and body split: left drop area, right status.",
      "drop_area": {
        "component": "Custom UploadDropzone (compose Card + Input[type=file] + area)",
        "style": "dashed border, 12px radius, icon center, bilingual label",
        "micro": [
          "onDragEnter: border-color shifts to --accent",
          "onDrop: show Progress and preview chips with remove"
        ],
        "testing": [
          "data-testid=\"paper2-dropzone\"",
          "data-testid=\"paper2-file-input\""
        ]
      },
      "previews": {
        "component": "Carousel for full-screen preview; small list with Badge(status)",
        "testing": ["data-testid=\"paper2-file-item\"", "data-testid=\"paper2-remove-file-button\""]
      },
      "status_panel": {
        "items": ["Upload count", "Progress bar", "Submission status (Draft/Submitted)", "Submit button"],
        "testing": ["data-testid=\"paper2-submit-button\"", "data-testid=\"paper2-progress\""]
      }
    },
    "teacher_marking": {
      "filters": {
        "components": ["Select (Grade)", "Select (Month)", "Select (Status)", "Input (Search)", "Button (Reset)"]
      },
      "list": {
        "component": "Table with sortable columns",
        "row": "Candidate name, Grade, Received date, Status badge, Open button",
        "testing": ["data-testid=\"marking-row\"", "data-testid=\"open-marking-detail-button\""]
      },
      "detail_view": {
        "pattern": "Sheet on mobile, Side panel on desktop",
        "media": "Carousel of uploaded pages with zoom",
        "rubric": "10 Slider rows with numeric input fallback",
        "actions": ["Save Draft (secondary)", "Finalize (primary)"]
      }
    },
    "analytics_charts": {
      "charts": [
        "Per-skill LineChart with month filter",
        "RadarChart overview of 10 skills"
      ],
      "export": "Button to export current view as PDF"
    },
    "language_toggle": {
      "component": "DropdownMenu in header: Sinhala / English",
      "testing": ["data-testid=\"language-toggle\"", "data-testid=\"language-option-si\"", "data-testid=\"language-option-en\""]
    },
    "hero_section": {
      "elements": ["Gov logo + title in Sinhala & English", "Subheading", "CTAs: Login/Register", "Benefits grid", "Pricing in LKR", "LankaQR mention"]
    }
  },
  "tailwind_and_tokens": {
    "css_tokens_to_add": ":root { --maroon: 338 74% 32%; --green: 148 79% 27%; --saffron: 32 100% 45%; --gold: 47 88% 58%; }",
    "button_classes": {
      "primary": "inline-flex items-center justify-center rounded-md bg-[hsl(var(--primary))] text-white px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--primary)_/_0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 transition-colors",
      "secondary": "inline-flex items-center justify-center rounded-md bg-[hsl(var(--secondary))] text-white px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--secondary)_/_0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 transition-colors",
      "ghost": "inline-flex items-center justify-center rounded-md text-[hsl(var(--primary))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 transition-colors"
    },
    "status_badges": {
      "draft": "bg-yellow-50 text-yellow-800 border border-yellow-200",
      "submitted": "bg-green-50 text-green-800 border border-green-200",
      "rejected": "bg-red-50 text-red-800 border border-red-200"
    }
  },
  "micro_interactions_and_motion": {
    "principles": [
      "No universal 'transition: all'; animate only color, opacity, box-shadow.",
      "Entrance animations: fade and slight translate for cards and modals.",
      "Hover: subtle elevation for cards, color shift for CTAs.",
      "Scroll parallax: hero decorative strip only, not content."
    ],
    "framer_motion_examples": {
      "card_entrance_jsx": "<motion.div initial={{opacity:0, y:8}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.3, ease:'easeOut'}}></motion.div>",
      "button_press_jsx": "<motion.button whileTap={{scale:0.98}} className=\"...\"></motion.button>"
    }
  },
  "feature_scaffolds_jsx": {
    "paper2_upload": "import React from 'react';\nimport { Card } from './frontend/src/components/ui/card.jsx';\nimport { Button } from './frontend/src/components/ui/button.jsx';\nimport { Progress } from './frontend/src/components/ui/progress.jsx';\nimport { Dialog, DialogContent, DialogHeader, DialogTitle } from './frontend/src/components/ui/dialog.jsx';\nimport { useDropzone } from 'react-dropzone';\n\nexport default function Paper2Upload() {\n  const [files, setFiles] = React.useState([]);\n  const [submitting, setSubmitting] = React.useState(false);\n  const onDrop = React.useCallback((accepted) => {\n    const withMeta = accepted.map((f) => ({ file: f, progress: 0, id: crypto.randomUUID() }));\n    setFiles((prev) => [...prev, ...withMeta]);\n    // start fake progress; replace with real upload\n  }, []);\n  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });\n\n  return (\n    <div className=\"container grid md:grid-cols-[1.5fr_1fr] gap-6\">\n      <Card className=\"p-6\">\n        <div {...getRootProps({ className: `border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragActive ? 'border-[hsl(var(--accent))] bg-amber-50' : 'border-[hsl(var(--border))]'}` })} data-testid=\"paper2-dropzone\">\n          <input {...getInputProps()} data-testid=\"paper2-file-input\" />\n          <p className=\"font-sinhala text-sm text-[hsl(var(--muted-foreground))]\">ඡායාරූප පතන - මෙතැනට ඇදලා හෝ තෝරන්න</p>\n          <p className=\"text-sm text-[hsl(var(--muted-foreground))]\">Drag and drop photos here or click to select</p>\n          <Button className=\"mt-3\" data-testid=\"paper2-browse-button\">Browse</Button>\n        </div>\n        <ul className=\"mt-6 space-y-3\">\n          {files.map((f) => (\n            <li key={f.id} className=\"flex items-center gap-3\" data-testid=\"paper2-file-item\">\n              <div className=\"flex-1 truncate\">{f.file.name}</div>\n              <div className=\"w-40\"><Progress value={f.progress} data-testid=\"paper2-progress\" /></div>\n              <Button variant=\"ghost\" onClick={() => setFiles(files.filter(x => x.id !== f.id))} data-testid=\"paper2-remove-file-button\">Remove</Button>\n            </li>\n          ))}\n        </ul>\n      </Card>\n      <Card className=\"p-6 space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <h3 className=\"font-semibold\">Submission</h3>\n          <span className=\"status-badge in-progress\">Draft</span>\n        </div>\n        <Button disabled={!files.length || submitting} onClick={() => setSubmitting(true)} className=\"w-full\" data-testid=\"paper2-submit-button\">Submit</Button>\n      </Card>\n    </div>\n  );\n}",
    "teacher_marking_detail": "import React from 'react';\nimport { Sheet, SheetContent } from './frontend/src/components/ui/sheet.jsx';\nimport { Button } from './frontend/src/components/ui/button.jsx';\nimport { Slider } from './frontend/src/components/ui/slider.jsx';\nimport { Textarea } from './frontend/src/components/ui/textarea.jsx';\n\nexport function MarkingDetail({ open, onOpenChange, submission }) {\n  const [scores, setScores] = React.useState(Array(10).fill(0));\n  const total = scores.reduce((a,b)=>a+b,0);\n  const update = (i, v) => setScores((s) => s.map((x, idx) => idx === i ? v[0] : x));\n  return (\n    <Sheet open={open} onOpenChange={onOpenChange}>\n      <SheetContent className=\"w-full sm:w-[520px] space-y-6\">\n        <div>\n          <h3 className=\"font-semibold\">{submission?.studentName}</h3>\n          <p className=\"text-sm text-[hsl(var(--muted-foreground))]\">Grade {submission?.grade} · {submission?.month}</p>\n        </div>\n        <div className=\"space-y-4\">\n          {Array.from({length:10}).map((_,i)=> (\n            <div key={i} className=\"space-y-2\">\n              <div className=\"flex items-center justify-between\">\n                <span>Skill {i+1}</span>\n                <span className=\"text-sm text-[hsl(var(--muted-foreground))]\">{scores[i]}</span>\n              </div>\n              <Slider min={0} max={10} step={1} value={[scores[i]]} onValueChange={(v)=>update(i,v)} data-testid=\"rubric-slider\" />\n            </div>\n          ))}\n        </div>\n        <div>\n          <label className=\"text-sm font-medium\">Comments</label>\n          <Textarea rows={4} placeholder=\"Notes for the student\" data-testid=\"rubric-comment-textarea\" />\n        </div>\n        <div className=\"flex gap-3\">\n          <Button variant=\"secondary\" data-testid=\"save-draft-button\">Save Draft</Button>\n          <Button className=\"ml-auto\" data-testid=\"finalize-button\">Finalize</Button>\n          <div className=\"ml-4 text-sm text-[hsl(var(--muted-foreground))]\">Total: <span className=\"font-semibold\">{total}</span></div>\n        </div>\n      </SheetContent>\n    </Sheet>\n  );\n}",
    "recharts_block": "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';\n\nconst colors = { primary: '#8D153A', green: '#137B10', gold: '#F4C430' };\n\nexport function SkillTrend({ data }) {\n  return (\n    <div className=\"h-64\">\n      <ResponsiveContainer width=\"100%\" height=\"100%\">\n        <LineChart data={data}>\n          <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#E5E7EB\" />\n          <XAxis dataKey=\"month\" />\n          <YAxis domain={[0,10]} />\n          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB' }} />\n          <Line type=\"monotone\" dataKey=\"score\" stroke={colors.primary} strokeWidth={2} dot={{ r: 2 }} />\n        </LineChart>\n      </ResponsiveContainer>\n    </div>\n  );\n}\n\nexport function SkillsRadar({ data }) {\n  return (\n    <div className=\"h-72\">\n      <ResponsiveContainer width=\"100%\" height=\"100%\">\n        <RadarChart data={data}>\n          <PolarGrid />\n          <PolarAngleAxis dataKey=\"skill\" tick={{ fontSize: 12 }} />\n          <PolarRadiusAxis domain={[0,10]} />\n          <Radar name=\"Avg\" dataKey=\"value\" stroke={colors.green} fill={colors.green} fillOpacity={0.2} />\n          <Legend />\n          <Tooltip />\n        </RadarChart>\n      </ResponsiveContainer>\n    </div>\n  );\n}",
    "export_pdf": "import jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';\n\nexport async function exportChartsToPDF(rootId = 'charts-root') {\n  const el = document.getElementById(rootId);\n  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });\n  const imgData = canvas.toDataURL('image/png');\n  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });\n  const w = pdf.internal.pageSize.getWidth();\n  const h = (canvas.height * w) / canvas.width;\n  pdf.addImage(imgData, 'PNG', 0, 0, w, h);\n  pdf.save('eeb-progress.pdf');\n}"
  },
  "language_and_bilingual": {
    "library": "i18next + react-i18next",
    "header_toggle_jsx": "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './frontend/src/components/ui/dropdown-menu.jsx';\nimport { Globe } from 'lucide-react';\n\nexport function LanguageToggle() {\n  return (\n    <DropdownMenu>\n      <DropdownMenuTrigger className=\"btn btn-outline\" data-testid=\"language-toggle\"><Globe className=\"mr-2 h-4 w-4\" />සිං / EN</DropdownMenuTrigger>\n      <DropdownMenuContent align=\"end\">\n        <DropdownMenuItem onSelect={() => i18n.changeLanguage('si')} data-testid=\"language-option-si\">සිංහල</DropdownMenuItem>\n        <DropdownMenuItem onSelect={() => i18n.changeLanguage('en')} data-testid=\"language-option-en\">English</DropdownMenuItem>\n      </DropdownMenuContent>\n    </DropdownMenu>\n  );\n}",
    "sinhala_best_practices": [
      "Set .font-sinhala on large Sinhala blocks and headings.",
      "Keep line-height >= 1.7 for Sinhala paragraphs.",
      "Use meaningful Sinhala labels on all form controls and aria-labels."
    ]
  },
  "hero_section_spec": {
    "layout": "Top header with logo + language toggle. Hero with bilingual H1, subtitle, CTAs (Login/Register). Benefits (3-4 cards) and Pricing. LankaQR mention as a small badge under pricing.",
    "sample_copy": {
      "si_h1": "ශ්‍රී ලංකා ශිෂ්‍යත්ව විභාග - ඇගයීම් ගැලරිය",
      "en_h1": "Sri Lanka Scholarship Exams – Evaluation Portal",
      "cta_login": "Login",
      "cta_register": "Register"
    },
    "visuals": {
      "background": "subtle diagonal gradient top-right: #FFF8E1 -> #F5FBF6 (<=20% viewport)",
      "accent_strip": "3px gold rule under heading or slim maroon-green-gold bar"
    },
    "testing": ["data-testid=\"hero-login-button\"", "data-testid=\"hero-register-button\""]
  },
  "accessibility": {
    "wcag": [
      "Color contrast AA minimum on all text (maroon on white passes).",
      "Visible focus ring using gold token (2px).",
      "All charts have text equivalents (table of values optional).",
      "Keyboard operable: sliders via arrows, dropdown via Enter/Space.",
      "ARIA labels bilingual as appropriate."
    ],
    "testing_ids_policy": "All interactive and key informational elements MUST include a data-testid attribute (kebab-case by role)."
  },
  "images_urls": [
    {
      "category": "hero",
      "description": "Sri Lankan students/community context (neutral, respectful)",
      "url": "https://images.unsplash.com/photo-1720944519195-76650ee46844?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "benefits_or_testimonials",
      "description": "Sri Lankan students in uniform (contextual)",
      "url": "https://images.unsplash.com/photo-1603056218836-485b716ac4ad?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "community",
      "description": "Local context, parents and teachers",
      "url": "https://images.unsplash.com/photo-1509763988163-d54b5f5d5b67?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "community_alt",
      "description": "Young student perspective",
      "url": "https://images.unsplash.com/photo-1726664176068-53e67a1478fd?crop=entropy&cs=srgb&fm=jpg&q=85"
    }
  ],
  "component_path": {
    "button": "/app/frontend/src/components/ui/button.jsx",
    "card": "/app/frontend/src/components/ui/card.jsx",
    "progress": "/app/frontend/src/components/ui/progress.jsx",
    "select": "/app/frontend/src/components/ui/select.jsx",
    "tabs": "/app/frontend/src/components/ui/tabs.jsx",
    "table": "/app/frontend/src/components/ui/table.jsx",
    "slider": "/app/frontend/src/components/ui/slider.jsx",
    "dialog": "/app/frontend/src/components/ui/dialog.jsx",
    "sheet": "/app/frontend/src/components/ui/sheet.jsx",
    "carousel": "/app/frontend/src/components/ui/carousel.jsx",
    "textarea": "/app/frontend/src/components/ui/textarea.jsx",
    "dropdown_menu": "/app/frontend/src/components/ui/dropdown-menu.jsx",
    "sonner": "/app/frontend/src/components/ui/sonner.jsx",
    "calendar": "/app/frontend/src/components/ui/calendar.jsx"
  },
  "libraries_and_install": {
    "charting": {
      "recharts": "already in stack — ensure v2 or above"
    },
    "animation": {
      "framer_motion": "already in stack"
    },
    "upload": {
      "react_dropzone": "npm i react-dropzone"
    },
    "i18n": {
      "i18next": "npm i i18next react-i18next",
      "notes": "Persist language in localStorage; default Sinhala."
    },
    "export_pdf": {
      "jspdf_html2canvas": "npm i jspdf html2canvas"
    },
    "icons": {
      "lucide_react": "npm i lucide-react (if not present)"
    }
  },
  "qa_and_testing": {
    "data_testid_required": true,
    "examples": [
      "data-testid=\"paper2-dropzone\"",
      "data-testid=\"open-marking-detail-button\"",
      "data-testid=\"export-pdf-button\"",
      "data-testid=\"language-toggle\""
    ]
  },
  "instructions_to_main_agent": [
    "Add/verify color tokens in index.css per 'color_system.tokens_hsl' and 'tailwind_and_tokens.css_tokens_to_add'.",
    "Implement Paper2Upload using UploadDropzone + Progress + Carousel; ensure bilingual labels.",
    "Build Teacher Marking page: filters row (Selects), Table list, Sheet detail with 10 sliders, comments, Save/Finalize.",
    "Construct Analytics: SkillTrend (LineChart) + SkillsRadar (RadarChart) with month filter and Export PDF.",
    "Add LanguageToggle in header; initialize i18next for si/en.",
    "Create hero per 'hero_section_spec' with Sri Lankan flag colors; ensure gradient rules.",
    "Use Sonner toasts for success/error; include Sinhala messages.",
    "Add data-testid to all interactive and key informational elements."
  ],
  "web_references_and_inspiration": [
    {
      "title": "ICTA Sri Lanka – Government Websites 4.0",
      "url": "https://www.icta.lk/icta-assets/uploads/2022/03/Guidelines-for-developing-Sri-Lanka-Government-Websites-4.0.pdf",
      "notes": "Trilingual, accessibility, mobile-first mandates"
    },
    {
      "title": "Best Government Website Design – ImageX",
      "url": "https://imagexmedia.com/blog/best-government-website-design",
      "notes": "Clear top tasks, clean hero patterns"
    }
  ],
  "general_ui_ux_design_guidelines": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
