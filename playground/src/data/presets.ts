import { DimensionPack, Dimension } from '../types';

export interface PresetDataset {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultColumn: string;
  defaultConfig: string;
  defaultSplit: string;
  recommendedPack: string;
}

export const PRESET_DATASETS: PresetDataset[] = [
  {
    id: 'cornell-movie-review-data/rotten_tomatoes',
    name: 'Rotten Tomatoes',
    description: 'Movie reviews with nuanced critical opinions and film critiques.',
    category: 'Sentiment & Culture',
    defaultColumn: 'text',
    defaultConfig: 'default',
    defaultSplit: 'train',
    recommendedPack: 'film-reviews'
  },
  {
    id: 'fancyzhx/ag_news',
    name: 'AG News Headlines',
    description: 'Global news stories covering Technology, Business, Sports, and World.',
    category: 'News & Topics',
    defaultColumn: 'text',
    defaultConfig: 'default',
    defaultSplit: 'train',
    recommendedPack: 'news-topics'
  },
  {
    id: 'cardiffnlp/tweet_eval',
    name: 'TweetEval (Sentiment)',
    description: 'Real-world social tweets with colloquial slang, sarcasm, and emotion.',
    category: 'Social Media',
    defaultColumn: 'text',
    defaultConfig: 'sentiment',
    defaultSplit: 'train',
    recommendedPack: 'social-media'
  },
  {
    id: 'tatsu-lab/alpaca',
    name: 'Alpaca Instructions',
    description: 'Diverse task instructions, prompts, and synthetic AI demonstrations.',
    category: 'LLM & Prompts',
    defaultColumn: 'instruction',
    defaultConfig: 'default',
    defaultSplit: 'train',
    recommendedPack: 'llm-instructions'
  },
  {
    id: 'dair-ai/emotion',
    name: 'Twitter Emotion',
    description: 'Feelings and emotional states categorized from everyday expressions.',
    category: 'Psychology & Tone',
    defaultColumn: 'text',
    defaultConfig: 'default',
    defaultSplit: 'train',
    recommendedPack: 'emotion-psychology'
  },
  {
    id: 'PolyAI/banking77',
    name: 'Banking 77 Support',
    description: 'Fine-grained customer queries and intents across financial services.',
    category: 'Customer Support',
    defaultColumn: 'text',
    defaultConfig: 'default',
    defaultSplit: 'train',
    recommendedPack: 'customer-support'
  }
];

export const PRESET_DIMENSION_PACKS: DimensionPack[] = [
  {
    id: 'film-reviews',
    name: 'Film & Media Reviews',
    description: 'Critique depth, recommendation verdict, and emotional resonance for reviews.',
    badge: 'Reviews',
    color: 'lavender',
    dimensions: [
      {
        id: 'sentiment',
        name: 'Sentiment',
        type: 'choice',
        instructions: 'What is the overall sentiment expressed in this review?',
        criteria: {
          positive: 'Favorable, enthusiastic, appreciative, or praising the work',
          neutral: 'Balanced, factual overview, or mixed indifferent assessment',
          negative: 'Disappointed, critical, scathing, or unfavorable'
        },
        color: 'lavender',
        enabled: true,
        description: 'Categorizes critical sentiment polarity'
      },
      {
        id: 'recommendation_verdict',
        name: 'Recommendation',
        type: 'choice',
        instructions: 'Based on this review, what is the viewing recommendation?',
        criteria: {
          must_watch: 'Highly recommended, masterful, must-see experience',
          worth_a_watch: 'Flawed but enjoyable, good for fans of the genre',
          skip_or_avoid: 'Not recommended, waste of time, uninspired'
        },
        color: 'mint',
        enabled: true,
        description: 'Actionable viewer recommendation'
      },
      {
        id: 'critique_depth',
        name: 'Critique Depth',
        type: 'score',
        instructions: 'Rate the critical depth and analysis in this review.',
        criteria: [
          'Superficial one-liner or generic opinion with no elaboration',
          'Standard commentary highlighting general plot or acting points',
          'Deep, thoughtful analysis of themes, direction, or cinematography'
        ],
        color: 'rose',
        enabled: true,
        description: '0 to 2 scale measuring analytical depth'
      },
      {
        id: 'emotional_resonance',
        name: 'Emotional Impact',
        type: 'noul',
        instructions: 'Does this review describe a genuinely moving or powerful emotional experience?',
        criteria: {
          true: 'Describes tears, profound joy, deep suspense, or lingering emotional power',
          false: 'Detached, analytical, or emotionally muted reaction'
        },
        color: 'peach',
        enabled: true,
        description: 'Calibrated probability of emotional resonance'
      }
    ]
  },
  {
    id: 'news-topics',
    name: 'News & Current Affairs',
    description: 'Category classification, breaking news urgency, and journalistic objectivity.',
    badge: 'News',
    color: 'sky',
    dimensions: [
      {
        id: 'news_category',
        name: 'News Category',
        type: 'choice',
        instructions: 'Which primary news beat does this headline or article belong to?',
        criteria: {
          technology: 'AI, computers, internet, gadgets, software, cybersecurity',
          business_markets: 'Corporate earnings, Wall Street, economy, mergers, trade',
          politics_world: 'Government policy, international diplomacy, elections, conflict',
          science_health: 'Medical discoveries, space exploration, environment, climate',
          sports_culture: 'Athletics, tournaments, celebrities, arts, entertainment'
        },
        color: 'sky',
        enabled: true,
        description: 'News taxonomy classification'
      },
      {
        id: 'is_breaking_news',
        name: 'Is Breaking News',
        type: 'noul',
        instructions: 'Does this convey an urgent, fast-developing, or immediate breaking news event?',
        criteria: {
          true: 'Developing story, urgent crisis, sudden event reported just now',
          false: 'Analysis, retrospective, feature profile, or standard recap'
        },
        color: 'rose',
        enabled: true,
        description: 'Time-critical news detection'
      },
      {
        id: 'journalistic_tone',
        name: 'Editorial Tone',
        type: 'choice',
        instructions: 'What style of journalism is represented in this passage?',
        criteria: {
          objective_factual: 'Straightforward reporting of verifiable facts without bias',
          analytical_opinion: 'Op-ed, commentary, or expert perspective and analysis',
          sensationalist_clickbait: 'Exaggerated, dramatic headlines designed for engagement'
        },
        color: 'butter',
        enabled: true,
        description: 'Journalistic integrity check'
      }
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media & Tweets',
    description: 'Tone detection, sarcasm recognition, and toxicity screening for social feeds.',
    badge: 'Social',
    color: 'peach',
    dimensions: [
      {
        id: 'social_sentiment',
        name: 'Sentiment',
        type: 'choice',
        instructions: 'What is the emotional polarity of this social post?',
        criteria: {
          enthusiastic_positive: 'Celebratory, friendly, loving, or delighted',
          neutral_casual: 'Everyday observation, link share, or casual remark',
          critical_unhappy: 'Frustrated, disappointed, complaining, or angry',
          sarcastic_ironic: 'Dry humor, facetious, mock praise, or satire'
        },
        color: 'lavender',
        enabled: true,
        description: 'Social post polarity including irony'
      },
      {
        id: 'toxicity_risk',
        name: 'Toxicity Risk',
        type: 'noul',
        instructions: 'Does this message contain personal harassment, slurs, or abusive language?',
        criteria: {
          true: 'Hostile attack, severe insult, or hateful rhetoric',
          false: 'Safe, civilized social communication'
        },
        color: 'rose',
        enabled: true,
        description: 'Automated moderation filter'
      },
      {
        id: 'virality_engagement',
        name: 'Engagement Potential',
        type: 'score',
        instructions: 'Rate the potential for this post to spark high engagement or discussion.',
        criteria: [
          'Niche or personal note with limited public interest',
          'Relatable topic with moderate conversational appeal',
          'Highly provocative, viral, witty, or culturally resonant'
        ],
        color: 'butter',
        enabled: true,
        description: 'Virality score 0 to 2'
      }
    ]
  },
  {
    id: 'llm-instructions',
    name: 'LLM Prompts & Instructions',
    description: 'Task intent routing, prompt specification quality, and safety alignment.',
    badge: 'Prompts',
    color: 'mint',
    dimensions: [
      {
        id: 'task_intent',
        name: 'Task Intent',
        type: 'choice',
        instructions: 'What kind of capability is this prompt requesting from an AI model?',
        criteria: {
          coding_technical: 'Writing, debugging, explaining code, or system design',
          creative_generation: 'Writing stories, poems, marketing copy, or brainstorming',
          reasoning_math: 'Logic puzzles, step-by-step math, problem solving, analysis',
          information_qa: 'Answering questions about facts, history, or knowledge',
          transformation_summary: 'Editing, summarizing, translating, or restructuring text'
        },
        color: 'mint',
        enabled: true,
        description: 'Intent routing for model selection'
      },
      {
        id: 'prompt_clarity',
        name: 'Prompt Clarity',
        type: 'score',
        instructions: 'Rate how clear and well-specified the user instructions are.',
        criteria: [
          'Vague, ambiguous, or missing crucial context',
          'Adequately specified with understandable intent',
          'Exceptionally clear with explicit constraints, input, and expected output'
        ],
        color: 'sky',
        enabled: true,
        description: 'Specification quality rating'
      },
      {
        id: 'safety_jailbreak_risk',
        name: 'Safety / Exploit Risk',
        type: 'noul',
        instructions: 'Does this prompt attempt to bypass safety guardrails or request harmful activities?',
        criteria: {
          true: 'Jailbreak attempt, malware request, exploitative or illegal action',
          false: 'Benign, safe, and constructive user request'
        },
        color: 'rose',
        enabled: true,
        description: 'Pre-execution safety screening'
      }
    ]
  },
  {
    id: 'emotion-psychology',
    name: 'Emotion & Psychological State',
    description: 'Nuanced emotional state classification and psychological intensity.',
    badge: 'Emotion',
    color: 'lilac',
    dimensions: [
      {
        id: 'core_emotion',
        name: 'Primary Emotion',
        type: 'choice',
        instructions: 'Which primary emotion best characterizes the author in this excerpt?',
        criteria: {
          joy_happiness: 'Delight, triumph, contentment, gratitude, or bliss',
          sadness_grief: 'Sorrow, melancholy, loneliness, or heartbreak',
          anger_frustration: 'Irritation, rage, indignation, or bitterness',
          fear_anxiety: 'Dread, worry, nervousness, panic, or uncertainty',
          surprise_awe: 'Astonishment, wonder, shock, or unexpected realization',
          love_affection: 'Deep warmth, caring, tenderness, or devotion'
        },
        color: 'lilac',
        enabled: true,
        description: '6-class emotion categorization'
      },
      {
        id: 'needs_empathy',
        name: 'Needs Support',
        type: 'noul',
        instructions: 'Does this person express distress that warrants an empathetic response?',
        criteria: {
          true: 'Reaching out for comfort, experiencing emotional pain or crisis',
          false: 'Stable, casual sharing, or lighthearted conversation'
        },
        color: 'rose',
        enabled: true,
        description: 'Distress detection signal'
      },
      {
        id: 'emotional_arousal',
        name: 'Arousal Level',
        type: 'score',
        instructions: 'Rate the physiological or expressive arousal of this emotional state.',
        criteria: [
          'Low arousal: calm, sluggish, depressed, or peaceful',
          'Medium arousal: alert, engaged, mildly perturbed',
          'High arousal: ecstatic, terrified, furious, or hysterical'
        ],
        color: 'peach',
        enabled: true,
        description: 'Valence-Arousal model score'
      }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support & Churn',
    description: 'Ticket routing, churn risk alerts, and customer dissatisfaction gauging.',
    badge: 'Support',
    color: 'butter',
    dimensions: [
      {
        id: 'ticket_category',
        name: 'Inquiry Category',
        type: 'choice',
        instructions: 'Which department or specialist queue should handle this ticket?',
        criteria: {
          bug_defect: 'System broken, error code, crash, service failure',
          billing_refund: 'Charges, invoice dispute, subscription payment, refund',
          account_security: 'Login trouble, password reset, 2FA, unauthorized access',
          feature_inquiry: 'How to use a feature, documentation, product capability',
          feedback_praise: 'Compliment or general non-blocking product feedback'
        },
        color: 'sky',
        enabled: true,
        description: 'Automated queue routing'
      },
      {
        id: 'churn_threat',
        name: 'Churn Risk',
        type: 'noul',
        instructions: 'Does the customer state or imply an intention to cancel or switch to a competitor?',
        criteria: {
          true: 'Threatening to leave, demanding money back, citing competitor',
          false: 'Seeking resolution without cancellation threats'
        },
        color: 'rose',
        enabled: true,
        description: 'High priority retention warning'
      },
      {
        id: 'customer_frustration',
        name: 'Frustration Level',
        type: 'score',
        instructions: 'Rate the level of frustration or anger exhibited by the customer.',
        criteria: [
          'Calm, polite, or patient',
          'Mildly annoyed or inconvenienced',
          'Very frustrated, urgent demands for resolution',
          'Extremely hostile, shouting, threatening legal or public action'
        ],
        color: 'peach',
        enabled: true,
        description: 'Customer sentiment temperature'
      }
    ]
  },
  {
    id: 'question-answering',
    name: 'Question & Knowledge Answering',
    description: 'Query complexity, factuality verifiability, and reasoning requirements.',
    badge: 'Q&A',
    color: 'sky',
    dimensions: [
      {
        id: 'question_type',
        name: 'Question Type',
        type: 'choice',
        instructions: 'What kind of question or query is this?',
        criteria: {
          factual_lookup: 'Specific entity, date, definition, or verifiable fact',
          multi_hop_reasoning: 'Requires synthesizing multiple pieces of information',
          opinion_subjective: 'Matter of personal taste, judgment, or advice',
          procedural_howto: 'Instructions or steps to achieve a goal'
        },
        color: 'sky',
        enabled: true,
        description: 'Query taxonomy classification'
      },
      {
        id: 'is_factually_verifiable',
        name: 'Factually Verifiable',
        type: 'noul',
        instructions: 'Does this question have a single objective, factually verifiable answer?',
        criteria: {
          true: 'Ground truth answer exists in empirical knowledge bases',
          false: 'Subjective, ambiguous, or open to debate'
        },
        color: 'mint',
        enabled: true,
        description: 'Verifiability probability'
      },
      {
        id: 'reasoning_depth',
        name: 'Reasoning Depth',
        type: 'score',
        instructions: 'Rate the cognitive reasoning depth needed to answer this question.',
        criteria: [
          'Simple retrieval or common sense',
          'Intermediate deduction or comparison',
          'Advanced multi-step logic or domain expertise'
        ],
        color: 'lavender',
        enabled: true,
        description: 'Cognitive reasoning score'
      }
    ]
  },
  {
    id: 'code-analysis',
    name: 'Code & Software Engineering',
    description: 'Language detection, security vulnerability flags, and code cleanliness.',
    badge: 'Code',
    color: 'mint',
    dimensions: [
      {
        id: 'code_domain',
        name: 'Language / Domain',
        type: 'choice',
        instructions: 'What programming ecosystem or domain does this snippet address?',
        criteria: {
          python_ml: 'Python, PyTorch, pandas, machine learning, scientific computing',
          web_frontend: 'JavaScript, TypeScript, React, HTML, CSS, browser APIs',
          systems_backend: 'Rust, Go, C++, Linux kernel, high-performance networking',
          database_data: 'SQL, Postgres, BigQuery, Redis, data warehousing',
          devops_cloud: 'Docker, Kubernetes, Terraform, bash, CI/CD pipelines'
        },
        color: 'mint',
        enabled: true,
        description: 'Language & ecosystem classification'
      },
      {
        id: 'has_security_flaw',
        name: 'Security Flaw Risk',
        type: 'noul',
        instructions: 'Does this code snippet exhibit potential vulnerabilities (e.g. injection, buffer overflow, hardcoded secrets)?',
        criteria: {
          true: 'Contains security anti-patterns, secrets, or exploits',
          false: 'Clean, standard, or benign logic'
        },
        color: 'rose',
        enabled: true,
        description: 'Vulnerability detection flag'
      },
      {
        id: 'code_craft_score',
        name: 'Code Craft Score',
        type: 'score',
        instructions: 'Rate the elegance, readability, and idiomatic structure of this code.',
        criteria: [
          'Messy, confusing names, lack of error handling',
          'Functional and acceptable standard implementation',
          'Idiomatic, clean architecture, elegant and maintainable'
        ],
        color: 'sky',
        enabled: true,
        description: 'Quality score 0 to 2'
      }
    ]
  }
];

/**
 * Dynamically resolves or generates the best classification dimensions for ANY Hugging Face dataset.
 * Inspects dataset ID, category, description, feature column names, and sample data.
 */
export function getDynamicDimensionsForDataset(
  datasetId: string,
  features: Array<{ name: string; type: string }> = [],
  sampleRow?: Record<string, any>
): { packName: string; dimensions: Dimension[] } {
  const dsLower = datasetId.toLowerCase();
  const featNames = features.map(f => f.name.toLowerCase());

  // 1. Direct preset match
  const preset = PRESET_DATASETS.find(p => p.id.toLowerCase() === dsLower);
  if (preset) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === preset.recommendedPack);
    if (pack) {
      return { packName: pack.name, dimensions: pack.dimensions };
    }
  }

  // 2. Reviews / Movies / E-Commerce Products
  if (
    dsLower.includes('rotten') ||
    dsLower.includes('imdb') ||
    dsLower.includes('review') ||
    dsLower.includes('amazon') ||
    dsLower.includes('yelp') ||
    featNames.includes('rating') ||
    featNames.includes('stars')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'film-reviews')!;
    return { packName: 'Reviews & Feedback', dimensions: pack.dimensions };
  }

  // 3. News / Articles / Headlines
  if (
    dsLower.includes('news') ||
    dsLower.includes('article') ||
    dsLower.includes('headline') ||
    dsLower.includes('cnn') ||
    dsLower.includes('reuters') ||
    dsLower.includes('bbc')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'news-topics')!;
    return { packName: 'News & Current Affairs', dimensions: pack.dimensions };
  }

  // 4. Instructions / Prompts / AI LLM data
  if (
    dsLower.includes('alpaca') ||
    dsLower.includes('instruct') ||
    dsLower.includes('prompt') ||
    dsLower.includes('dolly') ||
    dsLower.includes('orca') ||
    dsLower.includes('sharegpt') ||
    featNames.includes('instruction') ||
    featNames.includes('prompt')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'llm-instructions')!;
    return { packName: 'LLM Prompts & Instructions', dimensions: pack.dimensions };
  }

  // 5. Code / Programming
  if (
    dsLower.includes('code') ||
    dsLower.includes('python') ||
    dsLower.includes('github') ||
    dsLower.includes('program') ||
    featNames.includes('code') ||
    featNames.includes('func') ||
    featNames.includes('solution')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'code-analysis')!;
    return { packName: 'Code & Software Engineering', dimensions: pack.dimensions };
  }

  // 6. Question Answering / SQuAD / TruthfulQA
  if (
    dsLower.includes('qa') ||
    dsLower.includes('squad') ||
    dsLower.includes('question') ||
    dsLower.includes('answer') ||
    (featNames.includes('question') && featNames.includes('context')) ||
    (featNames.includes('question') && featNames.includes('answer'))
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'question-answering')!;
    return { packName: 'Question & Knowledge Answering', dimensions: pack.dimensions };
  }

  // 7. Customer Support / Banking / Tickets
  if (
    dsLower.includes('banking') ||
    dsLower.includes('support') ||
    dsLower.includes('ticket') ||
    dsLower.includes('customer') ||
    dsLower.includes('dialogue') ||
    dsLower.includes('chat')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'customer-support')!;
    return { packName: 'Customer Support & Intent', dimensions: pack.dimensions };
  }

  // 8. Emotion / Psychology
  if (
    dsLower.includes('emotion') ||
    dsLower.includes('feeling') ||
    dsLower.includes('mood') ||
    dsLower.includes('mental')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'emotion-psychology')!;
    return { packName: 'Emotion & Psychological State', dimensions: pack.dimensions };
  }

  // 9. Social Media / Tweets
  if (
    dsLower.includes('tweet') ||
    dsLower.includes('twitter') ||
    dsLower.includes('reddit') ||
    dsLower.includes('social')
  ) {
    const pack = PRESET_DIMENSION_PACKS.find(p => p.id === 'social-media')!;
    return { packName: 'Social Media & Tone', dimensions: pack.dimensions };
  }

  // 10. Dynamic Synthesis for Any Custom Dataset
  const cleanTitle = datasetId.split('/').pop()?.replace(/[_-]/g, ' ') || 'Content';
  const customDimensions: Dimension[] = [
    {
      id: 'content_quality',
      name: 'Content Quality',
      type: 'choice',
      instructions: `Evaluate the clarity, coherence, and quality of this entry from ${cleanTitle}.`,
      criteria: {
        high_quality: 'Well-articulated, accurate, informative, and cohesive',
        acceptable: 'Understandable and standard with minor imperfections',
        low_quality: 'Incoherent, noisy, repetitive, or low-effort'
      },
      color: 'lavender',
      enabled: true,
      description: 'Quality tier evaluation'
    },
    {
      id: 'is_actionable',
      name: 'Is Actionable',
      type: 'noul',
      instructions: `Does this entry present an actionable insight, question, or request that warrants follow-up?`,
      criteria: {
        true: 'Actionable question, directive, or clear next step',
        false: 'Passive statement, general observation, or static information'
      },
      color: 'mint',
      enabled: true,
      description: 'Actionability probability'
    },
    {
      id: 'complexity_score',
      name: 'Complexity Level',
      type: 'score',
      instructions: `Rate the semantic and conceptual complexity of this text from ${cleanTitle}.`,
      criteria: [
        'Elementary / Simple structure',
        'Moderate / Intermediate nuance',
        'High / Specialized technical density'
      ],
      color: 'sky',
      enabled: true,
      description: 'Complexity score on 0 to 2 scale'
    }
  ];

  return {
    packName: `Auto-Generated for ${cleanTitle}`,
    dimensions: customDimensions
  };
}
