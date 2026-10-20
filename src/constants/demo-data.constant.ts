import type {
  IStatusStage,
  IProjectFile,
  IBoardColumn,
  ITimelineEntry,
  IProjectFolder,
  IProjectSummary,
  IProjectTypeOption,
} from "../interfaces/project.interface";

import { theme } from "./theme.constants";
import { ICON_NAMES } from "./icon.constant";
import { AVATAR_TONES } from "./tone.constant";
import type { IPerson } from "../interfaces/person.interface";
import { FOLDER_CONTENT_STATUSES } from "./drive-folder.constant";
import { USER_ROLES, USER_ROLE_LABELS } from "./user-role.constant";
import type { IEmployee, IRoleAssignment } from "../interfaces/employee.interface";

const { palette } = theme;

export const DEMO_BOARD_COLUMNS: IBoardColumn[] = [
  { stageId: "quote", title: "ממתין", dotColor: palette.statusGray },
  { stageId: "order", title: "בעבודה", dotColor: palette.charcoal },
  { stageId: "execution", title: "להמתין", dotColor: palette.primary },
];

export const DEMO_PROJECTS_BY_STAGE: Record<string, IProjectSummary[]> = {
  quote: [
    {
      progress: 20,
      apartmentsLabel: null,
      id: "GA-84811",
      code: "GA-84811",
      type: "בנייה רוויה",
      name: "מגדלי שלום שלב ב׳",
      updatedLabel: "לפני 2 ימים",
      teamInitials: ["אי", "דו", "יק"],
    },
    {
      progress: 35,
      apartmentsLabel: null,
      id: "GA-84790",
      code: "GA-84790",
      type: "מסחרי (VRF)",
      name: "החלפת VRF עזריאלי",
      updatedLabel: "לפני 5 ימים",
      teamInitials: ["אי", "יו", "+2"],
    },
  ],
  order: [
    {
      progress: 55,
      apartmentsLabel: null,
      id: "GA-84902",
      code: "GA-84902",
      updatedLabel: "היום",
      type: "דירות יוקרה",
      name: "וילה פארק רוטשילד",
      teamInitials: ["דו", "אי", "מת"],
    },
    {
      progress: 48,
      apartmentsLabel: null,
      id: "GA-84877",
      code: "GA-84877",
      type: "בנייה רוויה",
      updatedLabel: "אתמול",
      name: "מגדל הארבעה מערב",
      teamInitials: ["אי", "יו", "+3"],
    },
  ],
  execution: [
    {
      progress: 72,
      apartmentsLabel: null,
      id: "GA-84920",
      code: "GA-84920",
      type: "בנייה רוויה",
      updatedLabel: "לפני שעה",
      name: "מגדל פארק בבלי C",
      teamInitials: ["אי", "יו", "+4"],
    },
    {
      progress: 86,
      apartmentsLabel: null,
      id: "GA-84655",
      code: "GA-84655",
      updatedLabel: "היום",
      type: "מסחרי (צ׳ילרים)",
      name: "מתחם שרונה טק — צ׳ילר",
      teamInitials: ["יו", "אי", "טכ"],
    },
  ],
};

export const DEMO_PROJECT_TYPE_OPTIONS: IProjectTypeOption[] = [
  {
    id: "residential",
    title: "בנייה רוויה",
    icon: ICON_NAMES.BUILDING,
    tag: "מטריצת יחידות ודירות",
    subtitle: "מגורים רב-קומתיים",
    description: "מתחמי מגורים רבי קומות, פילרים תקניים, פיצולי קומות וקומפלקסים ענקיים.",
  },
  {
    id: "commercial",
    icon: ICON_NAMES.HVAC,
    tag: "VRF מרכזי / צ׳ילר",
    subtitle: "מרכזים ומשרדים",
    title: "מסחרי (VRF / צ׳ילרים)",
    description: "בנייני משרדים, מרכזים מסחריים, מרכזים לוגיסטיים ומערכות גג מרכזיות.",
  },
  {
    id: "private",
    icon: ICON_NAMES.HOME,
    title: "לקוחות פרטיים",
    tag: "מיזוג מותאם לבית",
    subtitle: "וילות ובתים פרטיים",
    description: "וילות, דו-משפחתיים ובתים בעיצוב אדריכלי עם דרישות מיזוג מותאמות.",
  },
  {
    id: "luxury",
    icon: ICON_NAMES.AIR,
    title: "דירות יוקרה",
    tag: "מפזרים נסתרים וחכם",
    subtitle: "פנטהאוזים ומגדלי פאר",
    description: "פנטהאוזים, מפזרים נסתרים ובקרת אקלים חכמה אינטגרלית ב-BACnet BMS.",
  },
  {
    id: "other",
    title: "אחר",
    icon: ICON_NAMES.MORE,
    subtitle: "התאמה מיוחדת",
    tag: "מפרט בהתאמה אישית",
    description: "חדרים נקיים, קירור תעשייתי, שדרוגים מיוחדים והסכמי שירות ייחודיים.",
  },
];

export const DEMO_PROJECT_TEAM: IPerson[] = [
  {
    initials: "דב",
    name: "דוד בן שחר",
    caption: USER_ROLE_LABELS[USER_ROLES.SYSTEM_ADMIN],
    avatarTone: AVATAR_TONES.CHARCOAL,
  },
  { initials: "מל", name: "מיכל לוי", caption: USER_ROLE_LABELS[USER_ROLES.SECRETARY] },
  { initials: "אכ", name: "אביעד כהן", caption: USER_ROLE_LABELS[USER_ROLES.PROJECT_MANAGER] },
  {
    initials: "ימ",
    name: "יוסי מזרחי",
    caption: USER_ROLE_LABELS[USER_ROLES.INSTALLER],
    avatarTone: AVATAR_TONES.CHARCOAL,
  },
];

export const DEMO_PROJECT_FOLDERS: IProjectFolder[] = [
  {
    id: "plans",
    fileCount: 3,
    icon: ICON_NAMES.HVAC,
    name: "תוכניות מיזוג אוויר",
    contentStatus: FOLDER_CONTENT_STATUSES.HAS_CONTENT,
  },
  {
    id: "quotes",
    fileCount: 6,
    icon: ICON_NAMES.QUOTE,
    name: "כתבי כמויות והצעות מחיר",
    contentStatus: FOLDER_CONTENT_STATUSES.HAS_CONTENT,
  },
  {
    id: "reports",
    fileCount: 12,
    icon: ICON_NAMES.REPORT,
    name: "אישורי ביצוע ודוחות שטח",
    contentStatus: FOLDER_CONTENT_STATUSES.HAS_CONTENT,
  },
  {
    id: "invoices",
    fileCount: 0,
    icon: ICON_NAMES.INVOICE,
    name: "חשבוניות ומסמכים פיננסיים",
    contentStatus: FOLDER_CONTENT_STATUSES.EMPTY,
  },
  {
    id: "misc",
    fileCount: null,
    icon: ICON_NAMES.FOLDER,
    name: "קבצים ומסמכים נוספים",
    contentStatus: FOLDER_CONTENT_STATUSES.UNKNOWN,
  },
];

export const DEMO_PROJECT_FILES: IProjectFile[] = [
  {
    id: "hvac-plan",
    icon: ICON_NAMES.DOCUMENT,
    url: "https://drive.google.com",
    meta: "14.2 MB · לפני 3 ימים",
    name: "HVAC_קומות_14_18_תרשים.pdf",
  },
  {
    id: "cooling-load",
    icon: ICON_NAMES.REPORT,
    url: "https://drive.google.com",
    meta: "2.8 MB · לפני 5 ימים",
    name: "חישוב_עומסי_קירור_בבלי.xlsx",
  },
  {
    id: "duct-spec",
    icon: ICON_NAMES.DOCUMENT,
    url: "https://drive.google.com",
    meta: "5.1 MB · לפני שבוע",
    name: "מפרט_תעלות_ואוורור_גרסה2.pdf",
  },
];

export const DEMO_PROJECT_TIMELINE: ITimelineEntry[] = [
  {
    id: "phase-a",
    isHighlighted: true,
    date: "20/12/2023 16:45",
    label: "שלב א׳ — הושלם",
    dotColor: palette.primary,
    author: `שונה ע״י יוסי לוי (${USER_ROLE_LABELS[USER_ROLES.INSTALLER]})`,
  },
  {
    id: "execution",
    date: "02/11/2023 09:15",
    label: "הועבר לביצוע",
    dotColor: palette.charcoal,
    author: "שונה ע״י מירב כהן (מזכירה)",
  },
  {
    id: "order",
    label: "הזמנה אושרה",
    date: "14/10/2023 11:30",
    dotColor: palette.statusGray,
    author: "שונה ע״י דניאל רון (מנהל פרויקט)",
  },
];

export const DEMO_PROJECT_ROLE_ASSIGNMENTS: IRoleAssignment[] = [
  {
    id: "admin",
    assignee: "דוד בן-שחר (מנהל מערכת)",
    options: ["דוד בן-שחר (מנהל מערכת)", "אביעד כהן"],
    role: { initials: "דב", name: "מנהל", caption: "מנהל מערכת ראשי" },
  },
  {
    id: "secretary",
    assignee: "מיכל לוי (ניהול אדמיניסטרטיבי)",
    options: ["מיכל לוי (ניהול אדמיניסטרטיבי)", "מיכל רוזנברג"],
    role: { initials: "מל", name: "מזכירה", caption: "תיאום ואדמיניסטרציה" },
  },
  {
    id: "manager",
    assignee: "אביעד כהן (מנהל פרויקטים)",
    options: ["אביעד כהן (מנהל פרויקטים)", "יוסי בראון"],
    role: { initials: "אכ", name: "מנהל פרויקט", caption: "ניהול הנדסי וביצוע" },
  },
  {
    id: "installer",
    assignee: "יוסי מזרחי (מוביל התקנות)",
    options: ["יוסי מזרחי (מוביל התקנות)", "רומן לוין"],
    role: { initials: "ימ", name: "מתקין", caption: "ראש צוות התקנות שטח" },
  },
];

export const DEMO_STATUS_STAGES: IStatusStage[] = [
  { id: "waiting", name: "ממתין", tag: "קבוע", description: "הפרויקט ממתין לתחילת עבודה" },
  { id: "in-progress", name: "בעבודה", tag: "קבוע", description: "עבודה על הפרויקט מתבצעת כעת" },
  { id: "on-hold", name: "להמתין", tag: "קבוע", description: "העבודה על הפרויקט בהמתנה" },
  { id: "completed", name: "הסתיים", tag: "קבוע", description: "העבודה על הפרויקט הסתיימה" },
];

export const DEMO_EMPLOYEES: IEmployee[] = [
  {
    id: "EMP-1001",
    isDisabled: false,
    phone: "052-4418230",
    email: "aviad@genair.co.il",
    role: USER_ROLES.SYSTEM_ADMIN,
    person: {
      initials: "אכ",
      name: "אביעד כהן",
      caption: "מזהה: EMP-1001",
      avatarTone: AVATAR_TONES.CHARCOAL,
    },
  },
  {
    id: "EMP-1042",
    isDisabled: false,
    phone: "054-7712094",
    email: "michal@genair.co.il",
    role: USER_ROLES.SECRETARY,
    person: { initials: "מר", name: "מיכל רוזנברג", caption: "מזהה: EMP-1042" },
  },
  {
    id: "EMP-1018",
    isDisabled: false,
    phone: "050-3365817",
    email: "yossi.b@genair.co.il",
    role: USER_ROLES.PROJECT_MANAGER,
    person: {
      initials: "יב",
      name: "יוסי בראון",
      avatarTone: AVATAR_TONES.CHARCOAL,
      caption: "מזהה: EMP-1018 · קמפוס אינטל חיפה",
    },
  },
  {
    id: "EMP-1087",
    isDisabled: false,
    phone: "053-9021446",
    email: "roman.l@genair.co.il",
    role: USER_ROLES.INSTALLER,
    person: { initials: "רל", name: "רומן לוין", caption: "מזהה: EMP-1087 · צוות צפון VRF" },
  },
  {
    id: "EMP-1031",
    isDisabled: true,
    phone: "058-6634172",
    email: "dan.s@genair.co.il",
    role: USER_ROLES.INSTALLER,
    person: { initials: "דש", name: "דן שמיר", caption: "מזהה: EMP-1031 · מושבת" },
  },
];

export const DEMO_INITIAL_ASSIGNEES: Record<string, string | null> = Object.fromEntries(
  DEMO_PROJECT_ROLE_ASSIGNMENTS.map(assignment => [assignment.id, assignment.assignee]),
);
