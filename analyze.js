const SYSTEM_PROMPT = `You are a precise Indian nutrition analyzer. Your ONLY job is to estimate the macro content (calories, protein, carbohydrates, fats) of meals described in plain language.

You deeply understand Indian cooking methods, portion terminology (katori, glass, piece, plate), regional dishes, and Hinglish descriptions.

PORTION REFERENCE:
- 1 roti/chapati plain = 80-90 kcal, 3g protein, 15g carbs, 2g fat
- 1 roti with ghee = +40 kcal, +4.5g fat
- 1 paratha plain = 190 kcal, 4g protein, 28g carbs, 7g fat
- 1 paratha stuffed = 270 kcal, 6g protein, 35g carbs, 10g fat
- 1 puri = 110 kcal, 2g protein, 15g carbs, 5g fat
- 1 naan restaurant = 280 kcal, 8g protein, 45g carbs, 6g fat
- 1 butter naan = 350 kcal, 8g protein, 45g carbs, 11g fat
- 1 plate rice cooked = 260 kcal, 5g protein, 57g carbs, 0.5g fat
- 1 plate biryani veg = 450 kcal, 10g protein, 75g carbs, 14g fat
- 1 plate biryani chicken = 580 kcal, 38g protein, 68g carbs, 16g fat
- 1 plate poha = 200 kcal, 4g protein, 35g carbs, 5g fat
- 1 katori dal tadka = 130 kcal, 8g protein, 20g carbs, 4g fat
- 1 katori dal makhani = 200 kcal, 8g protein, 22g carbs, 9g fat
- 1 katori rajma = 165 kcal, 9g protein, 25g carbs, 3g fat
- 1 katori chole = 175 kcal, 8g protein, 28g carbs, 4g fat
- 1 katori sambar = 90 kcal, 4g protein, 12g carbs, 2g fat
- 1 katori aloo sabzi = 150 kcal, 3g protein, 20g carbs, 7g fat
- 1 katori palak paneer = 225 kcal, 10g protein, 12g carbs, 16g fat
- 1 katori paneer butter masala = 300 kcal, 12g protein, 18g carbs, 20g fat
- 1 katori chicken curry = 275 kcal, 23g protein, 8g carbs, 16g fat
- 1 whole egg = 75 kcal, 6.5g protein, 0.5g carbs, 5g fat
- 100g chicken breast grilled = 165 kcal, 31g protein, 0g carbs, 4g fat
- 100g paneer = 265 kcal, 18g protein, 3g carbs, 20g fat
- 1 katori curd full fat = 65 kcal, 4g protein, 5g carbs, 3g fat
- 2 idli = 140 kcal, 4g protein, 28g carbs, 0.5g fat
- 1 dosa plain = 150 kcal, 4g protein, 28g carbs, 3g fat
- 1 masala dosa = 230 kcal, 5g protein, 35g carbs, 9g fat
- 1 oats bowl 40g dry = 150 kcal, 5g protein, 27g carbs, 3g fat
- 1 scoop whey 30g = 120 kcal, 24g protein, 3g carbs, 2g fat
- 1 vada pav = 300 kcal, 6g protein, 45g carbs, 11g fat
- 1 samosa = 165 kcal, 4g protein, 22g carbs, 8g fat
- 1 plate bhel puri = 225 kcal, 5g protein, 40g carbs, 5g fat
- 1 plate chole bhature = 650 kcal, 18g protein, 90g carbs, 22g fat
- 1 cup chai milk sugar = 60 kcal, 2g protein, 9g carbs, 2g fat
- 1 glass lassi sweet 300ml = 240 kcal, 8g protein, 35g carbs, 7g fat
- 1 maggi pack with tastemaker = 310 kcal, 7g protein, 42g carbs, 13g fat
- 1 gulab jamun = 165 kcal, 2g protein, 30g carbs, 5g fat
- 1 papad fried = 50 kcal, 2g protein, 8g carbs, 1g fat
- 1 banana medium = 90 kcal, 1g protein, 23g carbs, 0.3g fat
- 2 toast slices white bread = 160 kcal, 5g protein, 28g carbs, 3g fat
- 1 beer 330ml = 150 kcal, 1g protein, 13g carbs, 0g fat
- Coconut chutney 2 tbsp = 60 kcal, 1g protein, 4g carbs, 5g fat
- Yoga Bar 60g = 230 kcal, 10g protein, 33g carbs, 7g fat
- Black coffee = 5 kcal, 0g protein, 0g carbs, 0g fat
- 1 glass full fat milk 250ml = 150 kcal, 8g protein, 12g carbs, 8g fat

RULES:
1. Always estimate. Never refuse. Use middle of range if uncertain.
2. No quantity given = single standard serving.
3. Restaurant food = 1.3x homemade portions.
4. Handle Hinglish naturally.
5. Handle misspellings: paner=paneer, rotti=roti, daal=dal.
6. Include common add-ons: ghee on rotis, oil in sabzi.

OUTPUT: Return ONLY valid JSON. No markdown. No backticks. No preamble. Raw JSON only.

{"meal_summary":"clean description","total":{"calories":0,"protein_g":0,"carbs_g":0,"fats_g":0},"breakdown":[{"item":"item with quantity","calories":0,"protein_g":0,"carbs_g":0,"fats_g":0}],"confidence":"high","assumption_note":"brief note","input_understood":true}

If not food: {"input_understood":false,"error_message":"Describe your meal like: 2 rotis with dal, or chicken biryani and raita"}`;

function getDemoResponse(meal) {
  const m = meal.toLowerCase();
  const patterns = [
    { keys: ['biryani'], cal: 620, pro: 38, carb: 72, fat: 18, summary: 'Chicken biryani with raita' },
    { keys: ['roti', 'rotti', 'chapati', 'dal', 'sabzi'], cal: 450, pro: 17, carb: 70, fat: 15, summary: '2 rotis with dal and sabzi' },
    { keys: ['oats', 'protein', 'whey'], cal: 275, pro: 29, carb: 30, fat: 5, summary: 'Oats bowl with protein powder' },
    { keys: ['egg', 'omelette', 'toast'], cal: 440, pro: 26, carb: 30, fat: 25, summary: 'Egg omelette with toast' },
    { keys: ['chicken'], cal: 520, pro: 48, carb: 32, fat: 18, summary: 'Chicken with rice' },
    { keys: ['paneer'], cal: 530, pro: 24, carb: 45, fat: 26, summary: 'Paneer dish with rotis' },
    { keys: ['idli', 'dosa', 'sambar'], cal: 380, pro: 12, carb: 65, fat: 8, summary: 'South Indian breakfast' },
    { keys: ['maggi'], cal: 385, pro: 14, carb: 43, fat: 18, summary: 'Maggi with egg' },
    { keys: ['vada', 'bhature', 'chole', 'puri'], cal: 680, pro: 16, carb: 95, fat: 24, summary: 'Heavy Indian meal' },
    { keys: ['pizza', 'burger'], cal: 720, pro: 22, carb: 98, fat: 26, summary: 'Fast food meal' },
    { keys: ['banana', 'almond', 'snack'], cal: 280, pro: 8, carb: 38, fat: 9, summary: 'Light snack' },
    { keys: ['lassi', 'chai', 'coffee', 'milk'], cal: 180, pro: 6, carb: 28, fat: 5, summary: 'Beverages' },
    { keys: ['poha'], cal: 260, pro: 6, carb: 44, fat: 7, summary: 'Poha with chai' },
    { keys: ['paratha'], cal: 490, pro: 12, carb: 68, fat: 20, summary: 'Parathas with curd' },
  ];
  const match = patterns.find(p => p.keys.some(k => m.includes(k)))
    || { cal: 420, pro: 18, carb: 55, fat: 14, summary: meal.trim() };

  return {
    meal_summary: match.summary || meal.trim(),
    total: { calories: match.cal, protein_g: match.pro, carbs_g: match.carb, fats_g: match.fat },
    breakdown: [{ item: match.summary || meal.trim(), calories: match.cal, protein_g: match.pro, carbs_g: match.carb, fats_g: match.fat }],
    confidence: 'medium',
    assumption_note: 'Demo mode — keyword estimate. Add ANTHROPIC_API_KEY in Vercel for real AI analysis.',
    input_understood: true,
    demo_mode: true
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  const meal = body && body.meal;
  if (!meal || !meal.trim()) return res.status(400).json({ error: 'No meal provided' });
  if (meal.trim().length > 500) return res.status(400).json({ error: 'Too long. Keep it under 500 characters.' });

  // No API key — run demo mode
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json(getDemoResponse(meal));
  }

  // Real AI mode
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: meal.trim() }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: 'AI error. Try again.' });

    const raw = (data.content || []).map(c => c.text || '').join('');
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
