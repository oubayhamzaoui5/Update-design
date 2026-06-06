// ─── Shared ──────────────────────────────────────────────────────────────────
export type StatItem  = { value: string; suffix: string; label: string }
export type FaqItem   = { question: string; answer: string }
export type Subject   = { value: string; label: string }
export type HeroSlide = { id: string; title: string; image: string }

// ─── Homepage ────────────────────────────────────────────────────────────────
export type HomepageContent = {
  hero: {
    ctaLabel: string
    ctaHref:  string
    slides:   HeroSlide[]
  }
  stats: StatItem[]
  about: {
    eyebrow:        string
    headline:       string
    headlineAccent: string
    paragraph1:     string
    paragraph2:     string
    stats:          StatItem[]
    ctaLabel:       string
    image:          string
  }
  faq: {
    introText: string
    items:     FaqItem[]
  }
  contact: {
    headline:       string
    headlineAccent: string
    description:    string
    phone:          string
    location:       string
    hours:          string
    subjects:       Subject[]
  }
}

// ─── Store à Bras Invisibles ─────────────────────────────────────────────────
export type StoreBrasContent = {
  hero: {
    headline:  string
    italic:    string
    body:      string
    ctaLabel:  string
    ctaHref:   string
  }
  models: Array<{ name: string; desc: string; img: string; recommended?: boolean }>
  premium: {
    headline:   string
    italic:     string
    paragraph1: string
    paragraph2: string
    features:   string[]
  }
  features: Array<{ title: string; body: string }>
  applications: {
    headline:    string
    description: string
    items:       string[]
  }
  cta: {
    headline:  string
    italic:    string
    body:      string
    ctaLabel:  string
    ctaHref:   string
  }
}

// ─── Parasols ─────────────────────────────────────────────────────────────────
export type ParasolContent = {
  hero: {
    headline:  string
    italic:    string
    body:      string
    ctaLabel:  string
    ctaHref:   string
  }
  models: Array<{ name: string; tagline: string; desc: string; img: string }>
  features: Array<{ title: string; body: string }>
  premium: {
    headline:   string
    italic:     string
    paragraph1: string
    paragraph2: string
    features:   string[]
  }
  quote: {
    text:   string
    accent: string
  }
  cta: {
    headline:  string
    italic:    string
    body:      string
    ctaLabel:  string
    ctaHref:   string
  }
}

// ─── About page ──────────────────────────────────────────────────────────────
export type AboutContent = {
  hero: {
    eyebrow:        string
    headline:       string
    headlineAccent: string
    headlineSuffix: string
    body:           string
    ctaLabel:       string
    ctaHref:        string
    locationLabel:  string
    image:          string
  }
  stats: StatItem[]
  story: {
    eyebrow:        string
    headline:       string
    headlineAccent: string
    paragraph1:     string
    paragraph2:     string
    checklist:      string[]
    image:          string
  }
  vision: {
    eyebrow:     string
    quote:       string
    quoteAccent: string
    quoteSuffix: string
    attribution: string
  }
  values: {
    eyebrow:        string
    headline:       string
    headlineAccent: string
    items: Array<{ num: string; title: string; text: string }>
    image:          string
  }
  team: {
    eyebrow:        string
    headline:       string
    headlineAccent: string
    paragraph1:     string
    paragraph2:     string
    stats:          Array<{ v: string; l: string }>
    image:          string
  }
  cta: {
    eyebrow:        string
    headline:       string
    headlineAccent: string
    body:           string
    primaryLabel:   string
    primaryHref:    string
    secondaryLabel: string
    secondaryHref:  string
  }
}

export type CatalogueStat = { label: string; value: string }
export type CatalogueCard = { title: string; text: string; image: string }
export type CatalogueTextBlock = {
  eyebrow: string
  headline: string
  italic: string
  body?: string
}

export type WoodProfileTextureRow = {
  texture: string
  name: string
  color: string
  models: string[]
}

export type WoodProfileContent = {
  hero: {
    eyebrow: string
    headline: string
    italic: string
    body: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
    stats: CatalogueStat[]
  }
  infoCards: string[]
  textures: WoodProfileTextureRow[]
  quality: {
    eyebrow: string
    headline: string
    italic: string
    body: string
    items: CatalogueCard[]
  }
  advice: CatalogueTextBlock & {
    points: string[]
    ctaLabel: string
    ctaHref: string
  }
}

export type MarbleModel = {
  ref: string
  name: string
  tone: string
  src: string
}

export type MarbleAccessory = {
  type: string
  text: string
  src: string
  detail: string
}

export type MarbleLDetail = { type: string; src: string }
export type MarbleLProfile = { name: string; src: string }

export type MarblePanelsContent = {
  hero: {
    eyebrow: string
    headline: string
    italic: string
    body: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
    stats: CatalogueStat[]
  }
  usageNotes: string[]
  references: CatalogueTextBlock & {
    countLabel: string
    models: MarbleModel[]
  }
  finishing: CatalogueTextBlock & {
    accessories: MarbleAccessory[]
    lDetailsLabel: string
    lDetails: MarbleLDetail[]
    lProfiles: MarbleLProfile[]
  }
  advice: CatalogueTextBlock & {
    points: string[]
    ctaLabel: string
    ctaHref: string
  }
  proposal: {
    image: string
    imageAlt: string
    headline: string
    body: string
    ctaLabel: string
    ctaHref: string
  }
}
