import type { City } from './types'

const cities: City[] = [
  {
    slug: 'karachi',
    name: 'Karachi',
    province: 'Sindh',
    intro:
      'Karachi is Pakistan\'s largest city and commercial capital, with a sprawling property market where residential plots are measured in square yards (gaz) and high-rise apartment living is part of everyday life. From the seafront towers of Clifton to the gated phases of DHA and the dense blocks of Gulshan-e-Iqbal, the city offers everything from luxury beachfront flats to affordable suburban housing schemes. Demand here is driven by a population of more than sixteen million and a steady inflow of buyers from across the country.',
    marketNote:
      'Karachi blends premium coastal addresses with mass-market apartment blocks, making it Pakistan\'s most diverse real-estate market.',
    areas: [
      {
        slug: 'dha',
        name: 'DHA Karachi',
        subAreas: [
          { slug: 'phase-1', name: 'Phase 1' },
          { slug: 'phase-2', name: 'Phase 2' },
          { slug: 'phase-3', name: 'Phase 3' },
          { slug: 'phase-4', name: 'Phase 4' },
          { slug: 'phase-5', name: 'Phase 5' },
          { slug: 'phase-6', name: 'Phase 6' },
          { slug: 'phase-7', name: 'Phase 7' },
          { slug: 'phase-8', name: 'Phase 8' },
          { slug: 'dha-city', name: 'DHA City' },
        ],
      },
      {
        slug: 'clifton',
        name: 'Clifton',
        subAreas: [
          { slug: 'block-1', name: 'Block 1' },
          { slug: 'block-2', name: 'Block 2' },
          { slug: 'block-3', name: 'Block 3' },
          { slug: 'block-4', name: 'Block 4' },
          { slug: 'block-5', name: 'Block 5' },
          { slug: 'block-7', name: 'Block 7' },
          { slug: 'block-8', name: 'Block 8' },
          { slug: 'block-9', name: 'Block 9' },
        ],
      },
      {
        slug: 'gulshan-e-iqbal',
        name: 'Gulshan-e-Iqbal',
        subAreas: [
          { slug: 'block-1', name: 'Block 1' },
          { slug: 'block-2', name: 'Block 2' },
          { slug: 'block-3', name: 'Block 3' },
          { slug: 'block-4', name: 'Block 4' },
          { slug: 'block-5', name: 'Block 5' },
          { slug: 'block-6', name: 'Block 6' },
          { slug: 'block-7', name: 'Block 7' },
          { slug: 'block-10', name: 'Block 10' },
          { slug: 'block-11', name: 'Block 11' },
          { slug: 'block-13', name: 'Block 13' },
        ],
      },
      {
        slug: 'gulistan-e-jauhar',
        name: 'Gulistan-e-Jauhar',
        subAreas: [
          { slug: 'block-1', name: 'Block 1' },
          { slug: 'block-2', name: 'Block 2' },
          { slug: 'block-3', name: 'Block 3' },
          { slug: 'block-4', name: 'Block 4' },
          { slug: 'block-7', name: 'Block 7' },
          { slug: 'block-11', name: 'Block 11' },
          { slug: 'block-12', name: 'Block 12' },
          { slug: 'block-13', name: 'Block 13' },
          { slug: 'block-15', name: 'Block 15' },
          { slug: 'block-16', name: 'Block 16' },
          { slug: 'block-17', name: 'Block 17' },
          { slug: 'block-18', name: 'Block 18' },
          { slug: 'block-19', name: 'Block 19' },
        ],
      },
      {
        slug: 'north-nazimabad',
        name: 'North Nazimabad',
        subAreas: [
          { slug: 'block-a', name: 'Block A' },
          { slug: 'block-b', name: 'Block B' },
          { slug: 'block-c', name: 'Block C' },
          { slug: 'block-d', name: 'Block D' },
          { slug: 'block-f', name: 'Block F' },
          { slug: 'block-g', name: 'Block G' },
          { slug: 'block-h', name: 'Block H' },
          { slug: 'block-i', name: 'Block I' },
          { slug: 'block-j', name: 'Block J' },
          { slug: 'block-k', name: 'Block K' },
          { slug: 'block-l', name: 'Block L' },
          { slug: 'block-m', name: 'Block M' },
          { slug: 'block-n', name: 'Block N' },
        ],
      },
      {
        slug: 'federal-b-area',
        name: 'Federal B Area',
        subAreas: [
          { slug: 'block-1', name: 'Block 1' },
          { slug: 'block-7', name: 'Block 7' },
          { slug: 'block-10', name: 'Block 10' },
          { slug: 'block-16', name: 'Block 16' },
          { slug: 'block-18', name: 'Block 18' },
          { slug: 'block-20', name: 'Block 20' },
        ],
      },
      {
        slug: 'north-karachi',
        name: 'North Karachi',
      },
      {
        slug: 'scheme-33',
        name: 'Scheme 33',
      },
      {
        slug: 'malir',
        name: 'Malir',
      },
      {
        slug: 'korangi',
        name: 'Korangi',
      },
      {
        slug: 'landhi',
        name: 'Landhi',
      },
      {
        slug: 'pechs',
        name: 'PECHS',
        subAreas: [
          { slug: 'block-2', name: 'Block 2' },
          { slug: 'block-3', name: 'Block 3' },
          { slug: 'block-6', name: 'Block 6' },
        ],
      },
      {
        slug: 'bahadurabad',
        name: 'Bahadurabad',
      },
      {
        slug: 'nazimabad',
        name: 'Nazimabad',
      },
      {
        slug: 'saddar',
        name: 'Saddar',
      },
      {
        slug: 'bath-island',
        name: 'Bath Island',
      },
      {
        slug: 'defence-view',
        name: 'Defence View',
      },
      {
        slug: 'gulshan-e-maymar',
        name: 'Gulshan-e-Maymar',
      },
      {
        slug: 'surjani-town',
        name: 'Surjani Town',
      },
      {
        slug: 'port-qasim',
        name: 'Port Qasim',
      },
      {
        slug: 'site-area',
        name: 'SITE Area',
      },
      {
        slug: 'shahrah-e-faisal',
        name: 'Shahrah-e-Faisal',
      },
      {
        slug: 'tariq-road',
        name: 'Tariq Road',
      },
    ],
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    province: 'Sindh',
    intro:
      'Hyderabad is the second-largest city of Sindh and a historic trading hub on the banks of the Indus. Its property market spans the planned units of Latifabad, the upscale developments of Qasimabad and the older bazaar districts near the city centre. Steady growth along the Karachi corridor keeps demand firm for both plots and built houses.',
    marketNote:
      'Hyderabad offers more affordable plots and houses than Karachi while remaining within easy reach of the metropolis.',
    areas: [
      {
        slug: 'qasimabad',
        name: 'Qasimabad',
      },
      {
        slug: 'latifabad',
        name: 'Latifabad',
        subAreas: [
          { slug: 'unit-1', name: 'Unit 1' },
          { slug: 'unit-2', name: 'Unit 2' },
          { slug: 'unit-3', name: 'Unit 3' },
          { slug: 'unit-4', name: 'Unit 4' },
          { slug: 'unit-5', name: 'Unit 5' },
          { slug: 'unit-6', name: 'Unit 6' },
          { slug: 'unit-7', name: 'Unit 7' },
          { slug: 'unit-8', name: 'Unit 8' },
          { slug: 'unit-9', name: 'Unit 9' },
          { slug: 'unit-10', name: 'Unit 10' },
          { slug: 'unit-11', name: 'Unit 11' },
          { slug: 'unit-12', name: 'Unit 12' },
        ],
      },
      {
        slug: 'auto-bhan-road',
        name: 'Auto Bhan Road',
      },
      {
        slug: 'hirabad',
        name: 'Hirabad',
      },
      {
        slug: 'citizen-colony',
        name: 'Citizen Colony',
      },
      {
        slug: 'wadhu-wah-road',
        name: 'Wadhu Wah Road',
      },
    ],
  },
  {
    slug: 'sukkur',
    name: 'Sukkur',
    province: 'Sindh',
    intro:
      'Sukkur sits on the Indus beside the famous Sukkur Barrage and serves as a key commercial gateway to upper Sindh. The local property market is anchored by established residential colonies and growing demand along the main arterial roads. Buyers are typically traders and families from the surrounding agricultural belt.',
    marketNote:
      'Sukkur\'s housing demand is closely tied to its role as a regional trade and transport centre for northern Sindh.',
    areas: [
      { slug: 'military-road', name: 'Military Road' },
      { slug: 'minara-road', name: 'Minara Road' },
      { slug: 'shikarpur-road', name: 'Shikarpur Road' },
      { slug: 'barrage-colony', name: 'Barrage Colony' },
      { slug: 'new-pind', name: 'New Pind' },
      { slug: 'sindhi-muslim-society', name: 'Sindhi Muslim Cooperative Housing Society' },
    ],
  },
  {
    slug: 'larkana',
    name: 'Larkana',
    province: 'Sindh',
    intro:
      'Larkana is a historic city of upper Sindh, known nationally as the home district of the Bhutto family and as the gateway to the Mohenjo-daro ruins. Its property market centres on the older residential mohallas and the newer colonies expanding along the city\'s main roads. Demand is driven mainly by local families and government employees.',
    marketNote:
      'Larkana\'s market is dominated by end-user purchases of plots and houses rather than speculative investment.',
    areas: [
      { slug: 'jinnah-bagh', name: 'Jinnah Bagh' },
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'bakrani-road', name: 'Bakrani Road' },
      { slug: 'vip-road', name: 'VIP Road' },
      { slug: 'rashidabad', name: 'Rashidabad' },
    ],
  },
  {
    slug: 'nawabshah',
    name: 'Nawabshah (Shaheed Benazirabad)',
    province: 'Sindh',
    intro:
      'Nawabshah, officially Shaheed Benazirabad, is a central Sindh city set amid one of the province\'s most productive cotton and sugarcane belts. Its property market revolves around compact residential colonies and plots near the railway and university quarters. The presence of a major airport and educational institutions sustains a modest but steady demand.',
    marketNote:
      'Nawabshah benefits from agricultural wealth and an upgraded airport that underpin local property values.',
    areas: [
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'housing-society', name: 'Housing Society' },
      { slug: 'sakrand-road', name: 'Sakrand Road' },
      { slug: 'masjid-road', name: 'Masjid Road' },
      { slug: 'police-line', name: 'Police Line Area' },
    ],
  },
  {
    slug: 'mirpur-khas',
    name: 'Mirpur Khas',
    province: 'Sindh',
    intro:
      'Mirpur Khas is the principal city of south-eastern Sindh and a celebrated centre of mango cultivation. Its real-estate activity is concentrated in the planned colonies and the commercial streets radiating from the city centre. Local agricultural prosperity feeds steady, end-user-led property demand.',
    marketNote:
      'Mirpur Khas property demand follows the fortunes of its surrounding mango and sugarcane farms.',
    areas: [
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'kacha-jail-road', name: 'Kacha Jail Road' },
      { slug: 'umerkot-road', name: 'Umerkot Road' },
      { slug: 'tando-jam-road', name: 'Tando Jam Road' },
      { slug: 'city-survey', name: 'City Survey' },
    ],
  },
  {
    slug: 'jacobabad',
    name: 'Jacobabad',
    province: 'Sindh',
    intro:
      'Jacobabad lies at the northern edge of Sindh near the Balochistan border and is known for its extreme summer heat. The property market is small and locally driven, focused on established residential quarters and plots along the main roads. Most transactions involve resident families and traders rather than outside investors.',
    marketNote:
      'Jacobabad is a compact, end-user market shaped by its position as a border and railway junction town.',
    areas: [
      { slug: 'thul-road', name: 'Thul Road' },
      { slug: 'quetta-road', name: 'Quetta Road' },
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'mohalla-faiz-muhammad', name: 'Mohalla Faiz Muhammad' },
    ],
  },
  {
    slug: 'shikarpur',
    name: 'Shikarpur',
    province: 'Sindh',
    intro:
      'Shikarpur is one of Sindh\'s oldest commercial towns, once a major node on the trade route to Central Asia and famous for its covered bazaar. Its property market is rooted in the historic mohallas and the colonies that have grown along its connecting roads. Demand is largely local and tied to the town\'s trading heritage.',
    marketNote:
      'Shikarpur\'s real estate reflects its legacy as a historic Sindhi merchant town with a dense old quarter.',
    areas: [
      { slug: 'lakhi-dar', name: 'Lakhi Dar' },
      { slug: 'hathi-dar', name: 'Hathi Dar' },
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'sukkur-road', name: 'Sukkur Road' },
    ],
  },
  {
    slug: 'khairpur',
    name: 'Khairpur',
    province: 'Sindh',
    intro:
      'Khairpur is a former princely state and now a thriving district headquarters in central Sindh, well known for its date palms and Shah Abdul Latif University. Property demand is supported by the student population and the city\'s administrative role. Activity centres on residential colonies and plots near the university and main roads.',
    marketNote:
      'Khairpur\'s university and date trade give it a steadier housing demand than many neighbouring towns.',
    areas: [
      { slug: 'society-area', name: 'Society Area' },
      { slug: 'kotri-road', name: 'Kotri Kabir Road' },
      { slug: 'thari-mirwah-road', name: 'Thari Mirwah Road' },
      { slug: 'luqman-colony', name: 'Luqman Colony' },
    ],
  },
  {
    slug: 'dadu',
    name: 'Dadu',
    province: 'Sindh',
    intro:
      'Dadu is a district town in west-central Sindh, set between the Indus and the Kirthar range. Its property market is modest and locally oriented, focused on residential plots and houses in the established neighbourhoods. Buyers are mostly local families, farmers and government staff.',
    marketNote:
      'Dadu\'s housing market is small and end-user driven, anchored by agriculture and district administration.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
      { slug: 'sehwan-road', name: 'Sehwan Road' },
      { slug: 'hospital-road', name: 'Hospital Road' },
    ],
  },
  {
    slug: 'thatta',
    name: 'Thatta',
    province: 'Sindh',
    intro:
      'Thatta is an ancient town in southern Sindh, celebrated for the Shah Jahan Mosque and the Makli necropolis, a UNESCO World Heritage site. Its property market is small, comprising residential quarters and plots near the National Highway and Keenjhar Lake. Proximity to Karachi gives the area some recreational and investment appeal.',
    marketNote:
      'Thatta\'s heritage sites and nearby Keenjhar Lake lend it modest tourism and weekend-home interest.',
    areas: [
      { slug: 'makli', name: 'Makli' },
      { slug: 'national-highway', name: 'National Highway' },
      { slug: 'sakro-road', name: 'Sakro Road' },
      { slug: 'gharo', name: 'Gharo' },
    ],
  },
  {
    slug: 'badin',
    name: 'Badin',
    province: 'Sindh',
    intro:
      'Badin is a coastal district town in south-eastern Sindh, surrounded by rice fields, sugar mills and the Indus delta. The property market is limited and locally driven, with plots and houses concentrated in the central colonies. Most demand comes from resident families and the agricultural and gas-sector workforce.',
    marketNote:
      'Badin\'s economy of rice, sugar and oil-and-gas operations underpins its small local property market.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'tando-bago-road', name: 'Tando Bago Road' },
      { slug: 'matli-road', name: 'Matli Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
    ],
  },
  {
    slug: 'tando-adam',
    name: 'Tando Adam',
    province: 'Sindh',
    intro:
      'Tando Adam is a busy commercial and industrial town in Sanghar district, known for its cotton ginning and textile trade. Its property market is shaped by local merchants and mill owners, with activity in the residential mohallas and roadside plots. Demand is steady but largely confined to resident buyers.',
    marketNote:
      'Tando Adam\'s cotton and textile trade gives it a more commercial flavour than its district neighbours.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'hyderabad-road', name: 'Hyderabad Road' },
      { slug: 'shahi-bazaar', name: 'Shahi Bazaar' },
    ],
  },
  {
    slug: 'tando-allahyar',
    name: 'Tando Allahyar',
    province: 'Sindh',
    intro:
      'Tando Allahyar is a district headquarters in lower Sindh, set in a rich agricultural belt of bananas, mangoes and chillies. The property market is compact, focused on residential plots and houses in the town\'s established areas. Local farming wealth supports modest, end-user-led demand.',
    marketNote:
      'Tando Allahyar\'s fertile farmland and chilli trade sustain a small but stable housing market.',
    areas: [
      { slug: 'main-road', name: 'Main Road' },
      { slug: 'jhando-mari-road', name: 'Jhando Mari Road' },
      { slug: 'nasarpur-road', name: 'Nasarpur Road' },
    ],
  },
  {
    slug: 'umerkot',
    name: 'Umerkot',
    province: 'Sindh',
    intro:
      'Umerkot is a historic desert town on the edge of the Thar, known as the birthplace of the Mughal emperor Akbar and home to a notable fort. Its property market is small and locally driven, with plots and houses around the town centre and main roads. Demand comes mainly from resident families and traders serving the surrounding Thar region.',
    marketNote:
      'Umerkot\'s position as a gateway to the Thar desert shapes its modest, locally oriented property market.',
    areas: [
      { slug: 'fort-road', name: 'Fort Road' },
      { slug: 'mirpur-khas-road', name: 'Mirpur Khas Road' },
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'kunri-road', name: 'Kunri Road' },
    ],
  },
  {
    slug: 'ghotki',
    name: 'Ghotki',
    province: 'Sindh',
    intro:
      'Ghotki is a district town in the far north-east of Sindh, set in an area rich in natural gas fields and farmland. Its property market is small and end-user focused, centred on residential colonies and plots near the National Highway. Local agriculture and the energy sector provide the main support for demand.',
    marketNote:
      'Ghotki\'s gas fields and fertile farmland give it a quietly stable local housing market.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'national-highway', name: 'National Highway' },
      { slug: 'mehrabpur-road', name: 'Mehrabpur Road' },
    ],
  },
  {
    slug: 'sanghar',
    name: 'Sanghar',
    province: 'Sindh',
    intro:
      'Sanghar is a district headquarters in central Sindh, surrounded by extensive cotton fields and the fringes of the Thar desert. The property market is modest, with residential plots and houses concentrated in the town\'s main colonies. Demand is largely local, tied to agriculture and district administration.',
    marketNote:
      'Sanghar\'s cotton economy and district role anchor a small, end-user-driven property market.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'shahdadpur-road', name: 'Shahdadpur Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
    ],
  },
  {
    slug: 'kandhkot',
    name: 'Kandhkot',
    province: 'Sindh',
    intro:
      'Kandhkot is a town in Kashmore district at the northern tip of Sindh, close to the borders of Punjab and Balochistan. It is best known for the large Kandhkot gas field that supports the local economy. The property market is small and locally driven, focused on residential plots and houses near the town centre.',
    marketNote:
      'Kandhkot\'s gas field and border-junction location underpin its compact local housing market.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'guddu-road', name: 'Guddu Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
    ],
  },
  {
    slug: 'quetta',
    name: 'Quetta',
    province: 'Balochistan',
    intro:
      'Quetta is the capital of Balochistan and the province\'s largest city, set in a high valley ringed by mountains and famed for its orchards. Its property market ranges from the established cantonment and Jinnah Town addresses to newer housing schemes spreading along Airport and Samungli roads. Demand is driven by government, trade and a growing professional class.',
    marketNote:
      'Quetta is Balochistan\'s premier property market, balancing established cantonment areas with fast-growing planned schemes.',
    areas: [
      { slug: 'jinnah-town', name: 'Jinnah Town' },
      { slug: 'samungli-road', name: 'Samungli Road' },
      { slug: 'chiltan-housing-scheme', name: 'Chiltan Housing Scheme' },
      { slug: 'airport-road', name: 'Airport Road' },
      { slug: 'zarghoon-road', name: 'Zarghoon Road' },
      { slug: 'sariab-road', name: 'Sariab Road' },
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'brewery-road', name: 'Brewery Road' },
      { slug: 'shahbaz-town', name: 'Shahbaz Town' },
    ],
  },
  {
    slug: 'gwadar',
    name: 'Gwadar',
    province: 'Balochistan',
    intro:
      'Gwadar is a deep-sea port city on the Arabian Sea coast and the centrepiece of the China-Pakistan Economic Corridor (CPEC). Its property market has drawn nationwide investor attention, with planned developments such as New Town, Marine Drive and Sangar Housing marketed heavily for long-term capital growth. Buyers here are predominantly investors betting on the city\'s emergence as a regional trade hub.',
    marketNote:
      'Gwadar is Pakistan\'s most investment-driven coastal market, with values tied closely to CPEC and port development.',
    areas: [
      { slug: 'new-town', name: 'New Town' },
      { slug: 'marine-drive', name: 'Marine Drive' },
      { slug: 'sangar-housing', name: 'Sangar Housing' },
      { slug: 'single-road', name: 'Single Road' },
    ],
  },
  {
    slug: 'turbat',
    name: 'Turbat',
    province: 'Balochistan',
    intro:
      'Turbat is the principal city of the Makran region in southern Balochistan and a fast-growing administrative and educational centre. Its property market is expanding around the university and the colonies along the main roads. Demand is mostly local, driven by students, professionals and the area\'s date-farming economy.',
    marketNote:
      'Turbat\'s growth as a Makran education and trade hub steadily lifts demand for plots and houses.',
    areas: [
      { slug: 'absor', name: 'Absor' },
      { slug: 'airport-road', name: 'Airport Road' },
      { slug: 'shahi-tump', name: 'Shahi Tump' },
      { slug: 'university-road', name: 'University Road' },
    ],
  },
  {
    slug: 'khuzdar',
    name: 'Khuzdar',
    province: 'Balochistan',
    intro:
      'Khuzdar is a major town in central Balochistan and an important junction on the route between Quetta and Karachi. Its property market is modest, focused on residential colonies and plots near the main highway and university. Demand is largely local, supported by trade, mining and education.',
    marketNote:
      'Khuzdar\'s position on the Quetta-Karachi highway gives it a quietly steady local property market.',
    areas: [
      { slug: 'wadh-road', name: 'Wadh Road' },
      { slug: 'zero-point', name: 'Zero Point' },
      { slug: 'university-road', name: 'University Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
    ],
  },
  {
    slug: 'hub',
    name: 'Hub',
    province: 'Balochistan',
    intro:
      'Hub is an industrial town in Lasbela district, sitting just across the provincial boundary from Karachi. Its proximity to the metropolis and its large industrial estate make it an important manufacturing and logistics centre. The property market reflects this, with demand for both residential plots and industrial land.',
    marketNote:
      'Hub\'s industrial estate and closeness to Karachi drive demand for residential and industrial property alike.',
    areas: [
      { slug: 'hub-chowki', name: 'Hub Chowki' },
      { slug: 'rcd-highway', name: 'RCD Highway' },
      { slug: 'industrial-estate', name: 'Industrial Estate' },
      { slug: 'gadani-road', name: 'Gadani Road' },
    ],
  },
  {
    slug: 'chaman',
    name: 'Chaman',
    province: 'Balochistan',
    intro:
      'Chaman is a border town in north-western Balochistan and the main crossing point into Afghanistan via the Friendship Gate. Its economy and property market revolve around cross-border trade, with demand concentrated in the bazaar quarters and roadside plots. Activity is largely local and trade-driven.',
    marketNote:
      'Chaman\'s property market is shaped almost entirely by its role as a major Pak-Afghan trade gateway.',
    areas: [
      { slug: 'mall-road', name: 'Mall Road' },
      { slug: 'taj-road', name: 'Taj Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
    ],
  },
  {
    slug: 'sibi',
    name: 'Sibi',
    province: 'Balochistan',
    intro:
      'Sibi is a historic town in eastern Balochistan, famous for its annual Sibi Mela and for recording some of the highest temperatures in Pakistan. Its property market is small and locally driven, with plots and houses around the town centre and railway quarters. Demand comes mostly from resident families and government employees.',
    marketNote:
      'Sibi\'s role as a regional administrative and railway centre underpins its modest local housing market.',
    areas: [
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'quetta-road', name: 'Quetta Road' },
      { slug: 'jacobabad-road', name: 'Jacobabad Road' },
    ],
  },
  {
    slug: 'zhob',
    name: 'Zhob',
    province: 'Balochistan',
    intro:
      'Zhob is a town in the rugged north-eastern corner of Balochistan, set along the river of the same name near the Khyber Pakhtunkhwa border. Its property market is small and end-user oriented, focused on residential plots in the town centre and along the connecting highways. Demand is local, tied to administration, trade and the military presence.',
    marketNote:
      'Zhob\'s remote location keeps its property market compact and almost entirely end-user driven.',
    areas: [
      { slug: 'cantt', name: 'Cantt' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
      { slug: 'qila-saifullah-road', name: 'Qila Saifullah Road' },
    ],
  },
  {
    slug: 'loralai',
    name: 'Loralai',
    province: 'Balochistan',
    intro:
      'Loralai is a district town in north-eastern Balochistan, known for its apple and apricot orchards and its cooler upland climate. The property market is modest, with residential plots and houses concentrated around the town centre and main roads. Demand is largely local, supported by agriculture and district administration.',
    marketNote:
      'Loralai\'s orchard economy and district status sustain a small, steady local property market.',
    areas: [
      { slug: 'main-bazaar', name: 'Main Bazaar' },
      { slug: 'quetta-road', name: 'Quetta Road' },
      { slug: 'dera-ghazi-khan-road', name: 'Dera Ghazi Khan Road' },
    ],
  },
  {
    slug: 'dera-murad-jamali',
    name: 'Dera Murad Jamali',
    province: 'Balochistan',
    intro:
      'Dera Murad Jamali is the headquarters of Nasirabad district in eastern Balochistan, set in a canal-irrigated agricultural belt near the Sindh border. Its property market is small and locally driven, focused on residential plots and houses near the National Highway. Demand stems mainly from farming families and government staff.',
    marketNote:
      'Dera Murad Jamali\'s canal-irrigated farmland and district role anchor its compact housing market.',
    areas: [
      { slug: 'national-highway', name: 'National Highway' },
      { slug: 'station-road', name: 'Station Road' },
      { slug: 'main-bazaar', name: 'Main Bazaar' },
    ],
  },
]

export default cities
