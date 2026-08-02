import type { City } from './types'

const cities: City[] = [
  {
    slug: 'lahore',
    name: 'Lahore',
    province: 'Punjab',
    intro:
      'Lahore is Punjab\'s capital and the most active property market in the province, where prices are usually quoted per marla for residential plots and per square foot for apartments. Demand is driven by flagship gated communities such as DHA Defence and Bahria Town alongside long-established neighbourhoods like Gulberg, Model Town and Johar Town. Rental and resale activity stays strong across both the eastern Cantt corridor and the southern Raiwind and Ferozepur Road belts.',
    marketNote:
      'Investor and end-user demand in Lahore concentrates on DHA, Bahria Town and the Gulberg–Johar Town corridor.',
    areas: [
      {
        slug: 'dha-defence',
        name: 'DHA Defence',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
          { slug: 'phase-3', name: 'Phase 3' },
          { slug: 'phase-4', name: 'Phase 4' },
          { slug: 'phase-5', name: 'Phase 5' },
          { slug: 'phase-6', name: 'Phase 6' },
          { slug: 'phase-7', name: 'Phase 7' },
          { slug: 'phase-8', name: 'Phase 8' },
          { slug: 'phase-9-prism', name: 'Phase 9 Prism' },
        ],
      },
      {
        slug: 'bahria-town',
        name: 'Bahria Town',
        subAreas: [
          { slug: 'sector-a', name: 'Sector A' },
          { slug: 'sector-b', name: 'Sector B' },
          { slug: 'sector-c', name: 'Sector C' },
          { slug: 'sector-d', name: 'Sector D' },
          { slug: 'sector-e', name: 'Sector E' },
          { slug: 'sector-f', name: 'Sector F' },
          { slug: 'overseas-enclave', name: 'Overseas Enclave' },
        ],
      },
      { slug: 'gulberg', name: 'Gulberg' },
      { slug: 'johar-town', name: 'Johar Town' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'wapda-town', name: 'Wapda Town' },
      { slug: 'lake-city', name: 'Lake City' },
      { slug: 'lda-avenue', name: 'LDA Avenue' },
      { slug: 'askari', name: 'Askari' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'allama-iqbal-town', name: 'Allama Iqbal Town' },
      { slug: 'valencia', name: 'Valencia' },
      { slug: 'garden-town', name: 'Garden Town' },
      { slug: 'faisal-town', name: 'Faisal Town' },
      { slug: 'township', name: 'Township' },
      { slug: 'samanabad', name: 'Samanabad' },
      { slug: 'ferozepur-road', name: 'Ferozepur Road' },
      { slug: 'raiwind-road', name: 'Raiwind Road' },
      { slug: 'manga-mandi', name: 'Manga Mandi' },
      { slug: 'sundar', name: 'Sundar Industrial Estate' },
      { slug: 'multan-road', name: 'Multan Road' },
      { slug: 'canal-road', name: 'Canal Road' },
      { slug: 'paragon-city', name: 'Paragon City' },
      { slug: 'state-life-housing', name: 'State Life Housing Society' },
    ],
  },
  {
    slug: 'faisalabad',
    name: 'Faisalabad',
    province: 'Punjab',
    intro:
      'Faisalabad, Pakistan\'s textile hub, has a property market where plots are quoted per marla and demand tracks the city\'s industrial earnings. Madina Town and Peoples Colony remain the most sought-after established addresses, while newer schemes like Citi Housing and Eden Valley draw fresh investment. Arterial roads such as Susan Road, Satiana Road and Canal Road anchor much of the city\'s residential expansion.',
    marketNote:
      'Faisalabad property demand is led by Madina Town, Peoples Colony and the growing Citi Housing and Eden Valley schemes.',
    areas: [
      { slug: 'madina-town', name: 'Madina Town' },
      { slug: 'peoples-colony', name: 'Peoples Colony' },
      { slug: 'eden-valley', name: 'Eden Valley' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'susan-road', name: 'Susan Road' },
      { slug: 'satiana-road', name: 'Satiana Road' },
      { slug: 'jaranwala-road', name: 'Jaranwala Road' },
      { slug: 'canal-road', name: 'Canal Road' },
      { slug: 'gulberg', name: 'Gulberg' },
      { slug: 'samanabad', name: 'Samanabad' },
      { slug: 'wapda-city', name: 'Wapda City' },
    ],
  },
  {
    slug: 'rawalpindi',
    name: 'Rawalpindi',
    province: 'Punjab',
    intro:
      'Rawalpindi shares a metropolitan corridor with Islamabad, and its property prices are quoted per marla with a premium close to the twin-city boundary. Master-planned communities like Bahria Town and DHA Islamabad-Rawalpindi dominate the high-end segment, while Satellite Town and Chaklala Scheme remain favoured older neighbourhoods. Proximity to Islamabad and the airport keeps demand resilient along Adiala and Peshawar Roads.',
    marketNote:
      'Bahria Town and DHA lead Rawalpindi values, with Satellite Town and Chaklala Scheme strong in the older city core.',
    areas: [
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
        slug: 'dha',
        name: 'DHA',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
          { slug: 'phase-3', name: 'Phase 3' },
          { slug: 'phase-4', name: 'Phase 4' },
          { slug: 'phase-5', name: 'Phase 5' },
        ],
      },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'chaklala-scheme-3', name: 'Chaklala Scheme 3' },
      { slug: 'adiala-road', name: 'Adiala Road' },
      { slug: 'gulraiz', name: 'Gulraiz' },
      { slug: 'airport-housing-society', name: 'Airport Housing Society' },
      { slug: 'westridge', name: 'Westridge' },
      { slug: 'peshawar-road', name: 'Peshawar Road' },
      { slug: 'morgah', name: 'Morgah' },
      { slug: 'saddar', name: 'Saddar' },
      { slug: 'cantt', name: 'Rawalpindi Cantt' },
      { slug: 'gulistan-colony', name: 'Gulistan Colony' },
    ],
  },
  {
    slug: 'multan',
    name: 'Multan',
    province: 'Punjab',
    intro:
      'Multan, the City of Saints, has a property market quoted per marla where demand is anchored by its position as southern Punjab\'s commercial centre. DHA Multan and Citi Housing have reshaped the premium segment, while Gulgasht Colony, Model Town and Shah Rukn-e-Alam Colony remain trusted established areas. Bosan Road and the Northern Bypass corridor continue to absorb most new residential development.',
    marketNote:
      'DHA Multan and Citi Housing drive premium demand, with Gulgasht and Model Town leading the established market.',
    areas: [
      {
        slug: 'dha',
        name: 'DHA',
        subAreas: [
          { slug: 'sector-a', name: 'Sector A' },
          { slug: 'sector-b', name: 'Sector B' },
          { slug: 'sector-c', name: 'Sector C' },
          { slug: 'sector-v', name: 'Sector V' },
          { slug: 'sector-w', name: 'Sector W' },
        ],
      },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'gulgasht-colony', name: 'Gulgasht Colony' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'shah-rukn-e-alam-colony', name: 'Shah Rukn-e-Alam Colony' },
      { slug: 'bosan-road', name: 'Bosan Road' },
      { slug: 'wapda-town', name: 'Wapda Town' },
      { slug: 'northern-bypass', name: 'Northern Bypass' },
      { slug: 'mumtazabad', name: 'Mumtazabad' },
    ],
  },
  {
    slug: 'gujranwala',
    name: 'Gujranwala',
    province: 'Punjab',
    intro:
      'Gujranwala is an industrial powerhouse on the GT Road where property is quoted per marla and demand is fed by manufacturing and trading wealth. DC Colony and Citi Housing are the most prestigious modern addresses, while Model Town, Satellite Town and Peoples Colony hold steady established appeal. Master City and the GT Road frontage attract both residential buyers and commercial investors.',
    marketNote:
      'DC Colony and Citi Housing lead Gujranwala values, supported by the established Model Town and Satellite Town belts.',
    areas: [
      { slug: 'dc-colony', name: 'DC Colony' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'wapda-town', name: 'Wapda Town' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'master-city', name: 'Master City' },
      { slug: 'peoples-colony', name: 'Peoples Colony' },
    ],
  },
  {
    slug: 'sialkot',
    name: 'Sialkot',
    province: 'Punjab',
    intro:
      'Sialkot\'s export-driven economy of surgical instruments and sports goods underpins a property market quoted per marla. Cantt and Model Town remain the premium residential choices, while Citi Housing and Defence Road have channelled newer demand. Strong overseas remittances from the city\'s business diaspora keep plot values firm.',
    marketNote:
      'Sialkot demand centres on Cantt, Model Town and the newer Citi Housing scheme.',
    areas: [
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'defence-road', name: 'Defence Road' },
      { slug: 'kashmir-road', name: 'Kashmir Road' },
      { slug: 'paris-road', name: 'Paris Road' },
      { slug: 'aziz-shaheed-road', name: 'Aziz Shaheed Road' },
    ],
  },
  {
    slug: 'bahawalpur',
    name: 'Bahawalpur',
    province: 'Punjab',
    intro:
      'Bahawalpur, the former princely state capital, has a growing property market quoted per marla and supported by its role as a regional education and administrative centre. DHA Bahawalpur has brought modern gated living, while Model Town and Satellite Town remain the trusted established neighbourhoods. Demand is steady along the Ahmadpur and Yazman Road corridors.',
    marketNote:
      'DHA Bahawalpur leads the premium segment while Model Town and Satellite Town anchor established demand.',
    areas: [
      {
        slug: 'dha',
        name: 'DHA',
        subAreas: [
          { slug: 'sector-a', name: 'Sector A' },
          { slug: 'sector-b', name: 'Sector B' },
          { slug: 'sector-c', name: 'Sector C' },
        ],
      },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'noor-mahal-colony', name: 'Noor Mahal Colony' },
      { slug: 'yazman-road', name: 'Yazman Road' },
    ],
  },
  {
    slug: 'sargodha',
    name: 'Sargodha',
    province: 'Punjab',
    intro:
      'Sargodha, known for its citrus belt and air force base, has a property market quoted per marla with steady local demand. Satellite Town and Model Town City are the established residential anchors, while Citi Housing has added a modern gated option. The University Road corridor is a focus for new development.',
    marketNote:
      'Sargodha demand is led by Satellite Town, Model Town City and the newer Citi Housing scheme.',
    areas: [
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'model-town-city', name: 'Model Town City' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'university-road', name: 'University Road' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'old-civil-lines', name: 'Old Civil Lines' },
    ],
  },
  {
    slug: 'sheikhupura',
    name: 'Sheikhupura',
    province: 'Punjab',
    intro:
      'Sheikhupura sits on the Lahore industrial corridor, and its property prices are quoted per marla with demand supported by nearby factories and easy access to Lahore. Model Town and Civil Lines are the established residential areas, while the GT Road and Faisalabad Road frontages attract commercial interest. Proximity to Lahore keeps the market closely tied to the metro.',
    marketNote:
      'Sheikhupura demand is anchored by Model Town and Civil Lines, with commercial activity along GT Road.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'faisalabad-road', name: 'Faisalabad Road' },
      { slug: 'sharaqpur-road', name: 'Sharaqpur Road' },
    ],
  },
  {
    slug: 'jhang',
    name: 'Jhang',
    province: 'Punjab',
    intro:
      'Jhang, set near the confluence of the Chenab and Jhelum rivers, has a modest property market quoted per marla driven mainly by local end-users. Satellite Town and Civil Lines are the preferred residential areas, while the Faisalabad Road corridor sees gradual expansion. Agricultural earnings underpin most property purchases here.',
    marketNote:
      'Jhang property demand concentrates on Satellite Town and Civil Lines.',
    areas: [
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'faisalabad-road', name: 'Faisalabad Road' },
      { slug: 'gojra-road', name: 'Gojra Road' },
    ],
  },
  {
    slug: 'rahim-yar-khan',
    name: 'Rahim Yar Khan',
    province: 'Punjab',
    intro:
      'Rahim Yar Khan is southern Punjab\'s industrial and agricultural centre, with property quoted per marla and demand supported by sugar, cotton and a strong business community. Model Town and Satellite Town are the established neighbourhoods, while Garden City offers newer gated living. The Abbasia and Khanpur Road areas continue to grow.',
    marketNote:
      'Rahim Yar Khan demand is led by Model Town, Satellite Town and the Garden City scheme.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'garden-city', name: 'Garden City' },
      { slug: 'abbasia-town', name: 'Abbasia Town' },
      { slug: 'khanpur-road', name: 'Khanpur Road' },
    ],
  },
  {
    slug: 'gujrat',
    name: 'Gujrat',
    province: 'Punjab',
    intro:
      'Gujrat is famed for its furniture, ceramics and fan industries, and strong overseas remittances keep its property market quoted per marla buoyant. Citi Housing and the GT Road belt attract modern investment, while Satellite Town and Model Town hold established appeal. The Bhimber Road corridor is a steady area for residential growth.',
    marketNote:
      'Gujrat demand is supported by Citi Housing, Satellite Town and strong overseas remittance flows.',
    areas: [
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'bhimber-road', name: 'Bhimber Road' },
      { slug: 'rehman-shaheed-road', name: 'Rehman Shaheed Road' },
    ],
  },
  {
    slug: 'kasur',
    name: 'Kasur',
    province: 'Punjab',
    intro:
      'Kasur lies just south of Lahore, and its property market is quoted per marla with demand increasingly spilling over from the metro. Model Town and the Railway Road area are established residential choices, while the Lahore Road and Ferozepur Road corridors benefit from the city\'s proximity to Lahore. Tanning and agriculture remain key economic drivers.',
    marketNote:
      'Kasur demand is shaped by its proximity to Lahore, anchored on Model Town and the Lahore Road corridor.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'railway-road', name: 'Railway Road' },
      { slug: 'lahore-road', name: 'Lahore Road' },
      { slug: 'ferozepur-road', name: 'Ferozepur Road' },
    ],
  },
  {
    slug: 'sahiwal',
    name: 'Sahiwal',
    province: 'Punjab',
    intro:
      'Sahiwal is an agricultural town on the Lahore–Multan corridor, with property quoted per marla and demand fed by farming and trading income. Farid Town and the Stadium Road area are the established residential locales, while newer housing along the High Street and bypass continues to develop. Strong cotton and dairy economies underpin the local market.',
    marketNote:
      'Sahiwal demand centres on Farid Town and the established core near Stadium Road.',
    areas: [
      { slug: 'farid-town', name: 'Farid Town' },
      { slug: 'stadium-road', name: 'Stadium Road' },
      { slug: 'high-street', name: 'High Street' },
      { slug: 'jahanzeb-block', name: 'Jahanzeb Block' },
    ],
  },
  {
    slug: 'okara',
    name: 'Okara',
    province: 'Punjab',
    intro:
      'Okara is a farming district town on the Lahore–Multan road where property is quoted per marla and demand is driven by agriculture and military farms. Model Town and Cantt areas hold the established residential value, while the GT Road frontage sees commercial activity. The market remains primarily local and end-user led.',
    marketNote:
      'Okara property demand is concentrated in Model Town and the Cantt area.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'depalpur-road', name: 'Depalpur Road' },
    ],
  },
  {
    slug: 'wah-cantt',
    name: 'Wah Cantt',
    province: 'Punjab',
    intro:
      'Wah Cantt is a planned cantonment town near Taxila, and its property market is quoted per marla with demand shaped by the ordnance factories and a well-laid-out civilian sector. Lalazar and the numbered POF housing sectors are the established addresses, while areas near the GT Road draw additional interest. The orderly layout and amenities keep values stable.',
    marketNote:
      'Wah Cantt demand is led by Lalazar and the planned POF housing sectors.',
    areas: [
      { slug: 'lalazar', name: 'Lalazar' },
      { slug: 'gudwal', name: 'Gudwal' },
      { slug: 'pof-housing', name: 'POF Housing' },
      { slug: 'gt-road', name: 'GT Road' },
    ],
  },
  {
    slug: 'dera-ghazi-khan',
    name: 'Dera Ghazi Khan',
    province: 'Punjab',
    intro:
      'Dera Ghazi Khan sits on the western edge of Punjab near the tri-province boundary, with property quoted per marla and demand supported by its regional administrative role. Block 18 and Block 20 of the planned city are the recognised residential blocks, while the Jampur Road corridor sees gradual growth. The market is largely local and end-user driven.',
    marketNote:
      'Dera Ghazi Khan demand centres on the planned residential blocks of the new city.',
    areas: [
      { slug: 'block-18', name: 'Block 18' },
      { slug: 'block-20', name: 'Block 20' },
      { slug: 'jampur-road', name: 'Jampur Road' },
      { slug: 'cantt', name: 'Cantt' },
    ],
  },
  {
    slug: 'jhelum',
    name: 'Jhelum',
    province: 'Punjab',
    intro:
      'Jhelum has a strong military and overseas connection that keeps its property market, quoted per marla, well supported. Civil Lines and the Cantt area are the established residential choices, while the GT Road corridor anchors commercial activity. Remittances from a large diaspora help sustain plot values.',
    marketNote:
      'Jhelum demand is anchored by Civil Lines and the Cantt area, backed by overseas remittances.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'machine-mohallah', name: 'Machine Mohallah' },
    ],
  },
  {
    slug: 'chiniot',
    name: 'Chiniot',
    province: 'Punjab',
    intro:
      'Chiniot is renowned for its woodwork and furniture craftsmanship, and its property market is quoted per marla with demand driven by local industry. The Civil Lines and Sargodha Road areas are the established residential locales. The market stays compact and mostly end-user led.',
    marketNote:
      'Chiniot property demand is concentrated in Civil Lines and along Sargodha Road.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'sargodha-road', name: 'Sargodha Road' },
      { slug: 'rajoa-road', name: 'Rajoa Road' },
    ],
  },
  {
    slug: 'khanewal',
    name: 'Khanewal',
    province: 'Punjab',
    intro:
      'Khanewal is a railway junction and cotton-trading town in southern Punjab, with property quoted per marla and demand led by agriculture and trade. Model Town and Officers Colony are the established residential areas, while the Multan Road corridor sees commercial growth. The local market is steady and end-user driven.',
    marketNote:
      'Khanewal demand centres on Model Town and Officers Colony.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'officers-colony', name: 'Officers Colony' },
      { slug: 'multan-road', name: 'Multan Road' },
    ],
  },
  {
    slug: 'hafizabad',
    name: 'Hafizabad',
    province: 'Punjab',
    intro:
      'Hafizabad is a rice-trading town between Lahore and Gujranwala where property is quoted per marla and demand is led by agriculture. Satellite Town and the Jail Road area are the established residential choices, while the GT Road frontage attracts commercial buyers. The market remains primarily local.',
    marketNote:
      'Hafizabad property demand is concentrated in Satellite Town and along the GT Road.',
    areas: [
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'jail-road', name: 'Jail Road' },
      { slug: 'gt-road', name: 'GT Road' },
    ],
  },
  {
    slug: 'mandi-bahauddin',
    name: 'Mandi Bahauddin',
    province: 'Punjab',
    intro:
      'Mandi Bahauddin is an agricultural district town with strong overseas links, keeping its property market quoted per marla active. Civil Lines and the Government Colony area are the established residential locales. Remittances from a sizeable diaspora support local plot prices.',
    marketNote:
      'Mandi Bahauddin demand is anchored by Civil Lines and supported by overseas remittances.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'government-colony', name: 'Government Colony' },
      { slug: 'rasul-road', name: 'Rasul Road' },
    ],
  },
  {
    slug: 'attock',
    name: 'Attock',
    province: 'Punjab',
    intro:
      'Attock sits at the Punjab–KPK boundary on the Indus River, and its property market is quoted per marla with demand shaped by its strategic location and cantonment. Civil Lines and the Cantt area are the established residential choices, while the GT Road corridor anchors commerce. The market is steady and mostly local.',
    marketNote:
      'Attock property demand centres on Civil Lines and the Cantt area.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'gt-road', name: 'GT Road' },
    ],
  },
  {
    slug: 'chakwal',
    name: 'Chakwal',
    province: 'Punjab',
    intro:
      'Chakwal sits in the Potohar plateau with strong military and overseas connections that support a property market quoted per marla. Civil Lines and the Talagang Road area are the established residential locales. Remittances and serving-officer demand keep plot values resilient.',
    marketNote:
      'Chakwal demand is anchored by Civil Lines and backed by overseas and military remittances.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'talagang-road', name: 'Talagang Road' },
      { slug: 'pindi-road', name: 'Pindi Road' },
    ],
  },
  {
    slug: 'vehari',
    name: 'Vehari',
    province: 'Punjab',
    intro:
      'Vehari is a cotton-belt town in southern Punjab where property is quoted per marla and demand is driven by agriculture. Model Town and the Multan Road area are the established residential choices. The market remains compact and end-user led.',
    marketNote:
      'Vehari property demand concentrates on Model Town and the Multan Road corridor.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'multan-road', name: 'Multan Road' },
      { slug: 'luddan-road', name: 'Luddan Road' },
    ],
  },
  {
    slug: 'toba-tek-singh',
    name: 'Toba Tek Singh',
    province: 'Punjab',
    intro:
      'Toba Tek Singh is an agricultural district town in central Punjab with a property market quoted per marla and led by farming income. The Civil Lines and Gojra Road areas are the recognised residential locales. The market is steady and primarily local.',
    marketNote:
      'Toba Tek Singh demand is concentrated in Civil Lines and along Gojra Road.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'gojra-road', name: 'Gojra Road' },
      { slug: 'rajana-road', name: 'Rajana Road' },
    ],
  },
  {
    slug: 'kamoke',
    name: 'Kamoke',
    province: 'Punjab',
    intro:
      'Kamoke is a rice-trading town on the GT Road between Lahore and Gujranwala, with property quoted per marla and demand boosted by its location on the main corridor. Model Town and the GT Road frontage are the key residential and commercial areas. Proximity to Gujranwala and Lahore supports steady activity.',
    marketNote:
      'Kamoke property demand is led by Model Town and the GT Road corridor.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'eminabad-road', name: 'Eminabad Road' },
    ],
  },
  {
    slug: 'muridke',
    name: 'Muridke',
    province: 'Punjab',
    intro:
      'Muridke lies on the GT Road between Lahore and Gujranwala, and its property market is quoted per marla with demand supported by industry and its position near Lahore. The Model Town and GT Road areas anchor residential and commercial activity. The market benefits from spillover from the Lahore metro.',
    marketNote:
      'Muridke property demand is concentrated along the GT Road and in Model Town.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'sheikhupura-road', name: 'Sheikhupura Road' },
    ],
  },
  {
    slug: 'daska',
    name: 'Daska',
    province: 'Punjab',
    intro:
      'Daska sits between Sialkot and Gujranwala in an industrial belt, with property quoted per marla and demand fed by light manufacturing and remittances. The Model Town and Sialkot Road areas are the established locales. The market is largely local with steady end-user interest.',
    marketNote:
      'Daska property demand centres on Model Town and the Sialkot Road corridor.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'sialkot-road', name: 'Sialkot Road' },
      { slug: 'gujranwala-road', name: 'Gujranwala Road' },
    ],
  },
  {
    slug: 'gojra',
    name: 'Gojra',
    province: 'Punjab',
    intro:
      'Gojra is an agricultural town in the Toba Tek Singh district where property is quoted per marla and demand is driven by farming. The Civil Lines and Samundri Road areas are the recognised residential locales. The market remains compact and end-user led.',
    marketNote:
      'Gojra property demand is concentrated in Civil Lines and along Samundri Road.',
    areas: [
      { slug: 'civil-lines', name: 'Civil Lines' },
      { slug: 'samundri-road', name: 'Samundri Road' },
      { slug: 'jhang-road', name: 'Jhang Road' },
    ],
  },
  {
    slug: 'burewala',
    name: 'Burewala',
    province: 'Punjab',
    intro:
      'Burewala is a cotton and textile town in the Vehari district, with property quoted per marla and demand led by agriculture and ginning industry. The Model Town and Multan Road areas are the established residential locales. The market is steady and primarily local.',
    marketNote:
      'Burewala property demand concentrates on Model Town and the Multan Road corridor.',
    areas: [
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'multan-road', name: 'Multan Road' },
      { slug: 'college-road', name: 'College Road' },
    ],
  },
]

export default cities
