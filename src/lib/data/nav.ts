import type { NavLink } from "@/types/content";

export const BUILD_MENU: { whatWeBuild: NavLink[]; howWeBuildIt: NavLink[] } = {
  whatWeBuild: [
    { label: "SaaS & Web Apps", href: "/saas-web-app-development" },
    { label: "Marketplace", href: "/marketplace-development" },
    { label: "AI Products", href: "/ai-products" },
    { label: "Automations", href: "/automation-tools" },
    { label: "Internal Tools", href: "/internal-tools-development" },
    { label: "MVP", href: "/mvp-development" },
  ],
  howWeBuildIt: [
    { label: "Bubble", href: "/bubble" },
    { label: "n8n", href: "/n8n" },
    { label: "Softr", href: "/softr" },
    { label: "Airtable", href: "/airtable" },
    { label: "Lovable", href: "/lovable" },
    { label: "Claude AI", href: "/claude-ai" },
  ],
};

export const RESOURCES_MENU: NavLink[] = [
  {
    label: "Bubble Templates",
    href: "https://bubble.io/contributor/1622870269100x621246174266034400",
  },
  {
    label: "Bubble Plugins",
    href: "https://bubble.io/contributor/1622870269100x621246174266034400",
  },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faq" },
];

export const LETS_TALK_LINKS = {
  whatsapp: "https://wa.me/6282233443399",
  email: "mailto:hi@paistudio.co",
  scheduleCall:
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ05uOSQ6yl1esZXIC4E1tTxaHjO4J_gYaSvvfilV3L0884qFAars-E8LLeaXy5bkSBkVvXmpnAu?gv=true",
};

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "What we build",
    links: [
      {
        label: "SaaS & Web App Development",
        href: "/saas-web-app-development",
      },
      { label: "Marketplace Development", href: "/marketplace-development" },
      { label: "AI Products", href: "/ai-products" },
      { label: "MVP Development", href: "/mvp-development" },
      { label: "Automation Tools", href: "/automation-tools" },
      {
        label: "Internal Tools Development",
        href: "/internal-tools-development",
      },
    ],
  },
  {
    title: "Technologies",
    links: [
      { label: "Bubble", href: "/bubble" },
      { label: "n8n", href: "/n8n" },
      { label: "Softr", href: "/softr" },
      { label: "Airtable", href: "/airtable" },
      { label: "Lovable", href: "/lovable" },
      { label: "Claude AI", href: "/claude-ai" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Work", href: "#work" },
      { label: "Blog", href: "/blog" },
      {
        label: "Bubble Marketplace",
        href: "https://bubble.io/contributor/1622870269100x621246174266034400",
      },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/appai" },
  { label: "LinkedIn", href: "https://linkedin.com/company/paistudio" },
  { label: "Bubble", href: "https://bubble.io/expert/paistudio" },
];
