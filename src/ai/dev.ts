import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-insights.ts';
import '@/ai/flows/natural-language-to-sql.ts';
import '@/ai/flows/generate-natural-language-response.ts';
import '@/ai/flows/check-visualization.ts';
