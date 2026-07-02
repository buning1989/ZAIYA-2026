export type Stat = {
  value: string;
  label: string;
};

export type Quote = {
  outlet: string;
  text: string;
  url: string;
};

export type Link = {
  title: string;
  source: string;
  url: string;
};

export type Press = {
  outlet: string;
  title: string;
  url: string;
  featured?: boolean;
};

export type Member = {
  name: string;
  role: string;
  bio: string;
  initials: string;
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Press", href: "#press" },
  { label: "Team", href: "#team" },
  { label: "Careers", href: "#careers" },
];

export const stats: Stat[] = [
  { value: "100,000+", label: "Subscribers" },
  { value: "2M+", label: "Hours spent with Tolan Embodied Companions" },
  { value: "4.8", label: "Star App Store Rating" },
  { value: "130,000+", label: "Reviews from users who love their cute alien friends" },
];

export const overwhelmQuotes: Quote[] = [
  {
    outlet: "Wired",
    text: "What Could a Healthy AI Companion Look Like?",
    url: "https://www.wired.com/story/tolan-chatbot-ai-companion/",
  },
  {
    outlet: "The New Yorker",
    text: "Love in the Time of AI Companions",
    url: "https://www.newyorker.com/magazine/2026/03/16/love-in-the-time-of-ai-companions",
  },
];

export const characterLinks: Link[] = [
  {
    title: "This adorable alien is the AI companion we all need",
    source: "Fast Company",
    url: "https://www.fastcompany.com/91283982/tolan-adorable-alien-ai-companion",
  },
  {
    title: "Designing Tolan: Characters",
    source: "Tolan Relay",
    url: "https://www.tolans.com/relay/designing-tolan-part-1-characters",
  },
];

export const researchLinks: Link[] = [
  {
    title: "How Tolan's AI Engineers monitor with Raindrop",
    source: "Raindrop",
    url: "https://www.raindrop.ai/case-studies/tolan",
  },
  {
    title: "How We Claudified Our iOS App",
    source: "Tolan Relay",
    url: "https://www.tolans.com/relay/how-we-claudified-our-ios-app-without-wrecking-our-codebase",
  },
  {
    title: "How Tolan builds voice-first AI with GPT-5.1",
    source: "OpenAI",
    url: "https://openai.com/index/tolan/",
  },
  {
    title: "How Portola empowers subject matter experts to improve AI quality",
    source: "Braintrust",
    url: "https://www.braintrust.dev/customers/portola",
  },
];

export const recentPress: Press[] = [
  {
    outlet: "GeekWire",
    title: "Tolan raises $20M to help more people grow with a virtual alien friend",
    url: "https://www.geekwire.com/2025/ai-companionship-app-tolan-raises-20m-to-help-more-people-grow-with-a-virtual-alien-friend/",
    featured: true,
  },
  {
    outlet: "Forbes",
    title: "Tolan raises $10 million in seed funding for trustworthy AI confidants",
    url: "https://www.forbes.com/sites/rashishrivastava/2025/02/25/the-prompt-elon-musks-doge-plans-to-feed-federal-data-into-ai-models/",
  },
  {
    outlet: "Fast Company",
    title: "This startup hired a sci-fi novelist to give its AI companions a soul",
    url: "https://www.fastcompany.com/91414257/sci-fi-portola-tolans-ted-chiang-ai",
  },
  {
    outlet: "The New Yorker",
    title: "Love in the Time of AI Companions",
    url: "https://www.newyorker.com/magazine/2026/03/16/love-in-the-time-of-ai-companions",
  },
  {
    outlet: "Every",
    title: "Building AI companions that feel real",
    url: "https://every.to/podcast/this-ai-alien-will-bring-in-4-million-a-year-in-revenue",
  },
];

export const team: Member[] = [
  {
    name: "Quinten Farmer",
    role: "Founder & CEO",
    bio: "Founder of Even (acquired by Walmart).",
    initials: "QF",
  },
  {
    name: "Evan Goldschmidt",
    role: "Founder & CTO",
    bio: "Former CTO of Even (acquired by Walmart).",
    initials: "EG",
  },
  {
    name: "Ajay Mehta",
    role: "Founder & President",
    bio: "Founder of consumer brands with over 1 million customers.",
    initials: "AM",
  },
  {
    name: "Lily Doyle",
    role: "Research",
    bio: "Published Vanderbilt doctoral researcher and Board Certified Behavior Analyst.",
    initials: "LD",
  },
  {
    name: "Lucas Zanotto",
    role: "Creative Director",
    bio: "Apple Design Award-winning 3D artist and animator.",
    initials: "LZ",
  },
  {
    name: "Chris Horne",
    role: "Embodiment",
    bio: "Built 3D products at Pixar, Meta, and Oculus.",
    initials: "CH",
  },
];
