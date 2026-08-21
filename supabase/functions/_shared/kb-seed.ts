// Open agricultural knowledge chunks (ICAR / KVK / TNAU style extension advice).
// These are embedded once and retrieved by the RAG advisor.
export type KbDoc = { title: string; topic?: string; content: string; source?: string; lang?: string };

export const KB_SEED: KbDoc[] = [
  {
    title: "Paddy (rice) nutrient management",
    topic: "fertilizer",
    source: "ICAR / TNAU crop production guide",
    content:
      "For transplanted paddy the general recommendation is 120:40:40 kg N:P2O5:K2O per hectare for high yielding varieties. Apply full phosphorus as basal, and split nitrogen into three doses: 50% basal, 25% at active tillering (20-25 days after transplanting) and 25% at panicle initiation (40-45 DAT). Potash is split 50% basal and 50% at panicle initiation. Apply zinc sulphate 25 kg/ha in zinc deficient soils. Green manure such as dhaincha before planting can replace roughly 25% of nitrogen needs.",
  },
  {
    title: "Rice blast and bacterial leaf blight control",
    topic: "pest",
    source: "ICAR plant protection advisory",
    content:
      "Rice blast shows spindle shaped lesions with grey centres and brown margins on leaves; it spreads in humid, cloudy weather with heavy nitrogen. Control: avoid excess nitrogen, drain the field, spray Tricyclazole 75 WP at 0.6 g/litre or Carbendazim 50 WP at 1 g/litre. Bacterial leaf blight shows yellow wavy lesions from leaf tips drying to straw colour. Control: drain the field, stop nitrogen top dressing, spray Streptocycline 15 g plus Copper oxychloride 500 g in 500 litres per hectare. Organic option: Pseudomonas fluorescens seed treatment 10 g/kg and foliar spray 0.2%.",
  },
  {
    title: "Tomato leaf curl virus and fruit borer",
    topic: "pest",
    source: "KVK plant protection advisory",
    content:
      "Tomato leaf curl is a whitefly transmitted virus: leaves curl upward, become thick and plants stunt. There is no cure, so remove infected plants, use yellow sticky traps at 12 per acre, and control whitefly with neem oil 3 ml/litre or imidacloprid 0.3 ml/litre. Fruit borer (Helicoverpa armigera) bores circular holes in fruit; use pheromone traps 5 per acre, release Trichogramma chilonis, and spray Bacillus thuringiensis 2 g/litre or spinosad 0.3 ml/litre alternately to avoid resistance.",
  },
  {
    title: "Cotton pink bollworm and sucking pests",
    topic: "pest",
    source: "ICAR cotton IPM",
    content:
      "Pink bollworm produces rosetted flowers and bored bolls with damaged seeds. Use pheromone traps at 8 per acre from 45 days after sowing, destroy crop residue, and avoid extending the crop beyond the season. Spray profenophos 2 ml/litre or emamectin benzoate 0.4 g/litre when 10% damage is seen. For sucking pests such as jassids, aphids and whitefly, spray neem seed kernel extract 5% or acetamiprid 0.2 g/litre, and conserve natural enemies like ladybird beetles.",
  },
  {
    title: "Soil test interpretation for N, P, K and pH",
    topic: "soil",
    source: "Soil Health Card guidelines",
    content:
      "Available nitrogen: low below 280 kg/ha, medium 280-560, high above 560. Available phosphorus: low below 10 kg/ha, medium 10-25, high above 25. Available potassium: low below 110 kg/ha, medium 110-280, high above 280. Soil pH below 5.5 is acidic - apply agricultural lime 2-4 quintals per acre before the season. pH 6.0-7.5 is ideal for most crops. pH above 8.5 is alkaline or sodic - apply gypsum and organic matter and prefer tolerant crops such as barley, cotton, mustard and paddy. Low organic carbon (below 0.5%) needs farmyard manure 5-10 tonnes per hectare.",
  },
  {
    title: "Crop selection by season in India",
    topic: "crop",
    source: "ICAR cropping season guide",
    content:
      "Kharif (June-October, monsoon sown) suits paddy, maize, cotton, soybean, groundnut, pigeon pea, bajra and sugarcane. Rabi (October-March, winter) suits wheat, chickpea, mustard, barley, potato, onion and sorghum. Zaid (March-June, summer) suits watermelon, muskmelon, cucumber, fodder maize, green gram and vegetables where irrigation is assured. Rainfed light soils favour millets, pulses and groundnut; heavy clay soils with assured water favour paddy and sugarcane. Drip irrigated sandy loam favours vegetables, banana and cotton.",
  },
  {
    title: "Irrigation scheduling and water saving",
    topic: "irrigation",
    source: "TNAU water management guide",
    content:
      "Alternate wetting and drying in paddy saves 25-30% water without yield loss: re-flood when the water level drops 15 cm below the surface. Critical irrigation stages: wheat at crown root initiation, tillering, flowering and grain filling; maize at knee high, tasselling and grain filling; groundnut at pegging and pod formation. Drip irrigation saves 40-60% water and is subsidised under PMKSY. Mulching with crop residue or plastic reduces evaporation and weed growth.",
  },
  {
    title: "Government schemes for smallholder farmers",
    topic: "scheme",
    source: "Government of India schemes",
    content:
      "PM-KISAN gives Rs 6000 per year in three instalments to landholding farmer families. Pradhan Mantri Fasal Bima Yojana gives crop insurance at 2% premium for kharif, 1.5% for rabi and 5% for commercial crops. Soil Health Card provides free soil testing every two years. Kisan Credit Card offers crop loans up to Rs 3 lakh at 4% effective interest with prompt repayment. PMKSY subsidises drip and sprinkler systems, often 55% for small and marginal farmers. e-NAM allows online mandi trading for better prices.",
  },
  {
    title: "Reading mandi prices and deciding when to sell",
    topic: "market",
    source: "Agmarknet guidance",
    content:
      "Mandi reports give minimum, maximum and modal price per quintal. The modal price is the most representative rate. Compare your district modal price with nearby districts and with the Minimum Support Price before selling; transport cost usually justifies moving produce only when the price gap exceeds Rs 150-200 per quintal. Prices normally dip at peak arrival right after harvest, so staggered selling or short term warehouse storage with a pledge loan can improve realisation.",
  },
  {
    title: "Weather based farm operations advisory",
    topic: "weather",
    source: "IMD agromet advisory",
    content:
      "Do not spray pesticide or apply urea when rain is expected within 6 hours - it washes off and wastes money. Delay harvest and drying operations when heavy rain is forecast, and cover harvested produce. High humidity above 80% with 25-30 C temperature favours fungal diseases such as blast, blight and downy mildew, so plan preventive sprays. Heat above 38 C at flowering causes spikelet sterility in paddy and wheat, so give a light irrigation during the day. Strong winds above 30 km/h need staking for banana and vegetables.",
  },
];
