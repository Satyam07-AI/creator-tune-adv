

import { GoogleGenAI, Type } from "@google/genai";
import jspdf from 'jspdf';
import type { AuditData, TitleThumbnailAuditData, ContentStrategyData, AudienceProfileData, PersonalizedCalendarData, BrandingReviewData, EngagementHacksData, AdvancedScriptData, ABTestData, AdvancedChannelPositioningData, RetentionAnalysisData, AboutSectionAnalysisData, ScriptTone, PlatformFormat, AudiencePersona, PositionShiftStyle, PositionShiftSimulationData, StrategyType, RewrittenOptions, ChatbotResponse } from '../types';
import { getLanguageName, Language } from './localization';

/**
 * Lazily initializes the GoogleGenAI client.
 * This prevents the app from crashing on startup if the API_KEY is not set.
 * @returns {GoogleGenAI} The GoogleGenAI client instance.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
const getAiClient = (): GoogleGenAI => {
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API Key is not configured. Please set the VITE_API_KEY environment variable in your .env file.");
  }

  return new GoogleGenAI({ apiKey });
}



const getTranslationInstruction = (language: Language): string => {
    if (language === 'en') return '';
    const languageName = getLanguageName(language);
    return `\n\nIMPORTANT: After generating the entire JSON response, translate all string values within the JSON object to ${languageName}. Do not translate the JSON keys or enum values. Preserve all original formatting and structure.`;
};


const auditSchema = {
  type: Type.OBJECT,
  properties: {
    overall_score: {
      type: Type.INTEGER,
      description: "An overall channel score from 1 to 100, based on content clarity, consistency, titles, and thumbnails.",
    },
    title_analysis: {
      type: Type.ARRAY,
      description: "Deeper analysis of up to 3 recent video titles, detecting emotional triggers, hooks, and weaknesses.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The original video title." },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive aspects of the title (e.g., strong hook, clear value)." },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Negative aspects of the title (e.g., vague, no curiosity)." },
          suggestion: { type: Type.STRING, description: "An improved version of the title." },
        },
        required: ['title', 'strengths', 'weaknesses', 'suggestion'],
      },
    },
    thumbnail_review: {
      type: Type.ARRAY,
      description: "A review of up to 3 recent thumbnails, checking readability, contrast, and emotional impact.",
      items: {
        type: Type.OBJECT,
        properties: {
          video_title: { type: Type.STRING, description: "The title of the video corresponding to the thumbnail." },
          readability_score: { type: Type.INTEGER, description: "A score from 1-10 for thumbnail text readability and clarity." },
          emotional_impact: { type: Type.STRING, description: "Analysis of the emotional connection the thumbnail creates (e.g., 'High curiosity', 'Low urgency')." },
          contrast_feedback: { type: Type.STRING, description: "Feedback on color contrast and visual hierarchy." },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable tips to improve the thumbnail." },
        },
        required: ['video_title', 'readability_score', 'emotional_impact', 'contrast_feedback', 'suggestions'],
      },
    },
    niche_focus: {
      type: Type.STRING,
      description: "A detailed analysis of how well the content fits a clear niche and suggestions for improving focus.",
    },
    potential_videos: {
      type: Type.ARRAY,
      description: "Prediction of 2-3 existing videos that have growth potential and why.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the video with high potential." },
          reason_for_potential: { type: Type.STRING, description: "Why this video could perform better (e.g., ' Evergreen topic', 'High search interest')." },
          growth_strategy: { type: Type.STRING, description: "A strategy to boost this video's performance (e.g., 'Update title and thumbnail', 'Promote in end screens')." },
        },
        required: ['title', 'reason_for_potential', 'growth_strategy'],
      },
    },
    content_calendar: {
      type: Type.ARRAY,
      description: "A weekly content calendar with 3-5 upcoming video ideas, including title and thumbnail suggestions.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Suggested day for upload (e.g., 'This Friday')." },
          idea: { type: Type.STRING, description: "The core video idea." },
          suggested_title: { type: Type.STRING, description: "A clickable title for this idea." },
          thumbnail_concept: { type: Type.STRING, description: "A concept for the thumbnail design (e.g., 'Close-up of your face with a shocked expression, question mark graphic')." },
        },
        required: ['day', 'idea', 'suggested_title', 'thumbnail_concept'],
      },
    },
  },
  required: ['overall_score', 'title_analysis', 'thumbnail_review', 'niche_focus', 'potential_videos', 'content_calendar'],
};


export const runYouTubeAudit = async (channelUrl: string, language: Language): Promise<AuditData> => {
  const ai = getAiClient();
  const prompt = `
    You are a world-class YouTube channel growth strategist. Your task is to perform an advanced, multi-level audit based on a given YouTube channel URL.
    Since you cannot access external websites, you must generate a hypothetical but realistic, deep, and actionable audit based on the channel's name and URL.
    The feedback should be friendly but professional, suitable for beginner and mid-level YouTubers.

    For example, if the URL is 'youtube.com/c/ThriftyHomestead', you should infer it's a channel about frugal living and homesteading and generate a relevant, in-depth audit.
    
    Your audit must strictly follow the provided JSON schema. The analysis must be detailed and insightful.

    Your audit must include:
    1.  **overall_score**: A score from 1 to 100, assessing content clarity, consistency, titles, and thumbnails.
    2.  **title_analysis**: A deep analysis of 2-3 hypothetical recent titles, identifying emotional triggers, hooks, and weaknesses, with suggestions.
    3.  **thumbnail_review**: A review of 2-3 hypothetical thumbnails, checking readability, contrast, and emotional impact, with specific suggestions.
    4.  **niche_focus**: A clear analysis on the channel's niche clarity and how to improve it.
    5.  **potential_videos**: Identify 2-3 hypothetical existing videos with untapped growth potential and explain why.
    6.  **content_calendar**: Suggest a weekly content plan with 3-5 video ideas, including powerful titles and thumbnail concepts.

    The YouTube Channel URL is: ${channelUrl}
    ${getTranslationInstruction(language)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: auditSchema,
      },
    });
    
    const text = response.text.trim();
    return JSON.parse(text) as AuditData;
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    if (error instanceof Error && error.message.includes("API Key")) throw error;
    throw new Error("Failed to get audit from AI. Please check the channel URL and try again.");
  }
};

const titleThumbnailSchema = {
    type: Type.OBJECT,
    properties: {
      ctrRating: {
        type: Type.NUMBER,
        description: 'A click-through rate score from 1 to 10.',
      },
      analysis: {
        type: Type.STRING,
        description: 'A detailed analysis of the title and thumbnail.',
      },
      suggestedTitle: {
        type: Type.STRING,
        description: 'An improved, more clickable video title.',
      },
      thumbnailSuggestions: {
        type: Type.OBJECT,
        description: 'Advanced, in-depth suggestions for improving the thumbnail.',
        properties: {
          emotion_use: { type: Type.STRING, description: "Analysis of emotion use (e.g., facial expressions) and suggestions for improvement." },
          clutter: { type: Type.STRING, description: "Feedback on visual clutter with specific advice to simplify the design." },
          text_readability: { type: Type.STRING, description: "Analysis of font type, size, and positioning for mobile readability." },
          color_advice: { type: Type.STRING, description: "Recommendations for high-converting color combinations suitable for the video topic." },
          title_match: { type: Type.STRING, description: "Assessment of how well the thumbnail visually represents the video title." },
          ctr_prediction: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "Predicted Click-Through Rate (CTR) category as 'Low', 'Medium', or 'High'." },
        },
        required: ['emotion_use', 'clutter', 'text_readability', 'color_advice', 'title_match', 'ctr_prediction'],
      },
    },
    required: ['ctrRating', 'analysis', 'suggestedTitle', 'thumbnailSuggestions'],
};

export const runTitleThumbnailAudit = async (title: string, imageBase64: string, mimeType: string, language: Language): Promise<TitleThumbnailAuditData> => {
    const ai = getAiClient();
    const prompt = `
    You are a world-class YouTube growth consultant with a specialization in maximizing video click-through rates (CTR). A content creator has provided a video title and its corresponding thumbnail.

    Your task is to provide a comprehensive analysis and actionable recommendations. Respond ONLY with a JSON object that adheres to the provided schema.

    The user's video title is: "${title}"

    Analyze the provided title and thumbnail image and generate the following:
    1.  **ctrRating**: A score from 1 to 10, where 1 is extremely poor and 10 is perfect, representing the estimated click-through potential of the title and thumbnail combination.
    2.  **analysis**: A concise but insightful paragraph explaining the reasoning behind your rating. Address key elements like clarity, emotional hook, curiosity gap, visual hierarchy, branding, and text readability on the thumbnail.
    3.  **suggestedTitle**: A new, improved title that is more compelling and SEO-friendly, while respecting the original video's core topic.
    4.  **thumbnailSuggestions**: An object containing an advanced, multi-level analysis of the thumbnail based on the following criteria:
        - **emotion_use**: Does the thumbnail use emotion effectively (e.g., facial expressions)? Provide feedback.
        - **clutter**: Is the thumbnail visually cluttered? Suggest specific elements to simplify or remove.
        - **text_readability**: Analyze font choice, size, and placement for mobile readability.
        - **color_advice**: Recommend a high-contrast, high-converting color palette suitable for the topic.
        - **title_match**: Does the thumbnail visually align with the promise of the video title?
        - **ctr_prediction**: Predict the potential CTR as 'Low', 'Medium', or 'High'.
    ${getTranslationInstruction(language)}
  `;

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64.split(',')[1],
    },
  };

  const textPart = {
    text: prompt
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: titleThumbnailSchema,
      },
    });

    const text = response.text.trim();
    return JSON.parse(text) as TitleThumbnailAuditData;
  } catch (error) {
    console.error("Error during Gemini API call for title/thumbnail audit:", error);
    if (error instanceof Error && error.message.includes("API Key")) throw error;
    throw new Error("Failed to get thumbnail audit from AI. Please check your inputs and try again.");
  }
};

const contentStrategySchema = {
  type: Type.OBJECT,
  properties: {
    niche: {
      type: Type.OBJECT,
      properties: {
        core: { type: Type.STRING, description: 'The core niche of the channel.' },
        sub: { type: Type.STRING, description: 'The sub-niche of the channel.' },
      },
      required: ['core', 'sub'],
      description: "The channel's core niche and a more specific sub-niche.",
    },
    themes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of the most common content themes or styles found on the channel.',
    },
    trendAnalysis: {
      type: Type.ARRAY,
      description: "Analysis of current trends relevant to the niche from simulated sources like Google Trends and Reddit.",
      items: {
        type: Type.OBJECT,
        properties: {
          trend: { type: Type.STRING, description: "The identified trend." },
          source: { type: Type.STRING, description: "The simulated source of the trend (e.g., 'Google Trends', 'Reddit r/NicheTopic')." }
        },
        required: ['trend', 'source']
      }
    },
    competitorAnalysis: {
      type: Type.ARRAY,
      description: "Reverse engineering of 3 top-performing competitor channels.",
      items: {
        type: Type.OBJECT,
        properties: {
          competitor: { type: Type.STRING, description: "The name of the hypothetical competitor channel." },
          analysis: { type: Type.STRING, description: "Analysis of the competitor's successful content strategy." },
          opportunity: { type: Type.STRING, description: "A suggested content idea that bridges a gap or improves upon their strategy." }
        },
        required: ['competitor', 'analysis', 'opportunity']
      }
    },
    videoIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          idea: { type: Type.STRING, description: 'The core concept of the unique video idea.' },
          formatTag: { type: Type.STRING, description: "A category tag for the idea format (e.g., '[Listicle]', '[Challenge]')." },
          reason: { type: Type.STRING, description: 'A 1-line explanation of why this idea fits the niche.' },
          hook: { type: Type.STRING, description: "An attention-grabbing hook to start the video with." },
          suggestedTitle: { type: Type.STRING, description: "A clickable, optimized title for the video." },
          thumbnailConcept: { type: Type.STRING, description: "A clear concept for the thumbnail design." },
          viralScore: { type: Type.INTEGER, description: "A viral potential score from 0 to 100 based on title appeal, hook, etc." },
          viralScoreReason: { type: Type.STRING, description: "A brief reason for the viral score." },
          predictedComments: {
            type: Type.ARRAY,
            description: "2-3 simulated audience comments for the video idea.",
            items: {
              type: Type.OBJECT,
              properties: {
                username: { type: Type.STRING },
                comment: { type: Type.STRING }
              },
              required: ['username', 'comment']
            }
          },
          viralTriggers: {
            type: Type.ARRAY,
            description: "Psychological triggers used in the idea.",
            items: {
              type: Type.OBJECT,
              properties: {
                trigger: { type: Type.STRING, description: "e.g., 'Curiosity', 'Social Proof', 'FOMO'" },
                explanation: { type: Type.STRING, description: "How the trigger is used." }
              },
              required: ['trigger', 'explanation']
            }
          },
          trendScore: { type: Type.INTEGER, description: "A score from 0-100 based on simulated current YouTube/Google trends." },
          bestDayToPost: { type: Type.STRING, description: "The recommended day to publish (e.g., 'Saturday')." },
          contentType: { type: Type.STRING, enum: ['Evergreen', 'Trending'], description: "The content's expected lifespan type." },
          relevanceLifespan: { type: Type.STRING, description: "Explanation of the content's relevance lifespan." },
          creativeTwist: { type: Type.STRING, description: "A creative twist to make the idea unique." },
          inspirationVideos: {
            type: Type.ARRAY,
            description: "Examples of successful videos in this space.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                views: { type: Type.STRING, description: "e.g., '2.1M views'" }
              },
              required: ['title', 'views']
            }
          }
        },
        required: [
            'idea', 'formatTag', 'reason', 'hook', 'suggestedTitle', 'thumbnailConcept', 'viralScore', 
            'viralScoreReason', 'predictedComments', 'viralTriggers', 'trendScore', 'bestDayToPost', 
            'contentType', 'relevanceLifespan', 'creativeTwist', 'inspirationVideos'
        ],
      },
      description: '3-5 unique, advanced video ideas the creator should try next.',
    },
  },
  required: ['niche', 'themes', 'trendAnalysis', 'competitorAnalysis', 'videoIdeas'],
};

export const runContentStrategyAudit = async (channelUrl: string, language: Language): Promise<ContentStrategyData> => {
    const ai = getAiClient();
    const prompt = `
        You are a world-class YouTube strategist and trend analyst. Analyze the provided YouTube channel URL to generate a highly advanced and actionable content strategy.
        Since you cannot access external websites, you must generate a hypothetical but realistic and insightful analysis based on the channel's name and URL.
        For example, if the URL is 'youtube.com/c/BudgetBuilds', infer it's a channel about PC building on a budget.
        
        Your analysis must be structured and detailed. Respond ONLY with a JSON object that adheres to the provided schema.

        Your analysis must include:
        1.  **niche & themes**: The channel's core/sub-niche and common content themes.
        2.  **trendAnalysis**: Simulate pulling 1-2 latest trending topics related to the user's niche from sources like Google Trends or Reddit.
        3.  **competitorAnalysis**: Simulate an analysis of 3 top-performing competitor channels. For each, identify a content gap or an opportunity.
        4.  **videoIdeas**: Provide 3-5 enhanced video ideas. For EACH idea, you MUST provide:
            - **idea**, **formatTag**, **reason**, **hook**, **suggestedTitle**, **thumbnailConcept**, **viralScore**, **viralScoreReason**, and **predictedComments**.
            - **viralTriggers**: A breakdown of psychological triggers (like curiosity, FOMO) used in the idea and how they work.
            - **trendScore**: A 0-100 score based on simulated current YouTube/Google trends.
            - **bestDayToPost**: The single most effective day to publish.
            - **contentType** and **relevanceLifespan**: Classify as 'Evergreen' or 'Trending' and explain its relevance lifespan.
            - **creativeTwist**: Suggest one creative twist to make the idea stand out.
            - **inspirationVideos**: List 1-2 top-performing YouTube videos in this idea space with their titles and view counts.
        
        The YouTube Channel URL is: ${channelUrl}
        ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: contentStrategySchema,
          },
        });

        const text = response.text.trim();
        return JSON.parse(text) as ContentStrategyData;
      } catch (error) {
        console.error("Error during Gemini API call for content strategy audit:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to get content strategy from AI. Please check the channel URL and try again.");
      }
};

const audienceProfileSchema = {
    type: Type.OBJECT,
    properties: {
        viewerSummary: {
            type: Type.OBJECT,
            properties: {
                age: { type: Type.STRING, description: 'Estimated age range of the ideal viewer.' },
                gender: { type: Type.STRING, description: 'Estimated gender distribution (e.g., "Mostly Male", "Female-skewed", "Balanced").' },
                country: { type: Type.STRING, description: 'Likely primary country or region of the audience.' },
            },
            required: ['age', 'gender', 'country'],
        },
        contentResonanceScore: {
            type: Type.INTEGER,
            description: "A 0-100 score indicating how well the provided content aligns with the predicted audience's preferences.",
        },
        psychographics: {
            type: Type.OBJECT,
            properties: {
                personalityTraits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key personality traits of the audience." },
                values: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core values the audience holds dear." },
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Problems or challenges the audience faces related to the niche." },
                motivations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What drives the audience to seek out this type of content." },
            },
            required: ['personalityTraits', 'values', 'painPoints', 'motivations'],
        },
        sentimentAndEmotion: {
            type: Type.OBJECT,
            properties: {
                emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Emotions that the content successfully triggers (e.g., 'Curiosity', 'Humor', 'Inspiration')." },
                toneAlignment: { type: Type.STRING, description: "Analysis of how well the content's tone matches the audience's preferred tone." },
            },
            required: ['emotionalTriggers', 'toneAlignment'],
        },
        communityHotspots: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, description: "The platform where the community exists (e.g., 'Reddit', 'Discord', 'Facebook Group')." },
                    community: { type: Type.STRING, description: "The name of the community (e.g., 'r/DIY', 'Tech Geeks Server')." },
                    reason: { type: Type.STRING, description: "Why this community is relevant to the target audience." },
                },
                required: ['platform', 'community', 'reason'],
            },
            description: "A list of 3-4 relevant online communities where the target audience is active."
        },
        behavioralPredictions: {
            type: Type.OBJECT,
            properties: {
                activeHours: { type: Type.STRING, description: "Predicted times when the audience is most likely to be online." },
                ctaResponsiveness: { type: Type.STRING, description: "Prediction of how the audience will respond to different calls to action." },
                preferredFormats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of content formats the audience likely prefers (e.g., 'Shorts', 'In-depth tutorials', 'Live Q&As')." },
            },
            required: ['activeHours', 'ctaResponsiveness', 'preferredFormats'],
        },
        viewerArchetypes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "A fictional name for the persona." },
                    age: { type: Type.INTEGER, description: "The persona's age." },
                    profession: { type: Type.STRING, description: "The persona's profession or role." },
                    interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The persona's key interests." },
                    motivation: { type: Type.STRING, description: "The persona's primary motivation for watching the channel." },
                },
                required: ['name', 'age', 'profession', 'interests', 'motivation'],
            },
            description: "3 fictional audience personas with detailed attributes."
        },
        competitorAudienceOverlap: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    channelName: { type: Type.STRING, description: "The name of a similar, hypothetical competitor channel." },
                    similarities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ways in which the audience overlaps with the competitor's." },
                    differences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key differences in the audience compared to the competitor's." },
                },
                required: ['channelName', 'similarities', 'differences'],
            },
            description: "Analysis of audience overlap with 2-3 similar YouTube channels."
        },
        engagementTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 clear, actionable tips for the creator to better engage this target audience.',
        },
    },
    required: ['viewerSummary', 'contentResonanceScore', 'psychographics', 'sentimentAndEmotion', 'communityHotspots', 'behavioralPredictions', 'viewerArchetypes', 'competitorAudienceOverlap', 'engagementTips'],
};

export const runAudienceAnalysis = async (titles: string, descriptions: string, about: string, language: Language): Promise<AudienceProfileData> => {
  const ai = getAiClient();
  const prompt = `
    You are an AI YouTube audience and psychographic analyst. Your task is to generate a deeply detailed Target Audience Profile based on the provided video titles, descriptions, and the channel's "About" section. Your analysis must be useful for a creator who wants to grow their channel fast.

    Analyze the following channel data:
    ---
    Video Titles (semicolon-separated):
    ${titles}
    ---
    Video Descriptions (a few examples, separated by '---'):
    ${descriptions}
    ---
    Channel About Section:
    ${about}
    ---
    
    Now, generate a comprehensive, multi-layered audience analysis. Respond ONLY with a JSON object that adheres to the provided schema. Your response must include:

    1.  **viewerSummary**: Basic demographics (age, gender, country).
    2.  **contentResonanceScore**: A 0-100 score on how well the content aligns with the audience.
    3.  **psychographics**: Detailed profiling including personality traits, values, pain points, and motivations.
    4.  **sentimentAndEmotion**: Emotional triggers and tone alignment.
    5.  **communityHotspots**: A list of 3-4 relevant online communities (e.g., subreddits, Discords) where this audience is active.
    6.  **behavioralPredictions**: Predictions of active hours, CTA responsiveness, and preferred content formats.
    7.  **viewerArchetypes**: 3 detailed, fictional audience personas with names, professions, interests, and motivations.
    8.  **competitorAudienceOverlap**: An analysis of audience similarities and differences with 2-3 hypothetical competitor channels.
    9.  **engagementTips**: 3 clear, actionable tips to better engage this audience.
    ${getTranslationInstruction(language)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: audienceProfileSchema,
      },
    });

    const text = response.text.trim();
    return JSON.parse(text) as AudienceProfileData;
  } catch (error) {
    console.error("Error during Gemini API call for audience analysis:", error);
    if (error instanceof Error && error.message.includes("API Key")) throw error;
    throw new Error("Failed to get audience analysis from AI. Please check your inputs and try again.");
  }
};

const personalizedCalendarSchema = {
    type: Type.OBJECT,
    properties: {
        strategyType: {
            type: Type.STRING,
            enum: ['Global', 'Local (India-based)'],
            description: "The strategy type selected by the user."
        },
        calendar: {
            type: Type.ARRAY,
            description: 'An advanced 7-day personalized content calendar.',
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: 'The day of the week (e.g., "Monday").' },
                    objective: {
                        type: Type.STRING,
                        enum: ['Grow Subscribers', 'Build Trust', 'Boost Views', 'Drive Comments', 'Engage Community'],
                        description: "The primary strategic goal for this day's content."
                    },
                    publishTime: {
                        type: Type.STRING,
                        description: "The optimized time to post, considering the strategy type (e.g., '8:00 PM EST' for Global, '6:30 PM IST' for Local)."
                    },
                    format: {
                        type: Type.OBJECT,
                        properties: {
                            type: {
                                type: Type.STRING,
                                enum: ['Long-form Video', 'YouTube Short', 'Live Stream', 'Community Post', 'Poll'],
                                description: "The type of content format to use."
                            },
                            reasoning: {
                                type: Type.STRING,
                                description: "A brief explanation for why this format is recommended for this day and objective."
                            }
                        },
                        required: ['type', 'reasoning']
                    },
                    idea: { type: Type.STRING, description: 'A specific, fresh content idea aligned with the channel niche.' },
                    hooks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'A list of 1-2 powerful, viral hook suggestions for the content.'
                    },
                    predictedOutcomes: {
                        type: Type.OBJECT,
                        properties: {
                            reach: { type: Type.STRING, description: "Predicted reach for this content (e.g., 'High', 'Above Average')." },
                            engagement: { type: Type.STRING, description: "Predicted engagement level (e.g., 'High comments', 'Many poll responses')." },
                            subscriberImpact: { type: Type.STRING, description: "Predicted impact on subscriber growth (e.g., '+10-20 subs', 'Strengthens loyalty')." }
                        },
                        required: ['reach', 'engagement', 'subscriberImpact']
                    },
                    title: { type: Type.STRING, description: "A suggested, optimized title for the content." }
                },
                required: ['day', 'objective', 'publishTime', 'format', 'idea', 'hooks', 'predictedOutcomes', 'title']
            }
        }
    },
    required: ['strategyType', 'calendar']
};

export const runPersonalizedCalendarAudit = async (niche: string, topTitles: string, audienceBehavior: string, strategyType: StrategyType, language: Language): Promise<PersonalizedCalendarData> => {
    const ai = getAiClient();
    const prompt = `
      Act as an expert YouTube growth strategist and data analyst.
      You are given a YouTube channel's niche, its top video titles, audience behavior, and a desired strategy type. 
      Your task is to generate a highly advanced and actionable 7-day personalized content calendar.

      ---
      Channel Niche: ${niche}
      Top Video Titles (for context): ${topTitles}
      Audience Behavior & Activity: ${audienceBehavior || 'Assume a general audience pattern: higher engagement on evenings and weekends.'}
      Strategy Type: ${strategyType}
      ---
      
      Your response must be a single JSON object adhering to the specified schema. For the 7-day calendar, you must generate the following for EACH day:

      1.  **Intent-Based Strategy**: Assign a clear 'objective' for each idea ('Grow Subscribers', 'Build Trust', 'Boost Views', 'Drive Comments', 'Engage Community').
      2.  **Optimal Publish Time**: Suggest the best 'publishTime'. For 'Global' strategy, use a general time like '4:00 PM EST'. For 'Local (India-based)', use a specific IST time and consider local trends.
      3.  **Content Format Variety**: Provide a varied 'format' plan (Long-form, Shorts, Live, Community Post, Poll) and include a 'reasoning' for why that format is chosen for the day's objective.
      4.  **AI Hook Suggestions**: Generate 1-2 compelling, viral 'hooks' for each main video/short idea.
      5.  **Goal-Based Outcomes**: Predict the 'predictedOutcomes' (reach, engagement, subscriberImpact) for each content piece.
      6.  **Strategy Adaptation**: If the strategy is 'Local (India-based)', incorporate culturally relevant themes, languages (e.g., Hinglish), or event tie-ins if applicable. For 'Global', keep themes broad.
      7.  **Title**: Provide an optimized 'title' for the content piece.
      ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: personalizedCalendarSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as PersonalizedCalendarData;
    } catch (error) {
        console.error("Error during Gemini API call for personalized calendar:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate content calendar. Please check your inputs and try again.");
    }
};

const brandingReviewSchema = {
    type: Type.OBJECT,
    properties: {
      rating: {
        type: Type.NUMBER,
        description: 'A rating from 1 to 10 for the overall branding consistency and appeal.',
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of exactly 3 strengths of the current branding.',
      },
      weaknesses: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of exactly 3 weak points or mismatches in the branding.',
      },
      suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of exactly 3 actionable, beginner-friendly suggestions to improve the branding.',
      },
    },
    required: ['rating', 'strengths', 'weaknesses', 'suggestions'],
};

export const runBrandingReview = async (
    name: string, 
    handle: string, 
    pfpDescription: string, 
    bannerDescription: string, 
    aboutSection: string, 
    videoTitles: string,
    language: Language
): Promise<BrandingReviewData> => {
    const ai = getAiClient();
    const prompt = `
      You are an expert YouTube brand strategist.
      You have been given the following details about a YouTube channel's visuals and copy. Your task is to review and rate the overall branding quality.

      ---
      Channel Name: "${name}"
      Channel Handle: "@${handle}"
      Profile Picture Description: "${pfpDescription}"
      Channel Banner Description: "${bannerDescription}"
      About Section: "${aboutSection}"
      Example Video Titles: "${videoTitles}"
      ---

      Based on this information, provide a detailed branding analysis. Respond ONLY with a JSON object that adheres to the provided schema.

      Your response must include:
      1.  **rating**: A rating of the consistency and appeal of the branding (out of 10).
      2.  **strengths**: Identify exactly 3 strengths.
      3.  **weaknesses**: Identify exactly 3 weak points or mismatches.
      4.  **suggestions**: Give exactly 3 actionable suggestions to improve the channel branding. Ensure the advice is specific and beginner-friendly.
      ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: brandingReviewSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as BrandingReviewData;
    } catch (error) {
        console.error("Error during Gemini API call for branding review:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate branding review. Please check your inputs and try again.");
    }
};

const engagementHacksSchema = {
    type: Type.OBJECT,
    properties: {
        engagementBoostProjection: {
            type: Type.NUMBER,
            description: "A single number representing the estimated percentage boost in engagement if all hacks are applied (e.g., 25 for a 25% boost)."
        },
        ctaGenerator: {
            type: Type.ARRAY,
            description: "A list of personalized Calls to Action, one for each video format.",
            items: {
                type: Type.OBJECT,
                properties: {
                    format: { type: Type.STRING, enum: ['YouTube Short', 'Long-form Video', 'Live Stream'] },
                    ctas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of exactly 3 high-converting CTA phrases for this format." }
                },
                required: ['format', 'ctas']
            }
        },
        commentTriggers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-4 niche-relevant, question-based prompts to spark comment section discussions."
        },
        timeStampedBoosts: {
            type: Type.ARRAY,
            description: "Recommendations for engagement boosts at specific video timestamps.",
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING, description: "The specific timestamp, e.g., 'First 10 Seconds', '70% Watch Time', 'End Screen'." },
                    hack: { type: Type.STRING, description: "The engagement hack to apply, e.g., 'Tease the final outcome', 'Main Call-to-Action'." },
                    reason: { type: Type.STRING, description: "Why this hack works at this specific time." }
                },
                required: ['timestamp', 'hack', 'reason']
            }
        },
        communityTabHacks: {
            type: Type.ARRAY,
            description: "A mini checklist of high-engagement community post ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['Poll', 'Image Teaser', 'Question', 'Behind The Scenes', 'Meme'] },
                    idea: { type: Type.STRING, description: "A concrete idea for a post of this type." },
                    reason: { type: Type.STRING, description: "Why this type of post is effective for engagement." }
                },
                required: ['type', 'idea', 'reason']
            }
        },
        engagementFunnel: {
            type: Type.ARRAY,
            description: "A blueprint of the on-platform viewer engagement funnel from Watcher to Sharer.",
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.STRING, enum: ['Watcher', 'Commenter', 'Subscriber', 'Sharer'] },
                    goal: { type: Type.STRING, description: "The main goal for a viewer at this stage." },
                    tactics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific tactics to move the viewer to the next stage." }
                },
                required: ['stage', 'goal', 'tactics']
            }
        },
        retentionTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 general tips to improve viewer attention and retention, for the PDF report."
        }
    },
    required: ['engagementBoostProjection', 'ctaGenerator', 'commentTriggers', 'timeStampedBoosts', 'communityTabHacks', 'engagementFunnel', 'retentionTips']
};

export const runEngagementHacksAudit = async (
    titlesAndDescriptions: string,
    channelSize: string,
    language: Language
): Promise<EngagementHacksData> => {
    const ai = getAiClient();
    const prompt = `
      You are an AI YouTube engagement growth consultant. Your job is to analyze a channel's content style and size to provide an advanced, multi-layered engagement blueprint.
      Base your advice on the provided channel data. Your response MUST be a JSON object adhering to the specified schema.

      ---
      Channel Data:
      - Size: ${channelSize} subscribers
      - Recent Video Titles & Descriptions: ${titlesAndDescriptions}
      ---

      From this data, infer the channel's niche, tone, and audience behavior. Then, generate the following advanced engagement plan:
      1.  **engagementBoostProjection**: Estimate the potential percentage increase in engagement if the user applies all hacks.
      2.  **ctaGenerator**: Generate 3 distinct, high-converting CTAs for each format: 'YouTube Short', 'Long-form Video', and 'Live Stream'. These should be tailored to the channel's niche.
      3.  **commentTriggers**: Provide 3-4 niche-relevant, question-based prompts to spark comments.
      4.  **timeStampedBoosts**: Suggest 3-4 key moments in a video (e.g., 'First 10s', '70% watch time') to place specific engagement hacks and explain why.
      5.  **communityTabHacks**: Create a mini-checklist of 4-5 high-engagement community post ideas, including the type, a specific idea, and the reasoning.
      6.  **engagementFunnel**: Detail the 4 stages ('Watcher', 'Commenter', 'Subscriber', 'Sharer'). For each stage, define the goal and list specific tactics to move viewers to the next stage.
      7.  **retentionTips**: Provide 3-5 general tips for improving viewer attention, which will be included in the final report.
      
      Make all advice practical, highly specific, and tailored to the channel's inferred niche and size.
      ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: engagementHacksSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as EngagementHacksData;
    } catch (error) {
        console.error("Error during Gemini API call for engagement hacks:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate engagement hacks. Please check your inputs and try again.");
    }
};

const advancedScriptSchema = {
    type: Type.OBJECT,
    properties: {
        script_sections: {
            type: Type.ARRAY,
            description: "An array of script sections, each with a title, text, emotion, and optional feedback.",
            items: {
                type: Type.OBJECT,
                properties: {
                    section_title: { type: Type.STRING, description: "Title of the script section (e.g., 'Hook', 'Main Point 1')." },
                    emotion: { type: Type.STRING, enum: ['Neutral', 'Humor', 'Tension', 'Inspiration', 'Excitement', 'Sadness', 'Curiosity'], description: "The dominant emotion for this section." },
                    text: { type: Type.STRING, description: "The script text for this section." },
                    pacing_feedback: { type: Type.STRING, description: "Optional tip for pacing or delivery in this section." },
                    viral_trigger: {
                        type: Type.OBJECT,
                        description: "Optional psychological trigger used in this section.",
                        properties: {
                            technique: { type: Type.STRING, description: "The name of the technique (e.g., 'Curiosity Gap')." },
                            reason: { type: Type.STRING, description: "How the technique is applied." }
                        },
                    }
                },
                required: ['section_title', 'emotion', 'text']
            }
        },
        optimized_cta: {
            type: Type.OBJECT,
            description: "A compelling Call to Action for the end of the video.",
            properties: {
                style: { type: Type.STRING, description: "The style of the CTA (e.g., 'Direct Question', 'Community Build')." },
                placement: { type: Type.STRING, description: "Recommended placement (e.g., 'Last 15 seconds')." },
                text: { type: Type.STRING, description: "The full CTA script." }
            },
            required: ['style', 'placement', 'text']
        },
        voice_over_annotations: {
            type: Type.STRING,
            description: "The complete script combined into a single string, with annotations for pauses and delivery for easy voiceover recording. e.g., '...and that's how it works. (pause) But what if...'"
        }
    },
    required: ['script_sections', 'optimized_cta', 'voice_over_annotations']
};

export const runAdvancedScriptGeneration = async (
    topic: string,
    audience: string,
    tone: ScriptTone,
    platform: PlatformFormat,
    language: Language
): Promise<AdvancedScriptData> => {
    const ai = getAiClient();
    const prompt = `
        You are an expert YouTube scriptwriter who understands emotional pacing and viral mechanics.
        Your task is to write a complete, high-quality script package based on the provided inputs.

        Video Topic: "${topic}"
        Target Audience: "${audience}"
        Desired Tone: "${tone}"
        Platform Format: "${platform}"

        Your response MUST be a single JSON object that adheres to the provided schema. The script must be unique, engaging, and structured for high retention.

        Your script package MUST include:
        1.  **script_sections**: Break the script down into logical sections (e.g., Hook, Intro, Point 1, Climax, Outro). For EACH section, you must provide:
            - A clear 'section_title'.
            - The main 'text' for that section.
            - The dominant 'emotion' ('Humor', 'Tension', 'Inspiration', etc.).
            - An optional 'pacing_feedback' tip (e.g., "Speak faster here", "Add a 2-second pause after this line").
            - An optional 'viral_trigger' with the technique used and reason (e.g., technique: 'Curiosity Gap', reason: 'Leaves the audience wanting to know the outcome').
        2.  **optimized_cta**: A powerful, optimized Call-To-Action including its style, placement, and text.
        3.  **voice_over_annotations**: The complete script compiled into a single text block, with helpful annotations like '(pause)' or '(emphasize)' for easy voiceover recording.
        ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: advancedScriptSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as AdvancedScriptData;
    } catch (error) {
        console.error("Error during Gemini API call for advanced script generation:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate advanced script. Please check your inputs and try again.");
    }
};

const rewriteSchema = {
    type: Type.OBJECT,
    properties: {
        shorter: { type: Type.STRING, description: "A more concise version of the text." },
        more_professional: { type: Type.STRING, description: "A more professional and formal version of the text." },
        funnier: { type: Type.STRING, description: "A wittier and more humorous version of the text." }
    },
    required: ['shorter', 'more_professional', 'funnier']
};

export const runScriptRewrite = async (
    text: string,
    tone: ScriptTone,
    language: Language
): Promise<RewrittenOptions> => {
    const ai = getAiClient();
    const prompt = `
        You are an expert copy editor. A user has selected a piece of text from a script and wants you to rewrite it in a few different ways.
        The overall tone of the script is '${tone}'.

        Original Text: "${text}"

        Please provide the following three variations based on the original text. Your response MUST be a single JSON object adhering to the specified schema.
        1.  **shorter**: A more concise version.
        2.  **more_professional**: A more formal and professional version.
        3.  **funnier**: A wittier, more humorous version that still fits the overall tone.
        ${getTranslationInstruction(language)}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: rewriteSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as RewrittenOptions;
    } catch (error) {
        console.error("Error during Gemini API call for script rewrite:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to rewrite text. Please try again.");
    }
};


const abTestOptionSchema = {
    type: Type.OBJECT,
    properties: {
        ctrPrediction: {
            type: Type.OBJECT,
            properties: {
                percentage: { type: Type.NUMBER, description: "The predicted Click-Through Rate as a percentage (e.g., 4.5 for 4.5%)." }
            },
            required: ["percentage"]
        },
        psychologicalTriggers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of psychological triggers used (e.g., 'Curiosity', 'Urgency', 'Social Proof')."
        },
        attentionHeatmap: {
            type: Type.STRING,
            description: "A base64 encoded PNG image string. This image MUST be a transparent overlay of the same dimensions as the input thumbnail, with red spots for high attention, yellow for medium. This will be layered on top of the original thumbnail."
        },
        audienceFitScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 on how well this option matches the target audience profile."
        },
        titleSuggestions: {
            type: Type.OBJECT,
            properties: {
                shortVersion: { type: Type.STRING, description: "A shorter, punchier version of the title." },
                longVersion: { type: Type.STRING, description: "A longer, more descriptive version of the title." }
            },
            required: ["shortVersion", "longVersion"]
        },
        formattingImprovements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of suggestions to improve the title format (e.g., 'Add a number', 'Use an emoji')."
        }
    },
    required: ["ctrPrediction", "psychologicalTriggers", "attentionHeatmap", "audienceFitScore", "titleSuggestions", "formattingImprovements"]
};

const abTestSchema = {
    type: Type.OBJECT,
    properties: {
        winner: {
            type: Type.STRING,
            enum: ['A', 'B', 'Neither'],
            description: "Which option is more likely to get a higher CTR? Respond with 'A', 'B', or 'Neither'."
        },
        overallReasoning: {
            type: Type.STRING,
            description: "A detailed explanation for your choice, summarizing the key differences and strengths."
        },
        optionA: abTestOptionSchema,
        optionB: abTestOptionSchema,
        viralVideoReferences: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of a similar viral video." },
                    stats: { type: Type.STRING, description: "Performance statistics of that video (e.g., '10M views, 8.5% CTR')." },
                    reasonForRelevance: { type: Type.STRING, description: "Why this video is a good reference." }
                },
                required: ["title", "stats", "reasonForRelevance"]
            },
            description: "A list of 2-3 similar viral videos for reference."
        }
    },
    required: ['winner', 'overallReasoning', 'optionA', 'optionB', 'viralVideoReferences'],
};

export const runABTestAudit = async (
    titleA: string,
    imageA: string,
    mimeTypeA: string,
    titleB: string,
    imageB: string,
    mimeTypeB: string,
    targetAudience: string,
    language: Language
): Promise<ABTestData> => {
    const ai = getAiClient();
    const prompt = `
        You are an expert A/B tester and YouTube growth strategist with deep knowledge of visual psychology and audience behavior.
        You will be given two combinations of a video title and a thumbnail (Option A and Option B) and a description of the target audience.
        Your task is to perform an exhaustive, multi-faceted analysis of both options and declare a winner.

        ---
        Target Audience: "${targetAudience}"
        ---
        Option A Title: "${titleA}"
        ---
        Option B Title: "${titleB}"
        ---

        Analyze the two options based on the provided images, titles, and target audience.

        Provide your response as a single JSON object adhering to the specified schema. For EACH option (A and B), you must generate:
        1.  **ctrPrediction**: An estimated Click-Through Rate percentage.
        2.  **psychologicalTriggers**: A list of psychological triggers used (e.g., Curiosity, Urgency, Authority).
        3.  **attentionHeatmap**: A base64 encoded, transparent PNG image showing viewer attention hotspots (red for high, yellow for medium). THIS MUST BE A VALID BASE64 STRING FOR A TRANSPARENT PNG.
        4.  **audienceFitScore**: A 0-100 score for how well it resonates with the target audience.
        5.  **titleSuggestions**: Short and long variations of the title.
        6.  **formattingImprovements**: Actionable suggestions for title formatting.

        Additionally, provide the top-level analysis:
        1.  **winner**: Declare the overall winner ('A', 'B', or 'Neither').
        2.  **overallReasoning**: A summary explaining your choice.
        3.  **viralVideoReferences**: Provide 2-3 examples of similar, successful videos from the same niche with their stats.
        ${getTranslationInstruction(language)}
    `;

    const imagePartA = { inlineData: { mimeType: mimeTypeA, data: imageA.split(',')[1] } };
    const imagePartB = { inlineData: { mimeType: mimeTypeB, data: imageB.split(',')[1] } };
    
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [
                { text: 'Analyze this A/B Test. Option A:' },
                imagePartA,
                { text: 'Option B:' },
                imagePartB,
                textPart
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: abTestSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as ABTestData;
    } catch (error) {
        console.error("Error during Gemini API call for A/B test:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to get A/B test analysis from AI. Please check your inputs and try again.");
    }
};

const quadrantPositionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        x: { type: Type.NUMBER, description: "Value from -100 (e.g., Entertainment) to 100 (e.g., Education)." },
        y: { type: Type.NUMBER, description: "Value from -100 (e.g., Beginner) to 100 (e.g., Expert)." }
    },
    required: ["name", "x", "y"]
};

const advancedPositioningSchema = {
    type: Type.OBJECT,
    properties: {
        audiencePerception: {
            type: Type.OBJECT,
            properties: {
                intended: { type: Type.STRING, description: "The creator's intended brand perception based on their inputs." },
                actual: { type: Type.STRING, description: "The audience's likely actual perception based on titles and comments." },
                gapAnalysis: { type: Type.STRING, description: "Analysis of the gap between intended and actual perception." }
            },
            required: ['intended', 'actual', 'gapAnalysis']
        },
        positioningMap: {
            type: Type.OBJECT,
            properties: {
                xAxisLabel: { type: Type.STRING, description: "Label for the X-axis of the quadrant map, like 'Entertainment <-> Education'." },
                yAxisLabel: { type: Type.STRING, description: "Label for the Y-axis of the quadrant map, like 'Beginner Focus <-> Expert Focus'." },
                userPosition: { ...quadrantPositionSchema, description: "The user's position on the map." },
                competitors: { type: Type.ARRAY, items: quadrantPositionSchema, description: "A list of 5-10 hypothetical competitors and their positions." }
            },
            required: ['xAxisLabel', 'yAxisLabel', 'userPosition', 'competitors']
        },
        contentGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    angle: { type: Type.STRING, description: "A unique content angle or topic area with low competition." },
                    reason: { type: Type.STRING, description: "Why this gap exists and is a good opportunity." },
                    exampleTitle: { type: Type.STRING, description: "An example video title for this angle." }
                },
                required: ['angle', 'reason', 'exampleTitle']
            },
            description: "3-5 unique content gaps the creator can fill."
        },
        brandArchetypes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the blended brand archetype (e.g., 'The Rebel-Sage')." },
                    description: { type: Type.STRING, description: "A description of this archetype blend." },
                    strategy: { type: Type.STRING, description: "Strategic advice for leveraging this archetype." },
                    references: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Examples of famous creators or brands with this archetype." }
                },
                required: ['name', 'description', 'strategy', 'references']
            },
            description: "Assignment of 2-3 blended brand archetypes."
        },
        visualDifferentiation: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "A 0-100 score on how much the channel's visuals stand out from competitors." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the visual identity (thumbnails, fonts, colors)." },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable suggestions to improve visual differentiation." }
            },
            required: ['score', 'feedback', 'suggestions']
        },
        competitiveHeatmap: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    angle: { type: Type.STRING, description: "A specific content angle or sub-topic in the niche." },
                    density: { type: Type.NUMBER, description: "A 0-100 score representing competitor saturation for this angle." },
                    opportunity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The opportunity level for the creator in this angle." }
                },
                required: ['angle', 'density', 'opportunity']
            },
            description: "A list of 8-12 content angles with their competitive density and opportunity level."
        },
        actionPlan: {
            type: Type.ARRAY,
            description: "A 7-day, AI-based action plan checklist. Each item should be a simple, focused task to help the creator improve their positioning and grow.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "The day of the plan (1-7)." },
                    task: { type: Type.STRING, description: "The specific, actionable task for the day." },
                    reason: { type: Type.STRING, description: "A brief reason why this task is important based on the channel's analysis." }
                },
                required: ['day', 'task', 'reason']
            }
        }
    },
    required: ['audiencePerception', 'positioningMap', 'contentGaps', 'brandArchetypes', 'visualDifferentiation', 'competitiveHeatmap', 'actionPlan'],
};

export const runAdvancedPositioningAudit = async (
    niche: string,
    tone: string,
    about: string,
    titles: string,
    sampleComments: string,
    visualsDescription: string,
    language: Language
): Promise<AdvancedChannelPositioningData> => {
    const ai = getAiClient();
    const prompt = `
      You are an expert YouTube brand strategist and market analyst. Analyze the provided channel information to create an advanced, multi-layered positioning report.

      --- Channel Data ---
      Niche: "${niche}"
      Intended Tone: "${tone}"
      About Section: "${about}"
      Example Titles: "${titles}"
      Sample Audience Comments: "${sampleComments}"
      Description of Visuals (Thumbnails, Colors, Fonts): "${visualsDescription}"
      ---

      Based on ALL the provided information, generate a comprehensive report. Respond ONLY with a JSON object adhering to the specified schema. Your report MUST include:

      1.  **audiencePerception**: Analyze the gap between the intended perception (from tone, about section) and the actual perception (from comments, titles).
      2.  **positioningMap**: Create a 2x2 quadrant map. Define the X and Y axes (e.g., Entertainment vs Education, Beginner vs Expert). Place the user's channel on this map (x,y from -100 to 100) and generate 5-10 plausible competitors with their positions.
      3.  **contentGaps**: Identify 3-5 unique, underserved content angles based on the positioning map and competitor analysis. Provide a reason and example title for each.
      4.  **brandArchetypes**: Assign 2-3 blended brand archetypes (e.g., "The Rebel + The Sage"). Provide a description, strategy, and real-world references for each.
      5.  **visualDifferentiation**: Based on the visuals description, provide a score (0-100) and feedback on how well the channel's visuals stand out from implied competitors.
      6.  **competitiveHeatmap**: Generate a heatmap of 8-12 content angles in the niche, showing their competitive density (0-100) and opportunity level (Low, Medium, High). Highlight where the creator can win.
      7.  **actionPlan**: Based on all the analysis, generate a simple 7-day action plan. Each day should have one concrete, easy-to-follow task that will help the creator improve their channel positioning (e.g., 'Day 1: Research 3 competitor titles that use numbers.', 'Day 3: Write one video hook based on your new brand archetype.'). Provide a short reason for each task.
      ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: advancedPositioningSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as AdvancedChannelPositioningData;
    } catch (error) {
        console.error("Error during Gemini API call for advanced positioning audit:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate advanced positioning report. Please check your inputs and try again.");
    }
};

const positionShiftSimulationSchema = {
    type: Type.OBJECT,
    properties: {
        newTitleTone: { type: Type.STRING, description: "A description of the new tone to use in titles." },
        thumbnailStyleSuggestion: { type: Type.STRING, description: "Specific suggestions for changing the thumbnail style to match the new position." },
        videoHookExamples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3 example video hooks written in the new tone." }
    },
    required: ['newTitleTone', 'thumbnailStyleSuggestion', 'videoHookExamples']
};

export const runPositionShiftSimulation = async (
    currentPositioning: string,
    desiredShift: PositionShiftStyle,
    language: Language
): Promise<PositionShiftSimulationData> => {
    const ai = getAiClient();
    const prompt = `
      You are a YouTube rebranding strategist. A creator wants to shift their channel's positioning.
      
      Current Positioning Summary: "${currentPositioning}"
      Desired Shift: "Become ${desiredShift}"

      Based on this, generate a mini-plan for this shift. Respond ONLY with a JSON object that adheres to the provided schema. Your response must include:
      1.  **newTitleTone**: A description of the new tone they should adopt for their video titles.
      2.  **thumbnailStyleSuggestion**: Specific, actionable advice on how to change their thumbnail style (colors, fonts, imagery).
      3.  **videoHookExamples**: Three distinct examples of video hooks they could use that reflect this new positioning.
      ${getTranslationInstruction(language)}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: positionShiftSimulationSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as PositionShiftSimulationData;
    } catch (error) {
        console.error("Error during Gemini API call for position shift simulation:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate position shift simulation. Please try again.");
    }
};


const aboutSectionSchema = {
    type: Type.OBJECT,
    properties: {
        toneAnalysis: {
            type: Type.STRING,
            description: "A detailed analysis of the tone of the 'About' section (e.g., friendly, formal, funny, confusing)."
        },
        clarityAndBrandingSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of actionable suggestions to improve clarity, fix grammar, and strengthen branding in the text."
        },
        alignmentWithNiche: {
            type: Type.STRING,
            description: "An analysis of whether the 'About' section aligns with the likely niche of the channel, based on its content."
        },
        missingElements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of important missing elements, such as a clear call-to-action (CTA), contact information, or social media links."
        },
        optimizedVersion: {
            type: Type.STRING,
            description: "A completely rewritten, optimized version of the 'About' section that incorporates the suggestions."
        }
    },
    required: ['toneAnalysis', 'clarityAndBrandingSuggestions', 'alignmentWithNiche', 'missingElements', 'optimizedVersion'],
};

export const runAboutSectionAnalysis = async (aboutText: string, language: Language): Promise<AboutSectionAnalysisData> => {
    const ai = getAiClient();
    const prompt = `
        You are an expert YouTube channel strategist specializing in branding and communication.
        Your task is to analyze a channel's "About" section text.

        The user has provided the following "About" section text:
        ---
        ${aboutText}
        ---

        Based on this text, provide a comprehensive analysis. Respond ONLY with a JSON object that adheres to the provided schema.

        Your analysis must include:
        1.  **toneAnalysis**: A detailed analysis of the text's tone.
        2.  **clarityAndBrandingSuggestions**: Actionable suggestions to improve clarity, grammar, and branding.
        3.  **alignmentWithNiche**: How well the description aligns with the probable channel niche.
        4.  **missingElements**: Key missing elements like CTAs, contact info, or social links.
        5.  **optimizedVersion**: A rewritten, improved version of the text.
        ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: aboutSectionSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as AboutSectionAnalysisData;
    } catch (error) {
        console.error("Error during Gemini API call for About Section analysis:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to get 'About' section analysis from AI. Please check your input and try again.");
    }
};

const retentionAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        retentionPredictionScore: { type: Type.NUMBER, description: "A predictive retention score from 0 to 100 for the entire script." },
        performanceSummary: {
            type: Type.OBJECT,
            description: "A summary of performance for key video segments.",
            properties: {
                hookRetention: { type: Type.STRING, enum: ['Good', 'Average', 'Poor'], description: "Rating for the first 15 seconds." },
                midWatchRetention: { type: Type.STRING, enum: ['Good', 'Average', 'Poor'], description: "Rating for the middle part of the video (approx. 1-4 mins)." },
                finalCtaRetention: { type: Type.STRING, enum: ['Good', 'Average', 'Poor'], description: "Rating for the final 30 seconds where CTAs usually are." }
            },
            required: ['hookRetention', 'midWatchRetention', 'finalCtaRetention']
        },
        attentionCurve: {
            type: Type.OBJECT,
            properties: {
                points: {
                    type: Type.ARRAY,
                    description: "An array of 5-7 points representing the script's engagement/attention flow. Timestamps should be evenly distributed.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            timestamp: { type: Type.STRING, description: "Timestamp for the data point (e.g., '0:00', '0:30')." },
                            emotion: { type: Type.STRING, enum: ['Excitement', 'Curiosity', 'Humor', 'Tension', 'Informative', 'Neutral'], description: "The dominant emotion or state at this point." },
                            score: { type: Type.NUMBER, description: "The intensity of the attention from 0 to 100." }
                        },
                        required: ['timestamp', 'emotion', 'score']
                    }
                },
                summary: { type: Type.STRING, description: "A summary of the engagement patterns shown in the curve and suggestions for pacing/story structure." }
            },
            required: ['points', 'summary']
        },
        retentionTimeline: {
            type: Type.ARRAY,
            description: "A timeline identifying potential viewer drop-off zones.",
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING, description: "Timestamp range of the potential drop-off zone (e.g., '0:45-1:05')." },
                    retentionRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The risk level of viewer drop-off." },
                    dropOffCause: { type: Type.STRING, description: "The likely cause for the drop-off (e.g., 'Poor transition', 'Unclear message', 'Sudden pacing change')." },
                    segmentText: { type: Type.STRING, description: "The script text from this segment." },
                },
                required: ['timestamp', 'retentionRisk', 'dropOffCause', 'segmentText']
            }
        },
        retentionBoostTips: {
            type: Type.ARRAY,
            description: "Actionable tips for the top 3 weak retention zones.",
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING, description: "Timestamp of the weak zone this tip applies to." },
                    suggestion: { type: Type.STRING, description: "The specific content change to make (e.g., 'Add B-roll of the final product', 'Use a surprising sound effect here')." },
                    reason: { type: Type.STRING, description: "Why this suggestion will help improve retention." }
                },
                required: ['timestamp', 'suggestion', 'reason']
            }
        },
        competitorAnalysis: {
            type: Type.ARRAY,
            description: "Optional: A comparative analysis against competitor videos.",
            items: {
                type: Type.OBJECT,
                properties: {
                    videoUrl: { type: Type.STRING },
                    comparison: {
                        type: Type.OBJECT,
                        properties: {
                            intro: { type: Type.STRING, description: "Comparison of the intro sections." },
                            mid: { type: Type.STRING, description: "Comparison of the mid-sections." },
                            end: { type: Type.STRING, description: "Comparison of the ending sections." }
                        },
                        required: ['intro', 'mid', 'end']
                    },
                    structuralSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions based on the competitor's successful structure." }
                },
                required: ['videoUrl', 'comparison', 'structuralSuggestions']
            }
        },
        audiencePersonaMatch: {
            type: Type.OBJECT,
            description: "How well the script aligns with the target audience persona.",
            properties: {
                matchScore: { type: Type.NUMBER, description: "A 0-100 score of alignment with the target audience." },
                feedback: { type: Type.STRING, description: "Feedback on why the script does or does not match the persona's preferences." }
            },
            required: ['matchScore', 'feedback']
        },
        overallSummary: { type: Type.STRING, description: "A brief, actionable summary of the entire retention analysis." },
    },
    required: [
        'retentionPredictionScore',
        'performanceSummary',
        'attentionCurve',
        'retentionTimeline',
        'retentionBoostTips',
        'audiencePersonaMatch',
        'overallSummary'
    ]
};

export const runRetentionAnalysis = async (script: string, targetAudience: AudiencePersona, language: Language, competitorUrls?: string[]): Promise<RetentionAnalysisData> => {
    const ai = getAiClient();
    const competitorPrompt = competitorUrls && competitorUrls.length > 0
        ? `
        ---
        Competitor Videos to analyze (simulate if you cannot access them):
        ${competitorUrls.map(url => `- ${url}`).join('\n')}
        ---
        Your analysis MUST include the 'competitorAnalysis' section. For each competitor, provide a simulated comparison of intro, mid, and end retention and give structural suggestions based on what works in their videos.`
        : "No competitor URLs were provided, so omit the 'competitorAnalysis' field from your response.";
        
    const prompt = `
      You are an expert YouTube video editor and audience retention strategist. Your task is to perform an advanced analysis of a video script to identify potential issues that could cause viewers to drop off and provide a comprehensive improvement plan.
      
      The script should be analyzed for a target audience of: "${targetAudience}".

      Analyze the following script:
      ---
      ${script}
      ---
      
      ${competitorPrompt}

      Provide a comprehensive analysis based on the following criteria. Respond ONLY with a JSON object that adheres to the provided schema. Your analysis must be detailed and cover all of the following points:

      1.  **retentionPredictionScore**: An overall predictive score from 0-100 for the script.
      2.  **performanceSummary**: Provide a 'Good', 'Average', or 'Poor' rating for 'hookRetention' (first 15s), 'midWatchRetention' (middle section), and 'finalCtaRetention' (last 30s).
      3.  **attentionCurve**: Map the attention flow. Provide 5-7 data points with emotion/state and score. Also provide a plain-English 'summary' of the engagement pattern with suggestions on hook structure or story pacing.
      4.  **retentionTimeline**: This is the data for the heatmap. Identify potential drop-off zones. For each, provide the 'timestamp' range, 'retentionRisk' ('Low', 'Medium', 'High'), the specific 'dropOffCause', and the 'segmentText'.
      5.  **retentionBoostTips**: For the top 3 weakest retention zones identified, provide specific, actionable content changes ('suggestion') and explain the 'reason' why it will work.
      6.  **audiencePersonaMatch**: Evaluate how well the script aligns with the '${targetAudience}' persona. Provide a 'matchScore' and detailed 'feedback'.
      7.  **overallSummary**: A concise, actionable summary of the script's strengths and key areas for improvement.
      ${getTranslationInstruction(language)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: retentionAnalysisSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as RetentionAnalysisData;
    } catch (error) {
        console.error("Error during Gemini API call for retention analysis:", error);
        if (error instanceof Error && error.message.includes("API Key")) throw error;
        throw new Error("Failed to generate retention analysis. Please check your script and try again.");
    }
};

const chatbotSchema = {
    type: Type.OBJECT,
    properties: {
        reply: { type: Type.STRING, description: "The chatbot's helpful and friendly response to the user's query." },
        suggestedReplies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 short, relevant follow-up questions or actions the user might want to take."
        }
    },
    required: ['reply', 'suggestedReplies']
};

export const runChatbotQuery = async (query: string, chatLanguage: 'hinglish' | 'english'): Promise<ChatbotResponse> => {
    const ai = getAiClient();
    const languageInstruction = chatLanguage === 'hinglish' 
        ? "Your primary language is Hinglish (a mix of casual Hindi and English). Use Roman script for Hindi words (e.g., 'Kaise ho?'). Be friendly and encouraging, like a 'buddy'."
        : "Your primary language is professional but friendly English. Be clear and concise.";

    const systemPrompt = `
        You are 'CreatorTune Buddy', a helpful AI assistant for the CreatorTune website.
        ${languageInstruction}

        Your knowledge base includes all features of CreatorTune:
        - **Channel Audit**: Provides a quick, overall score and analysis of a YouTube channel.
        - **Title & Thumbnail Optimizer**: Gives a CTR score and suggestions for a title/thumbnail combo.
        - **Content Strategy/Ideas**: Generates viral video ideas with deep analysis.
        - **Audience Analyzer**: Creates a detailed profile of a channel's target audience.
        - **Content Calendar**: Plans a week of content with ideas and post times.
        - **Branding Review**: Checks for branding consistency.
        - **Engagement Hacks**: Suggests ways to boost comments, likes, etc.
        - **Script Generator**: Writes full video scripts.
        - **A/B Tester**: Compares two thumbnails/titles.
        - **Retention Analyzer**: Finds boring parts in a script *before* filming.
        - **Positioning Map**: Helps find a unique niche.
        - **'About' Section Analyzer**: Improves the channel's 'About' page.
        - **Thumbnail Library**: A collection of downloadable thumbnail templates.

        General FAQs:
        - The tool is currently free for testing. No login is needed for most features.
        - It's safe; it doesn't require connecting a YouTube account.
        - Reports can be downloaded as PDFs or JSON from their respective tool pages.
        - To talk to a human, the user should use the contact form.

        Your tasks:
        1. Understand the user's query, which could be in English, Hindi, or Hinglish.
        2. Provide a helpful, concise answer based on your knowledge base.
        3. ALWAYS provide 2-3 short, relevant 'suggestedReplies' to guide the conversation.
        4. If you don't know the answer, politely say so and suggest they talk to a human.
    `;

    const prompt = `User's query: "${query}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: chatbotSchema,
            },
        });

        const text = response.text.trim();
        return JSON.parse(text) as ChatbotResponse;
    } catch (error) {
        console.error("Error during Gemini API call for chatbot:", error);
        throw new Error("Sorry, I'm having a little trouble thinking right now. Please try again in a moment.");
    }
};


/**
 * Client-side utility to trigger a file download in the browser.
 * @param content The string content of the file.
 * @param fileName The desired name of the file.
 * @param contentType The MIME type of the file.
 */
export const downloadFileAs = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};

/**
 * Creates and downloads a simple text-based PDF from AuditData.
 */
export const downloadAsPdf = (data: AuditData, channelUrl: string) => {
    const doc = new jspdf();
    doc.setFontSize(12);
    const text = `Creator Tune Audit Report\n\nURL: ${channelUrl}\n\n${JSON.stringify(data, null, 2)}`;
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);
    doc.save(`CreatorTune-Audit-${channelUrl.split('/').pop() || 'report'}.pdf`);
};

/**
 * Downloads an object as a formatted JSON file.
 */
export const downloadAsJson = (data: object, fileName: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    downloadFileAs(jsonString, fileName, 'application/json');
};

/**
 * Downloads a string as a plain text file.
 */
export const downloadAsText = (content: string, fileName: string) => {
    downloadFileAs(content, fileName, 'text/plain;charset=utf-8');
};