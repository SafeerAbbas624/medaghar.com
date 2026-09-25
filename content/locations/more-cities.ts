import type { City } from './types'

/**
 * Cities added 2026-09-25 to cover every town on zameen.com's city list.
 * Areas and blocks are the ones zameen.com shows with active listings for each
 * town (busiest first). Towns Zameen barely covers are filled from
 * OpenStreetMap's named neighbourhoods (© OpenStreetMap contributors, ODbL).
 * Towns with neither have a city page only; sellers can still type an area.
 */
const cities: City[] = [
  {
    slug: 'barnala',
    name: 'Barnala',
    province: 'Azad Kashmir',
    intro:
      'Barnala is a tehsil town of Bhimber district in Azad Kashmir, close to the Punjab border. Many families have relatives overseas, supporting demand for houses and plots.',
    marketNote:
      'Barnala demand is supported by overseas families.',
    areas: [
      { slug: 'feroz-housing-scheme', name: 'Feroz Housing Scheme' },
    ],
  },
  {
    slug: 'pallandri',
    name: 'Pallandri',
    province: 'Azad Kashmir',
    intro:
      'Pallandri is the headquarters of Sudhnoti district in Azad Kashmir, set in green hills south of Rawalakot. Property is local, mostly houses and land.',
    marketNote:
      'Pallandri has a small, local market for houses and land.',
    areas: [],
  },
  {
    slug: 'gaddani',
    name: 'Gaddani',
    province: 'Balochistan',
    intro:
      'Gaddani is a coastal town in the Lasbela area west of Karachi, known for its ship-breaking yard and beaches. Its market includes land and commercial property tied to the yard.',
    marketNote:
      'Gaddani demand is tied to the ship-breaking industry and coastal land.',
    areas: [
      { slug: 'gaddani-road', name: 'Gaddani Road' },
    ],
  },
  {
    slug: 'kalat',
    name: 'Kalat',
    province: 'Balochistan',
    intro:
      'Kalat is a district headquarters in central Balochistan and the historic seat of the Khanate of Kalat. Property is local, mostly houses and land.',
    marketNote:
      'Kalat has a small, local property market.',
    areas: [],
  },
  {
    slug: 'winder',
    name: 'Winder',
    province: 'Balochistan',
    intro:
      'Winder is a town in the Lasbela area of Balochistan, on the coastal route west of Hub. Property is mostly land and houses traded locally.',
    marketNote:
      'Winder has a small, local market for land and houses.',
    areas: [],
  },
  {
    slug: 'astore',
    name: 'Astore',
    province: 'Gilgit-Baltistan',
    intro:
      'Astore is a district headquarters in Gilgit-Baltistan, in the valley leading to Nanga Parbat and the Deosai plains. Property interest includes guest houses and land for tourism alongside local houses.',
    marketNote:
      'Astore demand is local and tourism-related.',
    areas: [],
  },
  {
    slug: 'khaplu',
    name: 'Khaplu',
    province: 'Gilgit-Baltistan',
    intro:
      'Khaplu is the main town of Ghanche district in Baltistan, known for the restored Khaplu Palace. Tourism supports interest in guest houses and land.',
    marketNote:
      'Khaplu demand is linked to tourism and local housing.',
    areas: [
      { slug: 'khansar', name: 'Khansar' },
      { slug: 'kraming', name: 'Kraming' },
      { slug: 'gonmayar', name: 'Gonmayar' },
      { slug: 'thaskong', name: 'Thaskong' },
      { slug: 'gharis', name: 'Gharis' },
      { slug: 'gharalti', name: 'Gharalti' },
      { slug: 'morghoto', name: 'Morghoto' },
      { slug: 'hatchi', name: 'Hatchi' },
      { slug: 'garbuchung', name: 'Garbuchung' },
    ],
  },
  {
    slug: 'balakot',
    name: 'Balakot',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Balakot in Mansehra district is the gateway to the Kaghan valley and was rebuilt after the 2005 earthquake. Tourism drives interest in hotels, guest houses and land, alongside local houses.',
    marketNote:
      'Balakot demand is linked to Kaghan valley tourism.',
    areas: [],
  },
  {
    slug: 'battagram',
    name: 'Battagram',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Battagram is a district headquarters in the Hazara hills on the Karakoram Highway. Property is local, mostly houses and land.',
    marketNote:
      'Battagram has a small, local market for houses and land.',
    areas: [],
  },
  {
    slug: 'hangu',
    name: 'Hangu',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Hangu is a district headquarters in southern Khyber Pakhtunkhwa, west of Kohat. The market consists mainly of houses and plots traded locally.',
    marketNote:
      'Hangu property is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'kaghan',
    name: 'Kaghan',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Kaghan is a village in the Kaghan valley of Mansehra district, on the road to Naran and Babusar Pass. Property interest centres on hotels, guest houses and land for tourism.',
    marketNote:
      'Kaghan demand is driven by valley tourism.',
    areas: [],
  },
  {
    slug: 'karak',
    name: 'Karak',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Karak is a district headquarters in southern Khyber Pakhtunkhwa, where oil and gas fields have brought new activity. Houses and plots in town make up most of the market.',
    marketNote:
      'Karak demand is local, supported by the oil and gas sector.',
    areas: [],
  },
  {
    slug: 'lakki-marwat',
    name: 'Lakki Marwat',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Lakki Marwat is a district headquarters in southern Khyber Pakhtunkhwa, between Bannu and Dera Ismail Khan. Property is local, mostly houses and plots.',
    marketNote:
      'Lakki Marwat has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'landi-kotal',
    name: 'Landi Kotal',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Landi Kotal is the main town of the Khyber Pass, near the Afghan border in Khyber district. Its market is small and local, with houses, shops and land.',
    marketNote:
      'Landi Kotal property is local, with shops and houses on the main bazaar.',
    areas: [],
  },
  {
    slug: 'miran-shah',
    name: 'Miran Shah',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Miran Shah is the headquarters of North Waziristan district. Property is traded locally, mainly houses, shops and land.',
    marketNote:
      'Miran Shah has a small, local property market.',
    areas: [],
  },
  {
    slug: 'naran',
    name: 'Naran',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Naran is the main tourist town of the upper Kaghan valley, near Lake Saif-ul-Malook. Property here is dominated by hotels, guest houses and land for the summer tourist season.',
    marketNote:
      'Naran demand is almost entirely tourism: hotels, guest houses and land.',
    areas: [
      {
        slug: 'saiful-muluk-road',
        name: 'Saiful Muluk Road',
        subAreas: [
          { slug: 'mountain-village', name: 'Mountain Village' },
        ],
      },
    ],
  },
  {
    slug: 'parachinar',
    name: 'Parachinar',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Parachinar is the headquarters of Kurram district, in a valley near the Afghan border. Property is local, mostly houses and land.',
    marketNote:
      'Parachinar has a small, local market for houses and land.',
    areas: [],
  },
  {
    slug: 'shabqadar',
    name: 'Shabqadar',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Shabqadar is a tehsil town of Charsadda district north of Peshawar. Houses and plots in town make up most of the market.',
    marketNote:
      'Shabqadar demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'tank',
    name: 'Tank',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Tank is a district headquarters in southern Khyber Pakhtunkhwa, near the border with South Waziristan. Property is local and mostly houses and plots.',
    marketNote:
      'Tank has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'wana',
    name: 'Wana',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Wana is the headquarters of South Waziristan district. Its property market is small and local, with houses, shops and land.',
    marketNote:
      'Wana has a small, local property market.',
    areas: [],
  },
  {
    slug: 'abdul-hakim',
    name: 'Abdul Hakim',
    province: 'Punjab',
    intro:
      'Abdul Hakim is a market town in Khanewal district, sitting on the route between Lahore and Multan close to the M-4 motorway. Its economy runs on the surrounding farmland, and most property changes hands as residential plots and single-storey houses in the town\'s colonies.',
    marketNote:
      'Abdul Hakim demand is local: plots and family houses close to the main bazaar and motorway link.',
    areas: [],
  },
  {
    slug: 'ahmedpur-east',
    name: 'Ahmedpur East',
    province: 'Punjab',
    intro:
      'Ahmedpur East in Bahawalpur district is one of the oldest towns of the former Bahawalpur state, close to the Abbasi nawabs\' palaces at Dera Nawab Sahib. It serves a wide agricultural hinterland, and its property market is made up mainly of houses and plots in established town neighbourhoods.',
    marketNote:
      'Ahmedpur East buyers are mostly local families and landowners looking for houses near the city centre.',
    areas: [],
  },
  {
    slug: 'alipur',
    name: 'Alipur',
    province: 'Punjab',
    intro:
      'Alipur is a tehsil town of Muzaffargarh district in southern Punjab, near the meeting point of the Chenab and Indus rivers at Panjnad. It is a farming town, and property here is largely houses and plots sold between local families.',
    marketNote:
      'Alipur property is small-scale and local, centred on the town and its main roads.',
    areas: [],
  },
  {
    slug: 'arifwala',
    name: 'Arifwala',
    province: 'Punjab',
    intro:
      'Arifwala in Pakpattan district is a busy cotton and grain market town on the road between Sahiwal and Pakpattan. Steady agricultural income keeps demand for residential plots and houses in the town\'s newer colonies.',
    marketNote:
      'Arifwala demand concentrates on plots and houses in the town\'s housing colonies.',
    areas: [],
  },
  {
    slug: 'bahawalnagar',
    name: 'Bahawalnagar',
    province: 'Punjab',
    intro:
      'Bahawalnagar is a district headquarters in the south-east of Punjab, near the Indian border and irrigated by the Sutlej canals. Its property market is driven by families from the surrounding agricultural district, with houses and plots in the city\'s established areas.',
    marketNote:
      'Bahawalnagar buyers look mainly for family houses and plots in and around the city centre.',
    areas: [
      { slug: 'dc-office-road', name: 'DC Office Road' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'chishtian-road', name: 'Chishtian Road' },
    ],
  },
  {
    slug: 'bhakkar',
    name: 'Bhakkar',
    province: 'Punjab',
    intro:
      'Bhakkar is a district headquarters in the Thal region on the east bank of the Indus, known for its chickpea and wheat farming. Property is mostly residential plots and houses in the city and its expanding housing schemes.',
    marketNote:
      'Bhakkar property is local, with plots and houses the main types traded.',
    areas: [],
  },
  {
    slug: 'bhalwal',
    name: 'Bhalwal',
    province: 'Punjab',
    intro:
      'Bhalwal in Sargodha district sits in the heart of Punjab\'s citrus belt, where kinnow orchards and processing units anchor the economy. Demand is for houses and plots in town, often from orchard and trading families.',
    marketNote:
      'Bhalwal demand is driven by the local citrus trade and centres on houses and residential plots.',
    areas: [],
  },
  {
    slug: 'chichawatni',
    name: 'Chichawatni',
    province: 'Punjab',
    intro:
      'Chichawatni is a Sahiwal district town on the N-5 national highway, known for the large Chichawatni forest plantation nearby. Its property market is modest, dominated by houses and plots close to the highway and town centre.',
    marketNote:
      'Chichawatni buyers favour houses and plots with easy access to the N-5.',
    areas: [],
  },
  {
    slug: 'chishtian',
    name: 'Chishtian',
    province: 'Punjab',
    intro:
      'Chishtian in Bahawalnagar district is known for the shrine of Baba Tajuddin Chishti and for the sugar mills in its farming hinterland. Houses and residential plots in the town\'s colonies make up most of the market.',
    marketNote:
      'Chishtian demand is local, focused on houses and plots near the city centre.',
    areas: [
      { slug: 'qaderabad', name: 'Qaderabad' },
      { slug: 'nasirabad', name: 'Nasirabad' },
      { slug: 'canal-view-housing', name: 'Canal View Housing' },
    ],
  },
  {
    slug: 'choa-saidan-shah',
    name: 'Choa Saidan Shah',
    province: 'Punjab',
    intro:
      'Choa Saidan Shah is a small Salt Range town in Chakwal district, close to the historic Katas Raj temples. Property here is limited and mostly traded between local families, with land and houses on the surrounding hills.',
    marketNote:
      'Choa Saidan Shah has a small, local market for houses and land.',
    areas: [
      { slug: 'mohalla-samsot', name: 'Mohalla Samsot' },
      { slug: 'mohalla-sherazi', name: 'Mohalla Sherazi' },
    ],
  },
  {
    slug: 'chunian',
    name: 'Chunian',
    province: 'Punjab',
    intro:
      'Chunian is a tehsil town of Kasur district south-west of Lahore, with an industrial estate and a farming economy. Its closeness to Lahore brings some demand for plots, alongside local house sales.',
    marketNote:
      'Chunian demand mixes local house buyers with plot buyers priced out of Lahore.',
    areas: [
      { slug: 'changa-manga-chunian-road', name: 'Changa Manga Chunian Road' },
    ],
  },
  {
    slug: 'depalpur',
    name: 'Depalpur',
    province: 'Punjab',
    intro:
      'Depalpur in Okara district is one of the oldest towns in Punjab, standing near the Sutlej in a rich farming belt. The market is made up mainly of houses and plots bought by local families.',
    marketNote:
      'Depalpur property is local and centred on houses and residential plots.',
    areas: [
      { slug: 'gulshan-fareed-town', name: 'Gulshan Fareed Town' },
    ],
  },
  {
    slug: 'dijkot',
    name: 'Dijkot',
    province: 'Punjab',
    intro:
      'Dijkot is a town in Faisalabad district, set among the canal-irrigated farmland south-west of Faisalabad city. Property is mostly houses and plots sold within the local community.',
    marketNote:
      'Dijkot has a small, local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'dina',
    name: 'Dina',
    province: 'Punjab',
    intro:
      'Dina is a Jhelum district town on the GT Road near Mangla Dam, with strong links to overseas Pakistanis from Jhelum and Mirpur. Remittance money supports demand for houses and plots along the GT Road and in newer housing schemes.',
    marketNote:
      'Dina demand is supported by overseas families and centres on the GT Road corridor.',
    areas: [],
  },
  {
    slug: 'dinga',
    name: 'Dinga',
    province: 'Punjab',
    intro:
      'Dinga is a town in Gujrat district, part of a region with many families working abroad. Overseas remittances keep demand for houses and residential plots in the town and its outskirts.',
    marketNote:
      'Dinga buyers are often overseas families investing in houses and plots back home.',
    areas: [
      { slug: 'janichak', name: 'Janichak' },
    ],
  },
  {
    slug: 'duniya-pur',
    name: 'Duniya Pur',
    province: 'Punjab',
    intro:
      'Duniya Pur (Dunyapur) is a tehsil town of Lodhran district in southern Punjab, set in cotton-growing country between Multan and Bahawalpur. Most property traded is houses and plots in the town.',
    marketNote:
      'Duniya Pur property is local, mostly houses and residential plots.',
    areas: [
      { slug: 'qutabpur-road', name: 'Qutabpur Road' },
      { slug: 'gulshan-mehandi-housing-scheme', name: 'Gulshan Mehandi Housing Scheme' },
    ],
  },
  {
    slug: 'fateh-jang',
    name: 'Fateh Jang',
    province: 'Punjab',
    intro:
      'Fateh Jang is a tehsil town of Attock district, close to Islamabad International Airport and the motorway. Its position has brought new housing schemes and investor interest in plots, alongside the traditional town market.',
    marketNote:
      'Fateh Jang is watched by investors for plots in housing schemes near the new airport.',
    areas: [
      { slug: 'kohat-fateh-jang-road', name: 'Kohat - Fateh Jang Road' },
      { slug: 'kot-fateh-khan', name: 'Kot Fateh Khan' },
      { slug: 'qutbal', name: 'Qutbal' },
    ],
  },
  {
    slug: 'ghakhar',
    name: 'Ghakhar',
    province: 'Punjab',
    intro:
      'Ghakhar Mandi is a Gujranwala district town on the GT Road between Gujranwala and Wazirabad, with a long history as a grain market. Houses and plots along the GT Road corridor make up most of the market.',
    marketNote:
      'Ghakhar demand follows the GT Road, with houses and plots the main property types.',
    areas: [],
  },
  {
    slug: 'gujar-khan',
    name: 'Gujar Khan',
    province: 'Punjab',
    intro:
      'Gujar Khan is a Rawalpindi district town on the GT Road, well known for its large overseas community, particularly in the UK. Remittances fund steady demand for houses and plots, and new housing schemes have grown along the GT Road.',
    marketNote:
      'Gujar Khan demand is driven by overseas families and GT Road housing schemes.',
    areas: [
      {
        slug: 'new-metro-city',
        name: 'New Metro City',
        subAreas: [
          { slug: 'new-metro-city-sector-1', name: 'New Metro City Sector 1' },
        ],
      },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'islamabad-lahore-road', name: 'Islamabad - Lahore Road' },
      { slug: 'dhoke-amb', name: 'Dhoke Amb' },
    ],
  },
  {
    slug: 'harappa',
    name: 'Harappa',
    province: 'Punjab',
    intro:
      'Harappa in Sahiwal district is famous for the Indus Valley Civilisation site that gives it its name. It is a small town, and property is mostly houses and farmland traded locally.',
    marketNote:
      'Harappa has a small local market for houses and land.',
    areas: [
      { slug: 'harappa-road', name: 'Harappa Road' },
    ],
  },
  {
    slug: 'haroonabad',
    name: 'Haroonabad',
    province: 'Punjab',
    intro:
      'Haroonabad is a tehsil town of Bahawalnagar district on the edge of the Cholistan desert, serving an irrigated farming area. The market consists mainly of houses and residential plots.',
    marketNote:
      'Haroonabad property is local, centred on houses and plots in town.',
    areas: [
      { slug: 'haroonabad-bahawalnagar-road', name: 'Haroonabad Bahawalnagar Road' },
    ],
  },
  {
    slug: 'hasilpur',
    name: 'Hasilpur',
    province: 'Punjab',
    intro:
      'Hasilpur is a Bahawalpur district town on the Sutlej side of the district, known as a farming and trading centre. Buyers are mostly local families looking for houses and plots.',
    marketNote:
      'Hasilpur demand is local, with houses and plots the main types.',
    areas: [],
  },
  {
    slug: 'hassan-abdal',
    name: 'Hassan Abdal',
    province: 'Punjab',
    intro:
      'Hassan Abdal in Attock district is known for Gurdwara Panja Sahib and Cadet College Hasan Abdal, and sits where the GT Road meets the route north to Hazara. Its location near Taxila and Wah brings demand for houses and plots.',
    marketNote:
      'Hassan Abdal buyers value its GT Road and Hazara motorway links.',
    areas: [
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'khyber-city', name: 'Khyber City' },
    ],
  },
  {
    slug: 'haveli-lakha',
    name: 'Haveli Lakha',
    province: 'Punjab',
    intro:
      'Haveli Lakha is a town in Okara district near the Sutlej and the Indian border, set in a farming area. Most property is houses and plots sold locally.',
    marketNote:
      'Haveli Lakha has a small, local housing market.',
    areas: [],
  },
  {
    slug: 'hazro',
    name: 'Hazro',
    province: 'Punjab',
    intro:
      'Hazro is the main town of the Chhachh area in Attock district, with a large community of families living in the UK. Overseas money supports demand for houses and plots in the town.',
    marketNote:
      'Hazro demand is supported by overseas families, mainly for houses and plots.',
    areas: [],
  },
  {
    slug: 'hujra-shah-muqeem',
    name: 'Hujra Shah Muqeem',
    province: 'Punjab',
    intro:
      'Hujra Shah Muqeem is an Okara district town known for the shrine of Shah Muqeem. It is a farming town, and property is mostly houses and plots bought by local families.',
    marketNote:
      'Hujra Shah Muqeem property is local and small in scale.',
    areas: [
      { slug: 'muhallah-islam-pura', name: 'Muhallah Islam Pura' },
      { slug: 'wasti-abdullah', name: 'Wasti Abdullah' },
      { slug: 'mohallah-maqsood-alam-hujra', name: 'Mohallah Maqsood Alam Hujra' },
      { slug: 'old-city', name: 'Old City' },
    ],
  },
  {
    slug: 'jahanian',
    name: 'Jahanian',
    province: 'Punjab',
    intro:
      'Jahanian is a tehsil town of Khanewal district in the cotton belt of southern Punjab. Houses and residential plots near the town centre make up most of the market.',
    marketNote:
      'Jahanian demand centres on houses and plots in town.',
    areas: [
      { slug: 'siay-colony', name: 'Siay Colony' },
      { slug: 'housing-colony', name: 'Housing Colony' },
    ],
  },
  {
    slug: 'jalalpur-jattan',
    name: 'Jalalpur Jattan',
    province: 'Punjab',
    intro:
      'Jalalpur Jattan in Gujrat district is known for its textile and handloom tradition. Families with overseas earnings keep demand for houses and plots in town.',
    marketNote:
      'Jalalpur Jattan buyers look mainly for houses and residential plots.',
    areas: [],
  },
  {
    slug: 'jampur',
    name: 'Jampur',
    province: 'Punjab',
    intro:
      'Jampur is a tehsil town of Rajanpur district in the far south-west of Punjab, near the Suleiman range. Property is mainly houses and plots traded between local families.',
    marketNote:
      'Jampur has a local market centred on houses and plots.',
    areas: [],
  },
  {
    slug: 'jaranwala',
    name: 'Jaranwala',
    province: 'Punjab',
    intro:
      'Jaranwala is a large tehsil town of Faisalabad district, linked to Faisalabad by road and home to agricultural and industrial businesses. Growing housing colonies offer plots and houses for families from the town and its villages.',
    marketNote:
      'Jaranwala demand is for plots and houses in its expanding housing colonies.',
    areas: [
      { slug: 'haider-garden', name: 'Haider Garden' },
    ],
  },
  {
    slug: 'jatoi',
    name: 'Jatoi',
    province: 'Punjab',
    intro:
      'Jatoi is a tehsil town of Muzaffargarh district in southern Punjab, in a farming area near the Chenab. The property market is local and consists mainly of houses and plots.',
    marketNote:
      'Jatoi property is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'jauharabad',
    name: 'Jauharabad',
    province: 'Punjab',
    intro:
      'Jauharabad is the planned headquarters town of Khushab district, laid out in sectors with wide roads. Houses and plots in its planned blocks make up most of the market.',
    marketNote:
      'Jauharabad buyers look for plots and houses in its planned town blocks.',
    areas: [
      { slug: 'block-no-14', name: 'Block No 14' },
      { slug: 'kohinor-sugar-mills-colony', name: 'Kohinor Sugar Mills colony' },
      { slug: 'iftikhar-town', name: 'Iftikhar Town' },
      { slug: 'burhan-town', name: 'Burhan Town' },
      { slug: 'naseem-colony', name: 'Naseem Colony' },
      { slug: 'shabeer-colony', name: 'Shabeer Colony' },
      { slug: 'gulshan-iqbal-town', name: 'Gulshan Iqbal Town' },
      { slug: 'asif-colony', name: 'Asif Colony' },
      { slug: 'wapda-scrap-colony', name: 'Wapda Scrap Colony' },
      { slug: 'qazi-colony', name: 'Qazi Colony' },
      { slug: 'gareeb-colony', name: 'Gareeb Colony' },
      { slug: 'ulfat-colony', name: 'Ulfat Colony' },
      { slug: 'shehzad-town', name: 'Shehzad Town' },
      { slug: 'ejaz-colony', name: 'Ejaz Colony' },
      { slug: 'satellite-town-no-3', name: 'Satellite Town No 3' },
    ],
  },
  {
    slug: 'kabirwala',
    name: 'Kabirwala',
    province: 'Punjab',
    intro:
      'Kabirwala is a tehsil town of Khanewal district, set in the cotton and wheat country north of Multan. Most property traded is houses and residential plots.',
    marketNote:
      'Kabirwala demand is local, centred on houses and plots.',
    areas: [],
  },
  {
    slug: 'kahror-pakka',
    name: 'Kahror Pakka',
    province: 'Punjab',
    intro:
      'Kahror Pakka is a tehsil town of Lodhran district in southern Punjab, serving a cotton-growing area. The market is small and local, with houses and plots the main types.',
    marketNote:
      'Kahror Pakka has a small, local housing market.',
    areas: [],
  },
  {
    slug: 'kamalia',
    name: 'Kamalia',
    province: 'Punjab',
    intro:
      'Kamalia in Toba Tek Singh district is known for its hand-woven khaddar cloth and textile trade. Houses and plots in the town\'s colonies make up most of the market.',
    marketNote:
      'Kamalia demand follows the local textile trade, mainly for houses and plots.',
    areas: [],
  },
  {
    slug: 'khanpur',
    name: 'Khanpur',
    province: 'Punjab',
    intro:
      'Khanpur is a tehsil town and railway junction in Rahim Yar Khan district, serving a large farming area. Property is mostly houses and residential plots bought by local families.',
    marketNote:
      'Khanpur buyers look for houses and plots near the city centre.',
    areas: [
      { slug: 'rockland-villas', name: 'Rockland Villas' },
      { slug: 'khanpur-bypass', name: 'Khanpur Bypass' },
      { slug: 'shahi-road', name: 'Shahi Road' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'madina-town', name: 'Madina Town' },
      { slug: 'riaz-town', name: 'Riaz Town' },
      { slug: 'model-town', name: 'Model Town' },
    ],
  },
  {
    slug: 'kharian',
    name: 'Kharian',
    province: 'Punjab',
    intro:
      'Kharian in Gujrat district is home to one of the country\'s largest cantonments and to many families working in Europe and the Gulf. Remittances support strong demand for houses and plots in the town and along the GT Road.',
    marketNote:
      'Kharian demand is driven by overseas families and the cantonment.',
    areas: [
      {
        slug: 'gt-road',
        name: 'GT Road',
        subAreas: [
          { slug: 'grand-city', name: 'Grand City' },
        ],
      },
      { slug: 'gulyana-road', name: 'Gulyana Road' },
    ],
  },
  {
    slug: 'khushab',
    name: 'Khushab',
    province: 'Punjab',
    intro:
      'Khushab is a district town on the Jhelum river at the edge of the Salt Range and Thal, known for its dhodha sweet. The market consists mainly of houses and residential plots.',
    marketNote:
      'Khushab property is local, centred on houses and plots.',
    areas: [
      { slug: 'jauharabad-road', name: 'Jauharabad Road' },
      { slug: 'fazal-colony', name: 'Fazal Colony' },
    ],
  },
  {
    slug: 'kot-addu',
    name: 'Kot Addu',
    province: 'Punjab',
    intro:
      'Kot Addu is a Muzaffargarh district town best known for the Kot Addu power plant. Its property market is local, with houses and plots near the town centre.',
    marketNote:
      'Kot Addu demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'lalamusa',
    name: 'Lalamusa',
    province: 'Punjab',
    intro:
      'Lalamusa is a Gujrat district town and railway junction on the GT Road, with many families working overseas. Houses and plots close to the GT Road are the most sought after.',
    marketNote:
      'Lalamusa buyers value GT Road access and overseas-funded houses.',
    areas: [],
  },
  {
    slug: 'layyah',
    name: 'Layyah',
    province: 'Punjab',
    intro:
      'Layyah is a district headquarters in the Thal region on the east bank of the Indus. Property is mainly houses and residential plots in the city and its housing schemes.',
    marketNote:
      'Layyah demand is local, centred on houses and plots.',
    areas: [],
  },
  {
    slug: 'liaquatpur',
    name: 'Liaquatpur',
    province: 'Punjab',
    intro:
      'Liaquatpur is a tehsil town of Rahim Yar Khan district, set in the cotton and sugarcane belt of southern Punjab. Most property traded is houses and plots.',
    marketNote:
      'Liaquatpur has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'lodhran',
    name: 'Lodhran',
    province: 'Punjab',
    intro:
      'Lodhran is a district headquarters between Multan and Bahawalpur in southern Punjab\'s cotton belt. Houses and plots in the city and its newer colonies make up most of the market.',
    marketNote:
      'Lodhran buyers look mainly for houses and residential plots.',
    areas: [],
  },
  {
    slug: 'mailsi',
    name: 'Mailsi',
    province: 'Punjab',
    intro:
      'Mailsi is a tehsil town of Vehari district, known for the Mailsi siphon where canals cross the Sutlej. Property is local, mostly houses and plots.',
    marketNote:
      'Mailsi demand is local, centred on houses and plots.',
    areas: [],
  },
  {
    slug: 'mangla',
    name: 'Mangla',
    province: 'Punjab',
    intro:
      'Mangla is a cantonment town by Mangla Dam on the Jhelum river, on the border between Punjab and Azad Kashmir. Its market includes houses in and around the cantonment and plots in nearby schemes.',
    marketNote:
      'Mangla demand centres on houses near the cantonment and dam.',
    areas: [
      { slug: 'mangla-colony', name: 'Mangla Colony' },
      { slug: 'baral-colony', name: 'Baral Colony' },
    ],
  },
  {
    slug: 'mian-channu',
    name: 'Mian Channu',
    province: 'Punjab',
    intro:
      'Mian Channu is a Khanewal district town on the N-5 highway between Sahiwal and Multan. Houses and plots near the highway and town centre make up most of the market.',
    marketNote:
      'Mian Channu buyers favour houses and plots with highway access.',
    areas: [
      { slug: 'mian-channu-bypass', name: 'Mian Channu Bypass' },
      { slug: 'husnain-abad', name: 'Husnain Abad' },
      { slug: 'yaseen-town', name: 'Yaseen Town' },
    ],
  },
  {
    slug: 'mianwali',
    name: 'Mianwali',
    province: 'Punjab',
    intro:
      'Mianwali is a district headquarters on the Indus in north-western Punjab, near Chashma Barrage and the Salt Range. Its market covers houses and plots in the city and its housing colonies.',
    marketNote:
      'Mianwali demand is for houses and plots in town and its colonies.',
    areas: [
      { slug: 'gangvi-mohallah', name: 'Gangvi Mohallah' },
      { slug: 'mohallah-miana', name: 'Mohallah Miana' },
      { slug: 'mohallah-gaoshalla', name: 'Mohallah Gaoshalla' },
      { slug: 'ibrahim-abad', name: 'Ibrahim Abad' },
      { slug: 'wandhi-roshan-wali', name: 'Wandhi Roshan Wali' },
      { slug: 'civil-line', name: 'Civil Line' },
      { slug: 'awanpur-mianwali', name: 'Awanpur Mianwali' },
      { slug: 'muslim-colony', name: 'Muslim Colony' },
      { slug: 'mohammadi-town', name: 'Mohammadi Town' },
      { slug: 'ali-town', name: 'Ali Town' },
      { slug: 'shaheen-town', name: 'Shaheen Town' },
      { slug: 'bilal-town', name: 'Bilal Town' },
      { slug: 'watta-town', name: 'Watta Town' },
      { slug: 'turabaz-town', name: 'Turabaz Town' },
    ],
  },
  {
    slug: 'mitha-tiwana',
    name: 'Mitha Tiwana',
    province: 'Punjab',
    intro:
      'Mitha Tiwana is a town in Khushab district, long associated with the Tiwana family. Property is mostly houses and farmland traded locally.',
    marketNote:
      'Mitha Tiwana has a small, local property market.',
    areas: [],
  },
  {
    slug: 'murree',
    name: 'Murree',
    province: 'Punjab',
    intro:
      'Murree is Punjab\'s best-known hill station, in the pine-covered hills north-east of Islamabad. Its market is built around tourism: apartments, cottages and hotel properties, along with houses for families who live there year-round.',
    marketNote:
      'Murree demand centres on apartments, cottages and hotel property for the tourist trade.',
    areas: [
      {
        slug: 'murree-expressway',
        name: 'Murree Expressway',
        subAreas: [
          { slug: 'peak-nest', name: 'Peak Nest' },
          { slug: '201-apartment', name: '201 Apartment' },
          { slug: 'florence-hill', name: 'Florence Hill' },
        ],
      },
      {
        slug: 'new-murree',
        name: 'New Murree',
        subAreas: [
          { slug: 'patriata', name: 'Patriata' },
        ],
      },
      {
        slug: 'bhurban',
        name: 'Bhurban',
        subAreas: [
          { slug: 'bhurban-villas-apartments', name: 'Bhurban Villas & Apartments' },
          { slug: 'bhurban-apartments', name: 'Bhurban Apartments' },
          { slug: 'swiss-suites-bhurban', name: 'Swiss Suites Bhurban' },
          { slug: 'bhurbun-continental-apartments', name: 'Bhurbun Continental Apartments' },
        ],
      },
      { slug: 'lower-topa-murree-road', name: 'Lower Topa - Murree Road' },
      { slug: 'mall-road', name: 'Mall Road' },
      { slug: 'barrian', name: 'Barrian' },
      { slug: 'murree-city', name: 'Murree City' },
      { slug: 'lawrence-college-road', name: 'Lawrence College Road' },
      { slug: 'cecil-resorts', name: 'Cecil Resorts' },
      { slug: 'valley-view-residency', name: 'Valley View Residency' },
      { slug: 'lakot', name: 'Lakot' },
      { slug: 'kundan-bazar', name: 'Kundan Bazar' },
      { slug: 'gharial-camp', name: 'Gharial Camp' },
      { slug: 'murree-resorts', name: 'Murree Resorts' },
      { slug: 'upper-jhika-gali-road', name: 'Upper Jhika Gali Road' },
      { slug: 'gpo-chowk', name: 'GPO Chowk' },
      { slug: 'lower-jhika-gali-road', name: 'Lower Jhika Gali Road' },
      { slug: 'murree-improvement-trust-colony', name: 'Murree Improvement Trust Colony' },
      { slug: 'jhika-gali', name: 'Jhika Gali' },
      { slug: 'pindi-point', name: 'Pindi Point' },
      { slug: 'viewforth-road', name: 'Viewforth Road' },
      { slug: 'lower-bazar-road', name: 'Lower Bazar Road' },
      { slug: 'kashmir-point', name: 'Kashmir Point' },
      { slug: 'darya-gali', name: 'Darya Gali' },
      { slug: 'kashmir-road', name: 'Kashmir Road' },
    ],
  },
  {
    slug: 'muzaffargarh',
    name: 'Muzaffargarh',
    province: 'Punjab',
    intro:
      'Muzaffargarh is a district headquarters between the Chenab and Indus rivers, across the Chenab from Multan. Houses and residential plots in the city and on the Multan road make up most of the market.',
    marketNote:
      'Muzaffargarh demand is for houses and plots, especially towards Multan.',
    areas: [
      { slug: 'chowk-sarwar-shaheed', name: 'Chowk Sarwar Shaheed' },
      { slug: 'mm-road', name: 'MM Road' },
    ],
  },
  {
    slug: 'nankana-sahib',
    name: 'Nankana Sahib',
    province: 'Punjab',
    intro:
      'Nankana Sahib is the birthplace of Guru Nanak and a district headquarters west of Lahore, visited by Sikh pilgrims from around the world. The market consists mainly of houses and plots in town.',
    marketNote:
      'Nankana Sahib property is local, centred on houses and plots.',
    areas: [
      { slug: 'nankana-sahib-bypass', name: 'Nankana Sahib Bypass' },
      { slug: 'mananwala-bypass', name: 'Mananwala Bypass' },
    ],
  },
  {
    slug: 'narowal',
    name: 'Narowal',
    province: 'Punjab',
    intro:
      'Narowal is a district headquarters near the Indian border, close to the Kartarpur Corridor. Its market is mostly houses and plots in the city and its housing colonies.',
    marketNote:
      'Narowal demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'pakpattan',
    name: 'Pakpattan',
    province: 'Punjab',
    intro:
      'Pakpattan is a district headquarters known for the shrine of Baba Farid Ganjshakar, which draws large numbers of pilgrims. Houses and residential plots in the city make up most of the market.',
    marketNote:
      'Pakpattan buyers look mainly for houses and plots in town.',
    areas: [
      { slug: 'pakpattan-bypass', name: 'Pakpattan Bypass' },
    ],
  },
  {
    slug: 'pasrur',
    name: 'Pasrur',
    province: 'Punjab',
    intro:
      'Pasrur is a tehsil town of Sialkot district, set in a farming area south-east of Sialkot. Property is local and mostly houses and plots.',
    marketNote:
      'Pasrur has a local market for houses and plots.',
    areas: [
      { slug: 'daska-road', name: 'Daska Road' },
    ],
  },
  {
    slug: 'pattoki',
    name: 'Pattoki',
    province: 'Punjab',
    intro:
      'Pattoki is a Kasur district town on the road between Lahore and Okara, famous for its plant nurseries. Houses and plots in town make up most of the market.',
    marketNote:
      'Pattoki demand is local, centred on houses and plots.',
    areas: [],
  },
  {
    slug: 'pind-dadan-khan',
    name: 'Pind Dadan Khan',
    province: 'Punjab',
    intro:
      'Pind Dadan Khan is a Jhelum district town on the Jhelum river, close to the Khewra Salt Mine. Its property market is small and local.',
    marketNote:
      'Pind Dadan Khan has a small, local market for houses and land.',
    areas: [
      { slug: 'lilla-road', name: 'Lilla Road' },
    ],
  },
  {
    slug: 'pindi-bhattian',
    name: 'Pindi Bhattian',
    province: 'Punjab',
    intro:
      'Pindi Bhattian is a Hafizabad district town at an interchange on the M-2 Lahore–Islamabad motorway. Motorway access supports demand for plots alongside local house sales.',
    marketNote:
      'Pindi Bhattian buyers value its M-2 motorway access.',
    areas: [
      { slug: 'fatehke-burjwah', name: 'Fatehke Burjwah' },
      { slug: 'fatehke-tibbi', name: 'Fatehke Tibbi' },
    ],
  },
  {
    slug: 'pir-mahal',
    name: 'Pir Mahal',
    province: 'Punjab',
    intro:
      'Pir Mahal is a tehsil town of Toba Tek Singh district in central Punjab\'s farmland. Property is local, mostly houses and plots.',
    marketNote:
      'Pir Mahal has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'raiwind',
    name: 'Raiwind',
    province: 'Punjab',
    intro:
      'Raiwind is a town in Lahore district, south of the city, known for its annual Tablighi gathering. Lahore\'s growth along Raiwind Road has brought many housing schemes, and plots here attract both end-users and investors.',
    marketNote:
      'Raiwind demand is tied to Lahore\'s southward growth, especially plots in housing schemes.',
    areas: [
      { slug: 'raiwind-bypass', name: 'Raiwind Bypass' },
    ],
  },
  {
    slug: 'rajanpur',
    name: 'Rajanpur',
    province: 'Punjab',
    intro:
      'Rajanpur is the southernmost district headquarters of Punjab, on the west bank of the Indus near the Suleiman range. The market consists mainly of houses and plots in the city.',
    marketNote:
      'Rajanpur property is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'renala-khurd',
    name: 'Renala Khurd',
    province: 'Punjab',
    intro:
      'Renala Khurd is an Okara district town on the N-5 highway, known for one of the earliest hydroelectric stations in the region. Houses and plots in town make up most of the market.',
    marketNote:
      'Renala Khurd demand is local, centred on houses and plots.',
    areas: [
      { slug: 'lahore-multan-road', name: 'Lahore - Multan Road' },
    ],
  },
  {
    slug: 'sadiqabad',
    name: 'Sadiqabad',
    province: 'Punjab',
    intro:
      'Sadiqabad is a tehsil town of Rahim Yar Khan district near the Sindh border, with large fertiliser plants nearby. Industry and farming support demand for houses and plots in town.',
    marketNote:
      'Sadiqabad demand is supported by local industry, mainly for houses and plots.',
    areas: [
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'ajmal-town', name: 'Ajmal Town' },
      { slug: 'manthar-road', name: 'Manthar Road' },
    ],
  },
  {
    slug: 'samundri',
    name: 'Samundri',
    province: 'Punjab',
    intro:
      'Samundri is a tehsil town of Faisalabad district, set in canal-irrigated farmland south of Faisalabad. Houses and plots in the town\'s colonies make up most of the market.',
    marketNote:
      'Samundri has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'sangla-hill',
    name: 'Sangla Hill',
    province: 'Punjab',
    intro:
      'Sangla Hill is a town in Nankana Sahib district, named after the rocky hill beside it. Property is local and mostly houses and plots.',
    marketNote:
      'Sangla Hill has a small, local housing market.',
    areas: [],
  },
  {
    slug: 'sarai-alamgir',
    name: 'Sarai Alamgir',
    province: 'Punjab',
    intro:
      'Sarai Alamgir is a Gujrat district town on the Jhelum river, across the bridge from Jhelum city and home to the Military College Jhelum. Many families have overseas links, supporting demand for houses and plots.',
    marketNote:
      'Sarai Alamgir demand is supported by overseas families and its GT Road location.',
    areas: [
      {
        slug: 'gt-road',
        name: 'GT Road',
        subAreas: [
          { slug: 'new-metro-city', name: 'New Metro City' },
        ],
      },
      { slug: 'canal-city', name: 'Canal City' },
      { slug: 'farooq-town', name: 'Farooq Town' },
      { slug: 'new-metro-city-kharian-sarai-alamgir', name: 'New Metro City Kharian - Sarai Alamgir' },
      { slug: 'mohalla-chishtian', name: 'Mohalla Chishtian' },
    ],
  },
  {
    slug: 'shahkot',
    name: 'Shahkot',
    province: 'Punjab',
    intro:
      'Shahkot is a town in Nankana Sahib district, on the road between Faisalabad and Lahore. Most property is houses and plots traded locally.',
    marketNote:
      'Shahkot has a local market for houses and plots.',
    areas: [
      { slug: 'nankana-road', name: 'Nankana Road' },
      { slug: '90-chitti-road', name: '90 Chitti Road' },
      { slug: 'sangla-hill-road', name: 'Sangla Hill Road' },
      { slug: 'faisalabad-road', name: 'Faisalabad Road' },
      { slug: 'lahore-sheikhupura-road', name: 'Lahore - Sheikhupura Road' },
    ],
  },
  {
    slug: 'shakargarh',
    name: 'Shakargarh',
    province: 'Punjab',
    intro:
      'Shakargarh is a tehsil town of Narowal district near the Indian border, in a farming area below the Jammu hills. The market consists mainly of houses and plots.',
    marketNote:
      'Shakargarh property is local, mostly houses and plots.',
    areas: [
      { slug: 'noor-kot-road', name: 'Noor Kot Road' },
    ],
  },
  {
    slug: 'shehr-sultan',
    name: 'Shehr Sultan',
    province: 'Punjab',
    intro:
      'Shehr Sultan is a town in Muzaffargarh district in southern Punjab. Its property market is small, mostly houses and farmland sold locally.',
    marketNote:
      'Shehr Sultan has a small, local property market.',
    areas: [],
  },
  {
    slug: 'sher-garh',
    name: 'Sher Garh',
    province: 'Punjab',
    intro:
      'Sher Garh is an Okara district town known for the shrine of Daud Bandagi Kirmani. Property is local and mostly houses and plots.',
    marketNote:
      'Sher Garh has a small, local housing market.',
    areas: [],
  },
  {
    slug: 'shorkot',
    name: 'Shorkot',
    province: 'Punjab',
    intro:
      'Shorkot is a Jhang district town with a cantonment and a PAF base nearby. Houses and plots in the town and cantonment area make up most of the market.',
    marketNote:
      'Shorkot demand centres on houses near the town and cantonment.',
    areas: [
      { slug: 'shorkot-cantt-road', name: 'Shorkot Cantt Road' },
    ],
  },
  {
    slug: 'talagang',
    name: 'Talagang',
    province: 'Punjab',
    intro:
      'Talagang is a town in the Chakwal region of the Salt Range plateau, with many families serving in the armed forces. Houses and plots in town make up most of the market.',
    marketNote:
      'Talagang demand is local, mostly houses and plots.',
    areas: [
      { slug: 'malakwal-talagang-road', name: 'Malakwal Talagang Road' },
    ],
  },
  {
    slug: 'taxila',
    name: 'Taxila',
    province: 'Punjab',
    intro:
      'Taxila in Rawalpindi district is famous for its Gandhara heritage sites and is home to Heavy Industries Taxila and UET Taxila. Its closeness to Islamabad, Wah and the GT Road supports demand for houses and plots in town and nearby housing schemes.',
    marketNote:
      'Taxila demand is supported by nearby industry, the university and access to Islamabad.',
    areas: [
      { slug: 'taxila-gardens-housing-scheme', name: 'Taxila Gardens Housing Scheme' },
      { slug: 'kohsar-colony', name: 'Kohsar Colony' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'wakefiled-garden', name: 'Wakefiled Garden' },
      { slug: 'wahdat-colony', name: 'Wahdat Colony' },
      { slug: 'hmc-road', name: 'HMC Road' },
      { slug: 'jamilabad', name: 'Jamilabad' },
      { slug: 'shahpur', name: 'Shahpur' },
      { slug: 'shah-wali-colony', name: 'Shah Wali Colony' },
    ],
  },
  {
    slug: 'wazirabad',
    name: 'Wazirabad',
    province: 'Punjab',
    intro:
      'Wazirabad is a Gujranwala district town on the GT Road, famous for its cutlery industry. Houses and plots along the GT Road and in town make up most of the market.',
    marketNote:
      'Wazirabad demand follows the GT Road and the local cutlery trade.',
    areas: [
      {
        slug: 'daska-road',
        name: 'Daska Road',
        subAreas: [
          { slug: 'dream-gardens', name: 'Dream Gardens' },
        ],
      },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'sialkot-road', name: 'Sialkot Road' },
      { slug: 'wazirabad-dhonkal-road', name: 'Wazirabad - Dhonkal Road' },
      { slug: 'jafariah-colony', name: 'Jafariah Colony' },
      { slug: 'madina-colony', name: 'Madina Colony' },
      { slug: 'hajipura', name: 'Hajipura' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'jinnah-colony', name: 'Jinnah Colony' },
      { slug: 'nizamabad', name: 'Nizamabad' },
      { slug: 'allahabad', name: 'Allahabad' },
      { slug: 'cheema-colony', name: 'Cheema Colony' },
      { slug: 'naseer-colony', name: 'Naseer Colony' },
      { slug: 'shadman-colony', name: 'Shadman Colony' },
    ],
  },
  {
    slug: 'yazman',
    name: 'Yazman',
    province: 'Punjab',
    intro:
      'Yazman is a Bahawalpur district town at the edge of the Cholistan desert, the gateway to Derawar Fort. Property is local and mostly houses and plots.',
    marketNote:
      'Yazman has a small, local housing market.',
    areas: [],
  },
  {
    slug: 'daharki',
    name: 'Daharki',
    province: 'Sindh',
    intro:
      'Daharki is a Ghotki district town in upper Sindh, home to large fertiliser plants and nearby gas fields. Industry supports demand for houses and plots in town.',
    marketNote:
      'Daharki demand is supported by the fertiliser and gas industry.',
    areas: [],
  },
  {
    slug: 'daur',
    name: 'Daur',
    province: 'Sindh',
    intro:
      'Daur is a tehsil town of Shaheed Benazirabad district in central Sindh. Property is local, mostly houses and plots.',
    marketNote:
      'Daur has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'gambat',
    name: 'Gambat',
    province: 'Sindh',
    intro:
      'Gambat is a Khairpur district town known for the Gambat Institute of Medical Sciences. Houses and plots in town make up most of the market.',
    marketNote:
      'Gambat demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'gharo',
    name: 'Gharo',
    province: 'Sindh',
    intro:
      'Gharo is a Thatta district town on the National Highway east of Karachi, in the Sindh wind-energy corridor. Its closeness to Karachi and Port Qasim brings interest in land and industrial plots.',
    marketNote:
      'Gharo demand is for land and plots linked to Karachi\'s eastward growth and the wind corridor.',
    areas: [
      { slug: 'lait-canal-road', name: 'Lait Canal Road' },
      { slug: 'keti-bunder-highway', name: 'Keti Bunder Highway' },
      { slug: 'sindh-coastal-highway', name: 'Sindh Coastal Highway' },
      { slug: 'club-road', name: 'Club Road' },
      { slug: 'lait-village', name: 'Lait Village' },
      { slug: 'sultanabad', name: 'Sultanabad' },
    ],
  },
  {
    slug: 'hala',
    name: 'Hala',
    province: 'Sindh',
    intro:
      'Hala in Matiari district is known for its handicrafts, ajrak and kashi tile work, and for the shrine of Makhdoom Nooh. Property is local, mostly houses and plots.',
    marketNote:
      'Hala has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'jamshoro',
    name: 'Jamshoro',
    province: 'Sindh',
    intro:
      'Jamshoro is a university town on the Indus across from Hyderabad, home to the University of Sindh, Mehran University and LUMHS. Students, staff and Hyderabad\'s growth support demand for houses and rentals.',
    marketNote:
      'Jamshoro demand is driven by its universities and nearness to Hyderabad.',
    areas: [],
  },
  {
    slug: 'kandiaro',
    name: 'Kandiaro',
    province: 'Sindh',
    intro:
      'Kandiaro is a tehsil town of Naushahro Feroze district in central Sindh. The market consists mainly of houses and plots bought by local families.',
    marketNote:
      'Kandiaro has a local market for houses and plots.',
    areas: [
      { slug: 'andal-solangi', name: 'Andal Solangi' },
    ],
  },
  {
    slug: 'khipro',
    name: 'Khipro',
    province: 'Sindh',
    intro:
      'Khipro is a tehsil town of Sanghar district, at the edge of the desert east of Sanghar. Property is local and mostly houses and land.',
    marketNote:
      'Khipro has a small, local property market.',
    areas: [],
  },
  {
    slug: 'kotri',
    name: 'Kotri',
    province: 'Sindh',
    intro:
      'Kotri is an industrial town in Jamshoro district, across the Indus from Hyderabad at the Kotri Barrage. Its industrial estate and closeness to Hyderabad support demand for houses, plots and industrial property.',
    marketNote:
      'Kotri demand combines industrial property with housing for Hyderabad commuters.',
    areas: [],
  },
  {
    slug: 'matiari',
    name: 'Matiari',
    province: 'Sindh',
    intro:
      'Matiari is a district headquarters in central Sindh, north of Hyderabad on the National Highway. Houses and plots in town make up most of the market.',
    marketNote:
      'Matiari demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'matli',
    name: 'Matli',
    province: 'Sindh',
    intro:
      'Matli is a tehsil town of Badin district in lower Sindh, in a sugarcane and rice area. Property is local, mostly houses and plots.',
    marketNote:
      'Matli has a local market for houses and plots.',
    areas: [
      { slug: 'wapda-colony', name: 'Wapda Colony' },
    ],
  },
  {
    slug: 'mehrabpur',
    name: 'Mehrabpur',
    province: 'Sindh',
    intro:
      'Mehrabpur is a town in Naushahro Feroze district on the National Highway in central Sindh. Houses and plots in town make up most of the market.',
    marketNote:
      'Mehrabpur has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'mirpur-sakro',
    name: 'Mirpur Sakro',
    province: 'Sindh',
    intro:
      'Mirpur Sakro is a tehsil town of Thatta district in the Indus delta. Property is local and mostly houses and land.',
    marketNote:
      'Mirpur Sakro has a small, local property market.',
    areas: [
      { slug: 'gharo-keti-bunder-highway', name: 'Gharo - Keti Bunder Highway' },
    ],
  },
  {
    slug: 'moro',
    name: 'Moro',
    province: 'Sindh',
    intro:
      'Moro is a Naushahro Feroze district town on the National Highway in central Sindh. Houses and plots in town make up most of the market.',
    marketNote:
      'Moro has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'naushahro-feroze',
    name: 'Naushahro Feroze',
    province: 'Sindh',
    intro:
      'Naushahro Feroze is a district headquarters in central Sindh, set in a farming area west of the Indus. Property is mostly houses and plots traded locally.',
    marketNote:
      'Naushahro Feroze demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'qazi-ahmed',
    name: 'Qazi Ahmed',
    province: 'Sindh',
    intro:
      'Qazi Ahmed is a tehsil town of Shaheed Benazirabad district on the Indus in central Sindh. Property is local, mostly houses and plots.',
    marketNote:
      'Qazi Ahmed has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'rato-dero',
    name: 'Rato Dero',
    province: 'Sindh',
    intro:
      'Rato Dero is a tehsil town of Larkana district in upper Sindh. Houses and plots in town make up most of the market.',
    marketNote:
      'Rato Dero has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'rohri',
    name: 'Rohri',
    province: 'Sindh',
    intro:
      'Rohri is a historic town on the Indus opposite Sukkur, linked to it by the Lansdowne and Ayub bridges and known for its cement industry. Its market is closely tied to Sukkur\'s, with houses and plots on both sides of the river.',
    marketNote:
      'Rohri demand is closely linked to Sukkur across the river.',
    areas: [],
  },
  {
    slug: 'sakrand',
    name: 'Sakrand',
    province: 'Sindh',
    intro:
      'Sakrand is a tehsil town of Shaheed Benazirabad district in central Sindh, known for its agricultural research institute. Property is local, mostly houses and plots.',
    marketNote:
      'Sakrand has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'sehwan',
    name: 'Sehwan',
    province: 'Sindh',
    intro:
      'Sehwan Sharif in Jamshoro district is home to the shrine of Lal Shahbaz Qalandar, one of the most visited in the country. Pilgrim traffic supports shops and guest houses alongside local housing.',
    marketNote:
      'Sehwan demand is linked to shrine visitors: shops, guest houses and local houses.',
    areas: [],
  },
  {
    slug: 'shahdadpur',
    name: 'Shahdadpur',
    province: 'Sindh',
    intro:
      'Shahdadpur is a tehsil town of Sanghar district in central Sindh, a trading centre for the surrounding farmland. Houses and plots in town make up most of the market.',
    marketNote:
      'Shahdadpur demand is local, mostly houses and plots.',
    areas: [],
  },
  {
    slug: 'shahpur-chakar',
    name: 'Shahpur Chakar',
    province: 'Sindh',
    intro:
      'Shahpur Chakar is a town in Sanghar district in central Sindh. Property is local and mostly houses and land.',
    marketNote:
      'Shahpur Chakar has a small, local property market.',
    areas: [],
  },
  {
    slug: 'sujawal',
    name: 'Sujawal',
    province: 'Sindh',
    intro:
      'Sujawal is a district headquarters in the Indus delta, carved out of Thatta district. Property is local and mostly houses and land.',
    marketNote:
      'Sujawal has a small, local property market.',
    areas: [],
  },
  {
    slug: 'tando-bago',
    name: 'Tando Bago',
    province: 'Sindh',
    intro:
      'Tando Bago is a tehsil town of Badin district in lower Sindh. Property is local and mostly houses and plots.',
    marketNote:
      'Tando Bago has a local market for houses and plots.',
    areas: [],
  },
  {
    slug: 'tando-muhammad-khan',
    name: 'Tando Muhammad Khan',
    province: 'Sindh',
    intro:
      'Tando Muhammad Khan is a district headquarters south of Hyderabad, in a sugarcane-growing area. Houses and plots in town make up most of the market.',
    marketNote:
      'Tando Muhammad Khan demand is local, mostly houses and plots.',
    areas: [
      { slug: 'hyderabad-badin-road', name: 'Hyderabad - Badin Road' },
    ],
  },
]

export default cities
