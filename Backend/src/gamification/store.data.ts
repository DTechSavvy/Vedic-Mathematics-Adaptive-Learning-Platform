export interface StoreItemDefinition {
  id: string;
  title: string;
  description: string;
  category: 'LEARNING' | 'BOOST' | 'PREVIEW' | 'COSMETIC';
  costCoins: number;
  costStones: number;
  costStars?: number;
  icon: string;
  metadata?: Record<string, unknown>;
}

export const CANONICAL_STORE_ITEMS: StoreItemDefinition[] = [
  // --- Common Educational Items (1,000 – 3,500 V-Coins) ---
  {
    id: 'hint-token',
    title: 'Vedic Hint Token Pack',
    description: 'Grants 3 intuitive Vedic sutra hints and algorithmic shortcut clues during practice.',
    category: 'LEARNING',
    costCoins: 1200,
    costStones: 0,
    icon: '💡',
    metadata: { type: 'HINT', quantity: 3 },
  },
  {
    id: 'solution-reveal',
    title: 'Pedagogical Solution Reveal',
    description: 'Unlocks complete step-by-step mathematical derivation and alternative Vedic approaches.',
    category: 'LEARNING',
    costCoins: 1800,
    costStones: 0,
    icon: '📜',
    metadata: { type: 'SOLUTION_REVEAL', quantity: 1 },
  },
  {
    id: 'retry-token',
    title: 'Practice Retry Token',
    description: 'Allows an immediate re-attempt of a missed question without impacting session streak.',
    category: 'LEARNING',
    costCoins: 1500,
    costStones: 0,
    icon: '🔄',
    metadata: { type: 'RETRY', quantity: 1 },
  },
  {
    id: 'focus-practice-pack',
    title: 'Focus Practice Pack',
    description: 'A curated 10-problem adaptive practice set targeting cognitive problem areas.',
    category: 'BOOST',
    costCoins: 2500,
    costStones: 0,
    icon: '🎯',
    metadata: { type: 'PRACTICE_PACK', questionsCount: 10 },
  },

  // --- Advanced Educational Items (5,000 – 25,000 V-Coins) ---
  {
    id: 'mistake-analysis',
    title: 'Cognitive Mistake Diagnostic',
    description: 'Provides an in-depth pedagogical analysis of common calculation traps and Vedic mental remedies.',
    category: 'LEARNING',
    costCoins: 6000,
    costStones: 0,
    icon: '🔍',
    metadata: { type: 'MISTAKE_ANALYSIS', quantity: 1 },
  },
  {
    id: 'mastery-insight',
    title: 'Mastery Insight Report',
    description: 'Unveils real-time diagnostic breakdown: weakest topic, weakest question type, and recommended next action.',
    category: 'BOOST',
    costCoins: 7500,
    costStones: 0,
    icon: '📊',
    metadata: { type: 'MASTERY_INSIGHT', quantity: 1 },
  },
  {
    id: 'sutra-revision-pack',
    title: 'Sutra Mastery Revision Pack',
    description: 'A curated multi-tier problem set focusing on comprehensive Sutra exploration and pattern memory.',
    category: 'BOOST',
    costCoins: 8500,
    costStones: 0,
    icon: '📚',
    metadata: { type: 'SUTRA_PACK', questionsCount: 15, quantity: 1 },
  },
  {
    id: 'weak-topic-practice-pack',
    title: 'Weak Topic Practice Pack',
    description: 'A targeted diagnostic problem set automatically focused on your lowest-mastery Vedic techniques.',
    category: 'BOOST',
    costCoins: 10000,
    costStones: 0,
    icon: '🎯',
    metadata: { type: 'WEAK_TOPIC_PACK', questionsCount: 12, quantity: 1 },
  },
  {
    id: 'xp-boost-1h',
    title: '1-Hour 1.5x XP Surge',
    description: 'Accelerates learning progress with a 1.5x XP multiplier across all correct answers for 60 minutes.',
    category: 'BOOST',
    costCoins: 12000,
    costStones: 0,
    icon: '⚡',
    metadata: { multiplier: 1.5, durationHours: 1, quantity: 1 },
  },
  {
    id: 'mixed-challenge-pack',
    title: 'Mixed Challenge Pack',
    description: 'A high-speed cross-curriculum gauntlet combining multi-sutra mental calculations.',
    category: 'BOOST',
    costCoins: 15000,
    costStones: 0,
    icon: '⚡',
    metadata: { type: 'MIXED_CHALLENGE_PACK', questionsCount: 20, quantity: 1 },
  },
  {
    id: 'preview-advanced',
    title: 'Advanced Challenge Preview',
    description: 'Grants practice preview exposure to Advanced questions. Note: Does not bypass academic difficulty unlocking.',
    category: 'PREVIEW',
    costCoins: 18000,
    costStones: 0,
    icon: '🔮',
    metadata: { tierPreview: 'ADVANCED', maxPreviewQuestions: 5, quantity: 1 },
  },

  // --- Rare & Prestige Rewards (50,000 – 120,000+ V-Coins + Stars/Stones) ---
  {
    id: 'frame-sanskrit',
    title: 'Vedic Scholar Profile Frame',
    description: 'Adorns your profile and leaderboard ranking with sacred Sanskrit calligraphy borders.',
    category: 'COSMETIC',
    costCoins: 50000,
    costStones: 0,
    costStars: 2,
    icon: '🖼️',
    metadata: { cosmeticType: 'FRAME', style: 'sanskrit_border', costStars: 2 },
  },
  {
    id: 'avatar-golden-aura',
    title: 'Golden Aura Shimmer',
    description: 'Gives your profile avatar an animated radiant golden halo across the application.',
    category: 'COSMETIC',
    costCoins: 65000,
    costStones: 0,
    costStars: 3,
    icon: '✨',
    metadata: { cosmeticType: 'AURA', color: '#f59e0b', costStars: 3 },
  },
  {
    id: 'tree-golden-bloom',
    title: 'Golden Blossom Tree Skin',
    description: 'Unlocks a luminous golden blossom appearance for your Wisdom Tree visualizer.',
    category: 'COSMETIC',
    costCoins: 85000,
    costStones: 1,
    icon: '🌸',
    metadata: { cosmeticType: 'TREE_SKIN', theme: 'golden_blossom' },
  },
  {
    id: 'crest-purvena',
    title: 'Purvena Grand Insignia',
    description: 'High-honor showcase insignia displayed on your profile card and global leaderboard entry.',
    category: 'COSMETIC',
    costCoins: 120000,
    costStones: 2,
    costStars: 5,
    icon: '🏵️',
    metadata: { cosmeticType: 'BADGE', badgeId: 'purvena_crest', costStars: 5 },
  },
];
