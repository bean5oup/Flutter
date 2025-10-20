import { Ollama } from 'ollama';

/**
 * Health Risk Evaluation using Ollama + LLaMA 3.2 3B
 * Runs locally - 100% FREE, no API needed!
 */

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

/**
 * Evaluate health risk based on questionnaire answers
 * @param answers - User's questionnaire responses
 * @returns Risk score from 0-100
 */
export async function evaluate(answers?: Record<string, string>): Promise<{ 'score': number }> {
    // If no answers provided, return default
    if (!answers) {
        return { 'score': 50 };
    }

    try {
        // Try AI evaluation first
        const aiScore = await evaluateWithOllama(answers);
        return { 'score': aiScore };
    } catch (error) {
        // Fallback to rule-based scoring
        console.warn('AI evaluation failed, using fallback:', error);
        const fallbackScore = calculateRuleBasedScore(answers);
        return { 'score': fallbackScore };
    }
}

/**
 * AI evaluation using Ollama + LLaMA 3.2 3B
 */
async function evaluateWithOllama(answers: Record<string, string>): Promise<number> {
    const prompt = buildPrompt(answers);

    try {
        const response = await ollama.chat({
            model: 'llama3.2:3b',
            messages: [
                {
                    role: 'system',
                    content: 'You are a health risk assessment expert. Provide only numeric scores.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            options: {
                temperature: 0.3,
                num_predict: 50,
            }
        });

        const aiText = response.message.content;
        const score = extractScore(aiText);
        
        if (score < 0 || score > 100 || isNaN(score)) {
            throw new Error('Invalid AI score');
        }

        console.log(`✅ Ollama returned score: ${score}`);
        return score;
    } catch (error) {
        throw new Error(`Ollama failed: ${error}`);
    }
}

/**
 * Build prompt for health assessment
 */
function buildPrompt(answers: Record<string, string>): string {
    return `Analyze these health survey responses and calculate a risk score from 0-100 (0=excellent, 100=high risk):

Exercise: ${answers['TEST00'] || 'N/A'}
Sleep: ${answers['TEST01'] || 'N/A'}
Stress: ${answers['TEST02'] || 'N/A'}
Diet (fruits/veg): ${answers['TEST03'] || 'N/A'}
Water intake: ${answers['TEST04'] || 'N/A'}
Smoking: ${answers['TEST05'] || 'N/A'}
Alcohol: ${answers['TEST06'] || 'N/A'}
Overall diet: ${answers['TEST07'] || 'N/A'}

Consider:
- Regular exercise and good sleep reduce risk
- High stress increases risk
- Smoking/alcohol increase risk significantly
- Good diet/hydration reduce risk

Respond with ONLY the numeric score (0-100).`;
}

/**
 * Extract numeric score from AI response
 */
function extractScore(text: string): number {
    const match = text.trim().match(/\d+/);
    if (match) {
        return Math.max(0, Math.min(100, parseInt(match[0], 10)));
    }
    throw new Error('No score found in response');
}

// /**
//  * Rule-based fallback scoring
//  */
// function calculateRuleBasedScore(answers: Record<string, string>): number {
//     let risk = 0;

//     // Exercise (0-20 risk)
//     const ex = answers['TEST00'];
//     if (ex === 'Never') risk += 20;
//     else if (ex === 'Rarely') risk += 15;
//     else if (ex === '1-2 times/week') risk += 10;
//     else if (ex === '3-5 times/week') risk += 5;

//     // Sleep (0-15 risk)
//     const sleep = answers['TEST01'];
//     if (sleep === '< 5') risk += 15;
//     else if (sleep === '5-6') risk += 10;
//     else if (sleep === '9+') risk += 5;

//     // Stress (0-20 risk)
//     const stress = answers['TEST02'];
//     if (stress === 'Very High') risk += 20;
//     else if (stress === 'High') risk += 15;
//     else if (stress === 'Moderate') risk += 10;

//     // Diet (0-15 risk)
//     const diet = answers['TEST03'];
//     if (diet === '0-1') risk += 15;
//     else if (diet === '2-3') risk += 10;
//     else if (diet === '4-5') risk += 5;

//     // Water (0-10 risk)
//     const water = answers['TEST04'];
//     if (water === '< 1L') risk += 10;
//     else if (water === '1-2L') risk += 5;

//     // Smoking (0-25 risk)
//     const smoking = answers['TEST05'];
//     if (smoking === 'Regularly') risk += 25;
//     else if (smoking === 'Occasionally') risk += 15;

//     // Alcohol (0-15 risk)
//     const alcohol = answers['TEST06'];
//     if (alcohol === 'Daily') risk += 15;
//     else if (alcohol === 'Weekly') risk += 10;
//     else if (alcohol === 'Monthly') risk += 5;

//     // Overall diet (0-15 risk)
//     const overallDiet = answers['TEST07'];
//     if (overallDiet === 'Poor') risk += 15;
//     else if (overallDiet === 'Average') risk += 10;
//     else if (overallDiet === 'Good') risk += 5;

//     // Normalize (max risk = 135)
//     return Math.round((risk / 135) * 100);
// }