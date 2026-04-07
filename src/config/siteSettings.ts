const appVersion = '0.1.3';
const siteName = 'usa.catechize.ing';
const defaultDescription = 'Questions & Answers about the US of A';
const branding = {
  siteName,
  tagline: defaultDescription,
  description: defaultDescription,
  logoPath: '/images/site-logo.svg',
  logoAlt: `${siteName} logo`,
} as const;
const defaultSiteUrl = 'https://usa.catechize.ing';

export const siteSettings = {
  version: appVersion,
  branding,
  issueReportURL: 'https://github.com/abereanone/usa.catechize.ing/issues/new',
  longExplanationText: 'Additional Explanation',
  integrations: {
    googleAnalyticsId: 'G-29DLV3Q3F0',
  },
  openGraph: {
    title: branding.siteName,
    description: branding.description,
    url: defaultSiteUrl,
    image: '/images/og-card.png',
    imageAlt: `${branding.siteName} logo`,
    type: 'website',
    twitterCard: 'summary_large_image',
  },
  showQuestionId: true,
  showAuthor: false,
  hideAnswersByDefault: false,
  enablePagination: true,
  questionsPerPage: 30,
} as const;

export type SiteSettings = typeof siteSettings;
