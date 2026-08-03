import type { City } from './types'

const cities: City[] = [
  // ===========================================================================
  // ISLAMABAD CAPITAL TERRITORY
  // ===========================================================================
  {
    slug: 'islamabad',
    name: 'Islamabad',
    province: 'Islamabad Capital Territory',
    intro:
      'Islamabad is Pakistan\'s purpose-built capital, laid out by the Capital Development Authority on a precise grid of lettered sectors that range from the leafy diplomatic enclaves of F-6 and F-7 to the fast-growing residential belts of G-13 and B-17. Properties inside CDA-developed sectors carry clean, transferable titles, which is a large part of why the city draws long-term investors and end-users alike. Beyond the official sectors, private schemes such as Bahria Town, DHA and Gulberg have added a second tier of gated living around the periphery.',
    marketNote:
      'Sector plots with CDA titles command a premium for their security of tenure, while private societies compete on amenities and installment plans.',
    areas: [
      {
        slug: 'f-6',
        name: 'F-6',
        subAreas: [
          { slug: 'f-6-markaz', name: 'F-6 Markaz' },
          { slug: 'f-6-1', name: 'F-6/1' },
          { slug: 'f-6-2', name: 'F-6/2' },
          { slug: 'f-6-3', name: 'F-6/3' },
          { slug: 'f-6-4', name: 'F-6/4' },
        ],
      },
      {
        slug: 'f-7',
        name: 'F-7',
        subAreas: [
          { slug: 'f-7-markaz', name: 'F-7 Markaz' },
          { slug: 'f-7-1', name: 'F-7/1' },
          { slug: 'f-7-2', name: 'F-7/2' },
          { slug: 'f-7-3', name: 'F-7/3' },
          { slug: 'f-7-4', name: 'F-7/4' },
        ],
      },
      {
        slug: 'f-8',
        name: 'F-8',
        subAreas: [
          { slug: 'f-8-markaz', name: 'F-8 Markaz' },
          { slug: 'f-8-1', name: 'F-8/1' },
          { slug: 'f-8-2', name: 'F-8/2' },
          { slug: 'f-8-3', name: 'F-8/3' },
          { slug: 'f-8-4', name: 'F-8/4' },
        ],
      },
      {
        slug: 'f-10',
        name: 'F-10',
        subAreas: [
          { slug: 'f-10-markaz', name: 'F-10 Markaz' },
          { slug: 'f-10-1', name: 'F-10/1' },
          { slug: 'f-10-2', name: 'F-10/2' },
          { slug: 'f-10-3', name: 'F-10/3' },
          { slug: 'f-10-4', name: 'F-10/4' },
        ],
      },
      {
        slug: 'f-11',
        name: 'F-11',
        subAreas: [
          { slug: 'f-11-markaz', name: 'F-11 Markaz' },
          { slug: 'f-11-1', name: 'F-11/1' },
          { slug: 'f-11-2', name: 'F-11/2' },
          { slug: 'f-11-3', name: 'F-11/3' },
          { slug: 'f-11-4', name: 'F-11/4' },
        ],
      },
      {
        slug: 'g-9',
        name: 'G-9',
        subAreas: [
          { slug: 'g-9-markaz', name: 'G-9 Markaz' },
          { slug: 'g-9-1', name: 'G-9/1' },
          { slug: 'g-9-2', name: 'G-9/2' },
          { slug: 'g-9-3', name: 'G-9/3' },
          { slug: 'g-9-4', name: 'G-9/4' },
        ],
      },
      {
        slug: 'g-10',
        name: 'G-10',
        subAreas: [
          { slug: 'g-10-markaz', name: 'G-10 Markaz' },
          { slug: 'g-10-1', name: 'G-10/1' },
          { slug: 'g-10-2', name: 'G-10/2' },
          { slug: 'g-10-3', name: 'G-10/3' },
          { slug: 'g-10-4', name: 'G-10/4' },
        ],
      },
      {
        slug: 'g-11',
        name: 'G-11',
        subAreas: [
          { slug: 'g-11-markaz', name: 'G-11 Markaz' },
          { slug: 'g-11-1', name: 'G-11/1' },
          { slug: 'g-11-2', name: 'G-11/2' },
          { slug: 'g-11-3', name: 'G-11/3' },
          { slug: 'g-11-4', name: 'G-11/4' },
        ],
      },
      {
        slug: 'g-13',
        name: 'G-13',
      },
      {
        slug: 'g-14',
        name: 'G-14',
      },
      {
        slug: 'g-15',
        name: 'G-15',
      },
      {
        slug: 'e-7',
        name: 'E-7',
      },
      {
        slug: 'e-11',
        name: 'E-11',
        subAreas: [
          { slug: 'e-11-1', name: 'E-11/1' },
          { slug: 'e-11-2', name: 'E-11/2' },
          { slug: 'e-11-3', name: 'E-11/3' },
          { slug: 'e-11-4', name: 'E-11/4' },
        ],
      },
      {
        slug: 'i-8',
        name: 'I-8',
        subAreas: [
          { slug: 'i-8-markaz', name: 'I-8 Markaz' },
          { slug: 'i-8-1', name: 'I-8/1' },
          { slug: 'i-8-2', name: 'I-8/2' },
          { slug: 'i-8-3', name: 'I-8/3' },
          { slug: 'i-8-4', name: 'I-8/4' },
        ],
      },
      {
        slug: 'i-9',
        name: 'I-9',
        subAreas: [
          { slug: 'i-9-markaz', name: 'I-9 Markaz' },
          { slug: 'i-9-1', name: 'I-9/1' },
          { slug: 'i-9-2', name: 'I-9/2' },
          { slug: 'i-9-3', name: 'I-9/3' },
          { slug: 'i-9-4', name: 'I-9/4' },
        ],
      },
      {
        slug: 'i-10',
        name: 'I-10',
        subAreas: [
          { slug: 'i-10-markaz', name: 'I-10 Markaz' },
          { slug: 'i-10-1', name: 'I-10/1' },
          { slug: 'i-10-2', name: 'I-10/2' },
          { slug: 'i-10-3', name: 'I-10/3' },
          { slug: 'i-10-4', name: 'I-10/4' },
        ],
      },
      {
        slug: 'i-14',
        name: 'I-14',
      },
      {
        slug: 'i-15',
        name: 'I-15',
      },
      {
        slug: 'i-16',
        name: 'I-16',
      },
      {
        slug: 'd-12',
        name: 'D-12',
      },
      {
        slug: 'b-17',
        name: 'B-17',
        subAreas: [
          { slug: 'block-a', name: 'Block A' },
          { slug: 'block-b', name: 'Block B' },
          { slug: 'block-c', name: 'Block C' },
          { slug: 'block-d', name: 'Block D' },
          { slug: 'block-e', name: 'Block E' },
          { slug: 'block-f', name: 'Block F' },
        ],
      },
      {
        slug: 'bahria-town',
        name: 'Bahria Town',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
          { slug: 'phase-3', name: 'Phase 3' },
          { slug: 'phase-4', name: 'Phase 4' },
          { slug: 'phase-5', name: 'Phase 5' },
          { slug: 'phase-6', name: 'Phase 6' },
          { slug: 'phase-7', name: 'Phase 7' },
          { slug: 'phase-8', name: 'Phase 8' },
        ],
      },
      {
        slug: 'dha-islamabad',
        name: 'DHA Islamabad',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
          { slug: 'phase-3', name: 'Phase 3' },
          { slug: 'phase-4', name: 'Phase 4' },
          { slug: 'phase-5', name: 'Phase 5' },
        ],
      },
      {
        slug: 'gulberg-greens',
        name: 'Gulberg Greens',
      },
      {
        slug: 'gulberg-residencia',
        name: 'Gulberg Residencia',
      },
      {
        slug: 'pwd-housing',
        name: 'PWD Housing Society',
      },
      {
        slug: 'soan-garden',
        name: 'Soan Garden',
      },
      {
        slug: 'bani-gala',
        name: 'Bani Gala',
      },
      {
        slug: 'park-road',
        name: 'Park Road',
      },
      {
        slug: 'blue-area',
        name: 'Blue Area',
      },
      {
        slug: 'blue-world-city',
        name: 'Blue World City',
      },
      {
        slug: 'simly-dam-road',
        name: 'Simly Dam Road',
      },
      {
        slug: 'chak-shahzad',
        name: 'Chak Shahzad',
      },
      {
        slug: 'e-16',
        name: 'E-16',
      },
    
      {
        slug: 'g-6',
        name: 'G-6',
        subAreas: [
          { slug: 'g-6-markaz', name: 'G-6 Markaz' },
          { slug: 'g-6-1', name: 'G-6/1' },
          { slug: 'g-6-2', name: 'G-6/2' },
          { slug: 'g-6-3', name: 'G-6/3' },
          { slug: 'g-6-4', name: 'G-6/4' },
        ],
      },
      {
        slug: 'g-7',
        name: 'G-7',
        subAreas: [
          { slug: 'g-7-markaz', name: 'G-7 Markaz' },
          { slug: 'g-7-1', name: 'G-7/1' },
          { slug: 'g-7-2', name: 'G-7/2' },
          { slug: 'g-7-3', name: 'G-7/3' },
          { slug: 'g-7-4', name: 'G-7/4' },
        ],
      },
      {
        slug: 'g-8',
        name: 'G-8',
        subAreas: [
          { slug: 'g-8-markaz', name: 'G-8 Markaz' },
          { slug: 'g-8-1', name: 'G-8/1' },
          { slug: 'g-8-2', name: 'G-8/2' },
          { slug: 'g-8-3', name: 'G-8/3' },
          { slug: 'g-8-4', name: 'G-8/4' },
        ],
      },
      { slug: 'f-15', name: 'F-15' },
      { slug: 'f-17', name: 'F-17' },
      { slug: 'i-11', name: 'I-11' },
      { slug: 'i-12', name: 'I-12' },
      {
        slug: 'top-city-1',
        name: 'Top City-1',
        subAreas: [
          { slug: 'block-a', name: 'Block A' },
          { slug: 'block-b', name: 'Block B' },
          { slug: 'block-c', name: 'Block C' },
          { slug: 'block-d', name: 'Block D' },
          { slug: 'block-e', name: 'Block E' },
          { slug: 'block-f', name: 'Block F' },
        ],
      },
      { slug: 'faisal-town', name: 'Faisal Town' },
      {
        slug: 'mumtaz-city',
        name: 'Mumtaz City',
        subAreas: [
          { slug: 'executive-block', name: 'Executive Block' },
          { slug: 'rose-block', name: 'Rose Block' },
          { slug: 'gulberg-block', name: 'Gulberg Block' },
        ],
      },
      {
        slug: 'capital-smart-city',
        name: 'Capital Smart City',
        subAreas: [
          { slug: 'overseas-block', name: 'Overseas Block' },
          { slug: 'executive-block', name: 'Executive Block' },
          { slug: 'harmony-park', name: 'Harmony Park' },
        ],
      },
      { slug: 'nova-city', name: 'Nova City' },
      {
        slug: 'park-view-city',
        name: 'Park View City',
        subAreas: [
          { slug: 'overseas-block', name: 'Overseas Block' },
          { slug: 'block-a', name: 'Block A' },
          { slug: 'block-b', name: 'Block B' },
          { slug: 'block-c', name: 'Block C' },
          { slug: 'block-d', name: 'Block D' },
          { slug: 'block-e', name: 'Block E' },
          { slug: 'block-f', name: 'Block F' },
          { slug: 'block-g', name: 'Block G' },
          { slug: 'block-h', name: 'Block H' },
          { slug: 'block-i', name: 'Block I' },
          { slug: 'block-j', name: 'Block J' },
        ],
      },
    ],
  },

  // ===========================================================================
  // KHYBER PAKHTUNKHWA
  // ===========================================================================
  {
    slug: 'peshawar',
    name: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Peshawar, the ancient capital of Khyber Pakhtunkhwa, blends centuries-old neighbourhoods inside the walled city with modern planned townships such as Hayatabad and DHA Peshawar on its western edge. Buyers should note that the traditional marla in the region often measures around 272 square feet rather than the standard 225, so verifying the unit basis before a deal is essential. Demand is steady from returning expatriates and a large defence and government workforce.',
    marketNote:
      'Hayatabad remains the benchmark for planned living, while Ring Road and Regi Model Town anchor the city\'s newer growth corridors.',
    areas: [
      {
        slug: 'hayatabad',
        name: 'Hayatabad',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
          { slug: 'phase-3', name: 'Phase 3' },
          { slug: 'phase-4', name: 'Phase 4' },
          { slug: 'phase-5', name: 'Phase 5' },
          { slug: 'phase-6', name: 'Phase 6' },
          { slug: 'phase-7', name: 'Phase 7' },
        ],
      },
      {
        slug: 'dha-peshawar',
        name: 'DHA Peshawar',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
        ],
      },
      {
        slug: 'regi-model-town',
        name: 'Regi Model Town',
        subAreas: [
          { slug: 'zone-1', name: 'Zone 1' },
          { slug: 'zone-2', name: 'Zone 2' },
          { slug: 'zone-3', name: 'Zone 3' },
          { slug: 'zone-4', name: 'Zone 4' },
          { slug: 'zone-5', name: 'Zone 5' },
        ],
      },
      { slug: 'university-road', name: 'University Road' },
      { slug: 'warsak-road', name: 'Warsak Road' },
      { slug: 'ring-road', name: 'Ring Road' },
      { slug: 'gulbahar', name: 'Gulbahar' },
      { slug: 'faqirabad', name: 'Faqirabad' },
      { slug: 'tehkal', name: 'Tehkal' },
      { slug: 'peshawar-cantt', name: 'Peshawar Cantt' },
    
      {
    
        slug: 'university-town',
    
        name: 'University Town',
    
        subAreas: [
    
          { slug: 'block-a', name: 'Block A' },
    
          { slug: 'block-b', name: 'Block B' },
    
          { slug: 'block-c', name: 'Block C' },
    
          { slug: 'block-d', name: 'Block D' },
    
          { slug: 'block-e', name: 'Block E' },
    
        ],
    
      },
      { slug: 'jamrud-road', name: 'Jamrud Road' },
      { slug: 'nasir-bagh-road', name: 'Nasir Bagh Road' },
    ],
  },
  {
    slug: 'mardan',
    name: 'Mardan',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Mardan is the second-largest city of Khyber Pakhtunkhwa and a busy agricultural and commercial hub in the fertile Peshawar valley. Its property market centres on established neighbourhoods near the cantonment and along the main arteries connecting it to the motorway. Affordable plot prices keep local end-user demand healthy.',
    marketNote: 'Plots near the Cantt and Sheikh Maltoon Town attract the bulk of residential interest.',
    areas: [
      {
        slug: 'sheikh-maltoon-town',
        name: 'Sheikh Maltoon Town',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
        ],
      },
      { slug: 'mardan-cantt', name: 'Mardan Cantt' },
      { slug: 'bank-road', name: 'Bank Road' },
      { slug: 'par-hoti', name: 'Par Hoti' },
      { slug: 'nowshera-road', name: 'Nowshera Road' },
      { slug: 'charsadda-road', name: 'Charsadda Road' },
    ],
  },
  {
    slug: 'mingora',
    name: 'Mingora',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Mingora is the largest city of the Swat valley and the commercial heart of Malakand division, set against a backdrop of mountains that draws year-round tourism. Property here ranges from dense bazaar-front commercial units to residential plots in expanding suburbs toward Saidu Sharif. Reconstruction and tourism investment have kept the local market resilient.',
    marketNote: 'Tourism revenue and a growing service economy underpin demand along the Mingora-Saidu Sharif corridor.',
    areas: [
      { slug: 'saidu-sharif', name: 'Saidu Sharif' },
      { slug: 'makan-bagh', name: 'Makan Bagh' },
      { slug: 'green-chowk', name: 'Green Chowk' },
      { slug: 'rahimabad', name: 'Rahimabad' },
      { slug: 'amankot', name: 'Amankot' },
    
      { slug: 'gulkada', name: 'Gulkada' },
    ],
  },
  {
    slug: 'abbottabad',
    name: 'Abbottabad',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Abbottabad is a cool hill station in the Hazara region, long favoured as a summer retreat and home to the Pakistan Military Academy at Kakul. Its temperate climate and well-regarded schools sustain steady demand for both permanent homes and second residences. Planned localities such as Jinnahabad have become the preferred address for modern housing.',
    marketNote: 'A mix of education, military presence and pleasant weather keeps Abbottabad property in demand for end-users.',
    areas: [
      {
        slug: 'mandian',
        name: 'Mandian',
        subAreas: [
          { slug: 'block-a', name: 'Block A' },
          { slug: 'block-b', name: 'Block B' },
          { slug: 'block-c', name: 'Block C' },
        ],
      },
      { slug: 'supply', name: 'Supply' },
      { slug: 'pma-road', name: 'PMA Road' },
      {
        slug: 'jinnahabad',
        name: 'Jinnahabad',
        subAreas: [
          { slug: 'block-a', name: 'Block A' },
          { slug: 'block-b', name: 'Block B' },
          { slug: 'block-c', name: 'Block C' },
        ],
      },
      { slug: 'kaghan-colony', name: 'Kaghan Colony' },
      { slug: 'abbottabad-cantt', name: 'Abbottabad Cantt' },
    
      { slug: 'hassan-town', name: 'Hassan Town' },
      { slug: 'sukoon-city', name: 'Sukoon City' },
      { slug: 'bilqias-town', name: 'Bilqias Town' },
      { slug: 'supply-bazaar', name: 'Supply Bazaar' },
      { slug: 'kakul-road', name: 'Kakul Road' },
    ],
  },
  {
    slug: 'kohat',
    name: 'Kohat',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Kohat is a historic garrison city south of Peshawar, known for its cantonment and its strategic position on routes toward the southern districts. The local property market is driven largely by the military presence and regional trade. Residential activity concentrates around the cantonment and the main town.',
    marketNote: 'Cantonment-adjacent housing forms the core of Kohat\'s residential demand.',
    areas: [
      { slug: 'kohat-cantt', name: 'Kohat Cantt' },
      { slug: 'kdf-housing', name: 'KDA Housing Scheme' },
      { slug: 'jungle-khel', name: 'Jungle Khel' },
      { slug: 'bannu-road', name: 'Bannu Road' },
    ],
  },
  {
    slug: 'bannu',
    name: 'Bannu',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Bannu sits in a fertile basin in southern Khyber Pakhtunkhwa and serves as the commercial gateway to the surrounding districts. Its property market is local and end-user driven, anchored by the cantonment and the busy main bazaars. Affordable land keeps the residential segment active.',
    marketNote: 'Local trade and the cantonment shape Bannu\'s steady, value-oriented housing market.',
    areas: [
      { slug: 'bannu-cantt', name: 'Bannu Cantt' },
      { slug: 'railway-road', name: 'Railway Road' },
      { slug: 'mandan', name: 'Mandan' },
      { slug: 'township', name: 'Township' },
    
      { slug: 'kohat-road', name: 'Kohat Road' },
    ],
  },
  {
    slug: 'dera-ismail-khan',
    name: 'Dera Ismail Khan',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Dera Ismail Khan, often shortened to D.I. Khan, lies on the west bank of the Indus and is the largest city in the southern belt of the province. It is a regional hub for trade, education and agriculture, with Gomal University drawing students from across the area. The housing market is modest and locally focused.',
    marketNote: 'University demand and regional trade keep D.I. Khan\'s residential market ticking along.',
    areas: [
      { slug: 'cantt', name: 'D.I. Khan Cantt' },
      { slug: 'topanwala', name: 'Topanwala' },
      { slug: 'south-circular-road', name: 'South Circular Road' },
      { slug: 'gomal-university-road', name: 'Gomal University Road' },
    
      { slug: 'cantt-area', name: 'Cantt Area' },
      { slug: 'tank-road', name: 'Tank Road' },
      { slug: 'circular-road', name: 'Circular Road' },
    ],
  },
  {
    slug: 'nowshera',
    name: 'Nowshera',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Nowshera straddles the Kabul River between Peshawar and the Indus, hosting one of the country\'s major military cantonments and the Pakistan Army\'s training establishments. Its location on the main GT Road and motorway interchange supports both industry and housing. Risalpur and Pabbi anchor the wider district\'s activity.',
    marketNote: 'Cantonment housing and GT Road frontage drive most of Nowshera\'s property transactions.',
    areas: [
      { slug: 'nowshera-cantt', name: 'Nowshera Cantt' },
      { slug: 'risalpur', name: 'Risalpur' },
      { slug: 'pabbi', name: 'Pabbi' },
      { slug: 'gt-road', name: 'GT Road' },
    ],
  },
  {
    slug: 'charsadda',
    name: 'Charsadda',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Charsadda is a densely populated agricultural district north of Peshawar, famous for its sugarcane, tobacco and the locally crafted Charsadda chappal. Property demand is overwhelmingly local and end-user driven, focused on the main town and along the Peshawar road. Land values remain accessible.',
    marketNote: 'Agriculture-led prosperity translates into steady demand for residential plots in and around Charsadda town.',
    areas: [
      { slug: 'shabqadar', name: 'Shabqadar' },
      { slug: 'tangi', name: 'Tangi' },
      { slug: 'prang', name: 'Prang' },
      { slug: 'nisatta', name: 'Nisatta' },
    ],
  },
  {
    slug: 'mansehra',
    name: 'Mansehra',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Mansehra is a gateway town in the Hazara region, sitting on the Karakoram Highway that leads up toward Naran, Kaghan and the northern areas. Its pleasant climate and strategic position on tourist routes support a market that mixes local housing with holiday-oriented interest. The town benefits from improving road links to Hazara Motorway.',
    marketNote: 'Position on the Karakoram Highway gives Mansehra a useful blend of local and tourism-linked property demand.',
    areas: [
      { slug: 'shinkiari', name: 'Shinkiari' },
      { slug: 'abbottabad-road', name: 'Abbottabad Road' },
      { slug: 'kaghan-road', name: 'Kaghan Road' },
      { slug: 'kashmir-colony', name: 'Kashmir Colony' },
    ],
  },
  {
    slug: 'swabi',
    name: 'Swabi',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Swabi lies between the Indus and Kabul rivers and is one of the more prosperous districts of the province, thanks partly to remittances and the nearby Ghazi Barotha and Tarbela projects. The local property market is driven by overseas earnings flowing into residential construction. Demand centres on the main town and surrounding tehsils.',
    marketNote: 'Remittance inflows fuel a healthy appetite for residential plots across Swabi\'s towns.',
    areas: [
      { slug: 'topi', name: 'Topi' },
      { slug: 'lahor', name: 'Lahor' },
      { slug: 'jehangira', name: 'Jehangira' },
      { slug: 'mardan-road', name: 'Mardan Road' },
    
      { slug: 'swabi-cantt', name: 'Swabi Cantt' },
      { slug: 'topi-road', name: 'Topi Road' },
    ],
  },
  {
    slug: 'haripur',
    name: 'Haripur',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Haripur is a fast-developing Hazara district within easy reach of both Islamabad and the Tarbela industrial zone, giving it an unusual mix of agricultural, industrial and commuter housing demand. The Hazara Motorway has sharply cut travel times to the capital, lifting interest in plots along the corridor. Khalabat Township remains a major planned settlement.',
    marketNote: 'Proximity to Islamabad and Tarbela makes Haripur an increasingly attractive commuter and investment market.',
    areas: [
      { slug: 'khalabat-township', name: 'Khalabat Township' },
      { slug: 'ghazi', name: 'Ghazi' },
      { slug: 'sarai-saleh', name: 'Sarai Saleh' },
      { slug: 'hattar', name: 'Hattar' },
    
      { slug: 'hattar-road', name: 'Hattar Road' },
      { slug: 'gt-road', name: 'GT Road' },
    ],
  },
  {
    slug: 'batkhela',
    name: 'Batkhela',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Batkhela is the headquarters of Malakand district and a busy bazaar town on the route toward Swat and Dir. Its commercial frontages along the main road are the most sought-after assets, while residential plots cluster in the surrounding slopes. Trade with the northern valleys sustains the local economy.',
    marketNote: 'Commercial bazaar frontage drives the most valuable transactions in Batkhela.',
    areas: [
      { slug: 'batkhela-bazaar', name: 'Batkhela Bazaar' },
      { slug: 'amandara', name: 'Amandara' },
      { slug: 'thana', name: 'Thana' },
    ],
  },
  {
    slug: 'timergara',
    name: 'Timergara',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Timergara is the largest town and headquarters of Lower Dir, lying in the valley of the Panjkora River. It functions as a commercial and administrative centre for the surrounding mountainous district. Property activity is local, focused on the town centre and main road frontage.',
    marketNote: 'Administrative and trade functions keep Timergara\'s compact property market locally driven.',
    areas: [
      { slug: 'timergara-bazaar', name: 'Timergara Bazaar' },
      { slug: 'balambat', name: 'Balambat' },
      { slug: 'chakdara-road', name: 'Chakdara Road' },
    ],
  },
  {
    slug: 'chitral',
    name: 'Chitral',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Chitral is a remote and scenic valley town beneath the Hindu Kush, long isolated by mountain passes but now better connected through the Lowari Tunnel. Its property market is small and tourism-linked, with interest in guesthouses and plots around the main town. The unique Kalash valleys nearby add to its tourist appeal.',
    marketNote: 'Tourism and improving access via the Lowari Tunnel slowly broaden Chitral\'s niche property market.',
    areas: [
      { slug: 'chitral-town', name: 'Chitral Town' },
      { slug: 'danin', name: 'Danin' },
      { slug: 'balach', name: 'Balach' },
    ],
  },

  // ===========================================================================
  // AZAD KASHMIR
  // ===========================================================================
  {
    slug: 'muzaffarabad',
    name: 'Muzaffarabad',
    province: 'Azad Kashmir',
    intro:
      'Muzaffarabad is the capital of Azad Jammu and Kashmir, set at the confluence of the Jhelum and Neelum rivers amid steep wooded hills. Rebuilt extensively after the 2005 earthquake, the city offers a mix of riverside neighbourhoods and newer planned colonies. Its administrative role and tourism gateway status to the Neelum valley sustain property demand.',
    marketNote: 'Government employment and Neelum valley tourism anchor Muzaffarabad\'s residential market.',
    areas: [
      { slug: 'upper-chattar', name: 'Upper Chattar' },
      { slug: 'lower-chattar', name: 'Lower Chattar' },
      { slug: 'madina-market', name: 'Madina Market' },
      { slug: 'gojra', name: 'Gojra' },
      { slug: 'domel', name: 'Domel' },
      { slug: 'university-road', name: 'University Road' },
    
      { slug: 'upper-adda', name: 'Upper Adda' },
      { slug: 'chattar', name: 'Chattar' },
      { slug: 'gojra-bala', name: 'Gojra Bala' },
      { slug: 'neelum-road', name: 'Neelum Road' },
    ],
  },
  {
    slug: 'mirpur',
    name: 'Mirpur',
    province: 'Azad Kashmir',
    intro:
      'Mirpur is the most active property market in Azad Kashmir, often nicknamed Little England because of the deep ties between the city and the large Mirpuri diaspora in the United Kingdom. Decades of remittances and the displacement caused by the Mangla Dam have funded a constant flow of construction and investment, pushing prices well above the regional norm. Planned sectors and wide boulevards give the city a distinctly modern feel.',
    marketNote: 'Strong UK diaspora demand keeps Mirpur prices and construction activity among the highest in Azad Kashmir.',
    areas: [
      { slug: 'sector-f-1', name: 'Sector F-1' },
      { slug: 'sector-b', name: 'Sector B' },
      { slug: 'sector-c', name: 'Sector C' },
      { slug: 'sector-d', name: 'Sector D' },
      { slug: 'allama-iqbal-road', name: 'Allama Iqbal Road' },
      { slug: 'kotli-road', name: 'Kotli Road' },
      { slug: 'jinnah-avenue', name: 'Jinnah Avenue' },
    
      { slug: 'sector-a', name: 'Sector A' },
      { slug: 'sector-f', name: 'Sector F' },
    ],
  },
  {
    slug: 'rawalakot',
    name: 'Rawalakot',
    province: 'Azad Kashmir',
    intro:
      'Rawalakot is the headquarters of Poonch district, a green hill town surrounded by pine forests and popular as a summer destination. Like much of the region it benefits from overseas remittances, particularly from the Gulf and the UK, which feed steady home construction. Its cool climate and scenery add a tourism dimension to local property.',
    marketNote: 'Remittances and growing hill-station tourism support Rawalakot\'s residential and guesthouse demand.',
    areas: [
      { slug: 'banjosa-road', name: 'Banjosa Road' },
      { slug: 'hajira-road', name: 'Hajira Road' },
      { slug: 'khaigala', name: 'Khaigala' },
      { slug: 'city-center', name: 'City Center' },
    
      { slug: 'bank-road', name: 'Bank Road' },
    ],
  },
  {
    slug: 'kotli',
    name: 'Kotli',
    province: 'Azad Kashmir',
    intro:
      'Kotli is one of the larger districts of Azad Kashmir, perched along the Poonch River with strong emigration links to the United Kingdom and the Middle East. Remittance-funded housing dominates the market, with new colonies steadily replacing older settlements. The town serves as a commercial centre for the surrounding hill villages.',
    marketNote: 'Diaspora remittances drive continual residential construction across Kotli\'s expanding colonies.',
    areas: [
      { slug: 'main-bazaar', name: 'Main Bazaar' },
      { slug: 'gulhar-sharif', name: 'Gulhar Sharif' },
      { slug: 'sehnsa-road', name: 'Sehnsa Road' },
      { slug: 'mirpur-road', name: 'Mirpur Road' },
    ],
  },
  {
    slug: 'bhimber',
    name: 'Bhimber',
    province: 'Azad Kashmir',
    intro:
      'Bhimber is the southernmost district of Azad Kashmir and the closest to the plains, making it relatively accessible from Gujrat and the rest of Punjab. It shares the region\'s strong diaspora links, with remittances supporting home building. The lower altitude gives it a warmer climate than the rest of the territory.',
    marketNote: 'Easy access from the plains plus diaspora funding keeps Bhimber\'s housing market steady.',
    areas: [
      { slug: 'bhimber-city', name: 'Bhimber City' },
      { slug: 'samahni', name: 'Samahni' },
      { slug: 'barnala', name: 'Barnala' },
    ],
  },
  {
    slug: 'bagh',
    name: 'Bagh',
    province: 'Azad Kashmir',
    intro:
      'Bagh is a scenic district in the central belt of Azad Kashmir, rebuilt after suffering heavy damage in the 2005 earthquake. Its forested valleys and pleasant summers attract domestic tourists, while overseas remittances support local construction. Property activity centres on the main town and along the routes toward Muzaffarabad and Rawalakot.',
    marketNote: 'Post-earthquake rebuilding and remittances continue to shape Bagh\'s gradually developing property market.',
    areas: [
      { slug: 'bagh-city', name: 'Bagh City' },
      { slug: 'dhirkot', name: 'Dhirkot' },
      { slug: 'sudhan-gali', name: 'Sudhan Gali' },
    ],
  },

  // ===========================================================================
  // GILGIT-BALTISTAN
  // ===========================================================================
  {
    slug: 'gilgit',
    name: 'Gilgit',
    province: 'Gilgit-Baltistan',
    intro:
      'Gilgit is the administrative capital of Gilgit-Baltistan and the main gateway to the high mountains of the Karakoram, Hindu Kush and Himalaya. Its position on the Karakoram Highway and at the heart of Pakistan\'s adventure-tourism circuit gives land a growing strategic value. Investment increasingly targets hotels and guesthouses alongside local residential plots.',
    marketNote: 'Tourism growth and the Karakoram Highway corridor are lifting interest in Gilgit\'s land and hospitality plots.',
    areas: [
      { slug: 'jutial', name: 'Jutial' },
      { slug: 'kashrote', name: 'Kashrote' },
      { slug: 'konodas', name: 'Konodas' },
      { slug: 'amphary', name: 'Amphary' },
      { slug: 'nagral', name: 'Nagral' },
    
      { slug: 'danyore', name: 'Danyore' },
      { slug: 'airport-road', name: 'Airport Road' },
      { slug: 'gilgit-cantt', name: 'Gilgit Cantt' },
    ],
  },
  {
    slug: 'skardu',
    name: 'Skardu',
    province: 'Gilgit-Baltistan',
    intro:
      'Skardu is the largest town of Baltistan and the launch point for expeditions to K2 and the Karakoram\'s great peaks, set in a broad valley along the Indus. The opening of an international airport and a surge in domestic and foreign tourism have made it one of the region\'s most talked-about investment destinations. Demand is rising for hotel sites, guesthouses and residential plots near the town.',
    marketNote: 'Booming mountain tourism and new air links are driving hospitality and land investment in Skardu.',
    areas: [
      { slug: 'satpara-road', name: 'Satpara Road' },
      { slug: 'hussainabad', name: 'Hussainabad' },
      { slug: 'naya-bazaar', name: 'Naya Bazaar' },
      { slug: 'sadpara', name: 'Sadpara' },
    
      { slug: 'airport-road', name: 'Airport Road' },
    ],
  },
  {
    slug: 'hunza',
    name: 'Hunza',
    province: 'Gilgit-Baltistan',
    intro:
      'Hunza is a famed mountain valley along the Karakoram Highway, celebrated for its terraced orchards, ancient forts and views of Rakaposhi and the surrounding peaks. Its global reputation as a tourist destination has driven strong interest in guesthouses, boutique hotels and scenic plots, especially around Karimabad and Aliabad. Land here trades on its views and tourism potential as much as its size.',
    marketNote: 'World-class scenery makes Hunza a magnet for hospitality investment and view-led land purchases.',
    areas: [
      { slug: 'karimabad', name: 'Karimabad' },
      { slug: 'aliabad', name: 'Aliabad' },
      { slug: 'ganish', name: 'Ganish' },
      { slug: 'gulmit', name: 'Gulmit' },
    ],
  },
  {
    slug: 'chilas',
    name: 'Chilas',
    province: 'Gilgit-Baltistan',
    intro:
      'Chilas is the headquarters of Diamer district, a strategic stop on the Karakoram Highway between Islamabad and Gilgit and the nearest town to the planned Diamer-Bhasha Dam. The mega-dam project has raised expectations for long-term land appreciation in the area. For now the market remains small and centred on highway-side commercial and residential plots.',
    marketNote: 'The Diamer-Bhasha Dam project lends Chilas land a speculative, long-horizon investment appeal.',
    areas: [
      { slug: 'chilas-town', name: 'Chilas Town' },
      { slug: 'thak', name: 'Thak' },
      { slug: 'gini', name: 'Gini' },
    ],
  },
]

export default cities
