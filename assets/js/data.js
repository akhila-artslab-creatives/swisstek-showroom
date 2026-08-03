/* ==========================================================================
   SWISSTEK PRODUCT DATA

   PROVENANCE. Every product name, pack size, standard reference and shade
   code below comes from swisstekceylon.com or the SWISSTEK Product
   Catalogue. Nothing here is invented.

   Two things are explicitly NOT verified and are marked inline:
     - grout swatch hex values, which are sampled from the printed catalogue
       chart. The catalogue states actual colours may vary.
     - Swissparkett timber tones, which are indicative renderings.

   Company facts are from swisstekceylon.com. Leadership names, financials
   and any product code not listed here were deliberately left out.
   ========================================================================== */

const SW = {};

SW.company = {
  name: 'Swisstek (Ceylon) PLC',
  tagline: 'For the perfect finish',
  founded: '1967, as Parquet (Ceylon) Ltd, with Swiss company Bauwerk AG',
  listed: 'Colombo Stock Exchange, 1983',
  renamed: 'Swisstek (Ceylon) PLC, 2011',
  pivot: 'Core business moved to tile grout and mortar in 2009',
  group: 'Part of the Lanka Walltiles / Vallibel One group',
  sls: 'The only Sri Lankan company with SLS certification for tile mortar and tile grout',
  iso: 'ISO 9001 certified since 2015',
  head_office: 'No. 215, Nawala Road, Narahenpita, Colombo 05',
  factory: 'Factory Complex, Balummahara, Imbulgoda',
  hotline: '0117807000'
};

/* 25 Swisstek Tile Grout shades, verbatim from the catalogue colour chart.
   AVACADO GREEN and COBLAT BLUE are spelled that way in the catalogue and
   are reproduced as printed rather than silently corrected.
   Hex values are sampled from the printed chart and are indicative only. */
SW.groutShades = [
  { code:"001", name:"WHITE", hex:"#FFFFFF" },
  { code:"007", name:"LILY WHITE", hex:"#FFFCE9" },
  { code:"005", name:"OFF WHITE", hex:"#FFEABB" },
  { code:"014", name:"IVORY", hex:"#FFEAAB" },
  { code:"015", name:"CREAM", hex:"#FFEB95" },
  { code:"061", name:"BAMBOO", hex:"#FFE0B4" },
  { code:"064", name:"LEATHER BROWN", hex:"#CC7B43" },
  { code:"022", name:"BEIGE", hex:"#BC9EA6" },
  { code:"025", name:"BROWN", hex:"#8F3004" },
  { code:"018", name:"SAHARA SAND", hex:"#F6DCCF" },
  { code:"030", name:"PINK", hex:"#F7ABB5" },
  { code:"080", name:"TERRA COTTA", hex:"#F79578" },
  { code:"069", name:"AVACADO GREEN", hex:"#AFD7A5" },
  { code:"040", name:"LIGHT BLUE", hex:"#A4DDF8" },
  { code:"085", name:"BLUE", hex:"#68C4E9" },
  { code:"041", name:"COBLAT BLUE", hex:"#06B7ED" },
  { code:"084", name:"TOURMALINE", hex:"#3273AB" },
  { code:"042", name:"DARK BLUE", hex:"#717D8D" },
  { code:"074", name:"LIGHT GREY", hex:"#D8D4D3" },
  { code:"020", name:"SILVER GREY", hex:"#CBCED7" },
  { code:"009", name:"CREAMISH GREY", hex:"#D1C1B4" },
  { code:"066", name:"DOVE GREY", hex:"#B9B1A4" },
  { code:"010", name:"DARK GREY", hex:"#8F8890" },
  { code:"067", name:"BLUISH GREY", hex:"#8A909C" },
  { code:"060", name:"BLACK", hex:"#1C1D21" },
];

/* SW-101 epoxy grout has its OWN 12-shade range with EX-G codes, from the
   catalogue's "SW-101 / AVAILABLE COLOURS" page. It does not share codes
   with the tile grout range above, so never map one onto the other.
   Note: the catalogue text claims 25 colours but charts 12. Query with client. */
SW.epoxyShades = [
  { code:'EX-G-01', name:'CRYSTAL WHITE',     hex:'#F7F7F5' },
  { code:'EX-G-05', name:'IVORY WHISPER',     hex:'#E4CFA0' },
  { code:'EX-G-10', name:'SLATE GRAY',        hex:'#6E6E70' },
  { code:'EX-G-15', name:'BUTTERCREAM GLOW',  hex:'#A65C36' },
  { code:'EX-G-25', name:'HONEY BROWN',       hex:'#7A3218' },
  { code:'EX-G-40', name:'SERENITY BLUE',     hex:'#79C3E8' },
  { code:'EX-G-42', name:'OCEAN BLUE',        hex:'#1E4E8C' },
  { code:'EX-G-51', name:'MEADOW GREEN',      hex:'#4B7B3A' },
  { code:'EX-G-60', name:'ONYX BLACK',        hex:'#111111' },
  { code:'EX-G-74', name:'SILVER GRAY',       hex:'#A8A8A6' },
  { code:'EX-G-80', name:'TERRACOTTA EARTH',  hex:'#6B2F1C' },
  { code:'EX-G-85', name:'DENIMBLUE',         hex:'#8494A8' }
];

/* Swissparkett timber species, listed on swisstekceylon.com/wood-flooring.
   Tones are INDICATIVE RENDERINGS, not finish samples. */
SW.timbers = [
  { id:'w1', name:'Burma Teak',      hex:'#B5854A' },
  { id:'w2', name:'Indonesian Teak', hex:'#A9773F' },
  { id:'w3', name:'Taukkyan',        hex:'#8B5E3C' },
  { id:'w4', name:'Tauari',          hex:'#C9A877' },
  { id:'w5', name:'Merbau',          hex:'#7A4428' },
  { id:'w6', name:'Pyinkado',        hex:'#6E4326' }
];

/* Tile finishes are GENERIC. Swisstek does not manufacture tiles. These
   exist so the grout has something to sit against. Never present as a range. */
SW.tileFinishes = [
  { id:'t1', name:'White Marble', hex:'#EDEFF1', veins:true  },
  { id:'t2', name:'Pearl Grey',   hex:'#CFD3D6', veins:false },
  { id:'t3', name:'Sandstone',    hex:'#D2C7B4', veins:false },
  { id:'t4', name:'Graphite',     hex:'#5C6063', veins:false },
  { id:'t5', name:'Basalt',       hex:'#3A3D3F', veins:false }
];

/* Generic wall paint colours, held to the cool grey rule. Not a Swisstek range. */
SW.wallFinishes = [
  { id:'p1', name:'Pure White', hex:'#FFFFFF' },
  { id:'p2', name:'Chalk',      hex:'#F4F7F9' },
  { id:'p3', name:'Light Grey', hex:'#E2E6E9' },
  { id:'p4', name:'Cool Grey',  hex:'#CBD2D7' },
  { id:'p5', name:'Slate',      hex:'#8E979E' }
];

SW.products = {
  adhesiveSuper: {
    name:'Super Tile Adhesive', std:'C2', pack:'25 kg bag', img:'adhesive-super',
    cat:'tiling', sls:'SLS 1375',
    blurb:'The proven formula for basic porcelain and ceramic tile application on a freshly built cement screed surface. Intended for dry, indoor environments.' },
  adhesiveSuperPlus: {
    name:'Super Plus Tile Adhesive', std:'C2T', pack:'25 kg bag', img:'adhesive-superplus',
    cat:'tiling', sls:'SLS 1375',
    blurb:'Designed and manufactured with damp and wet areas in mind. Suited to bathroom floors and walls, and to fixing tile onto tile after roughing.' },
  adhesiveUltraGrip: {
    name:'Ultra Grip Tile Adhesive', std:'', pack:'25 kg bag', img:'adhesive-ultragrip',
    cat:'tiling', sls:'SLS 1375',
    blurb:'For indoor and outdoor use, with excellent bonding strength and resistance to extreme weather conditions.' },
  adhesiveUltraGripWhite: {
    name:'Ultra Grip White Tile Adhesive', std:'', pack:'25 kg bag', img:'adhesive-ultragrip-white',
    cat:'tiling', sls:'SLS 1375',
    blurb:'White in colour for a clean finish behind translucent and mosaic tiles, indoor and outdoor.' },
  groutPolymer: {
    name:'Polymer Modified Tile Grout', std:'CG2WA', pack:'1 kg pack', img:'grout-polymer-modified',
    cat:'tiling', sls:'SLS 1376', shades:25,
    blurb:'High bonding strength, dirt and fungus resistant. Suited to substrates and wet spaces including bathrooms, roof tops and swimming pools.' },
  groutSuperPolymer: {
    name:'Super Polymer Tile Grout', std:'CG2WA', pack:'1 kg pack', img:'grout-super-polymer',
    cat:'tiling', sls:'SLS 1376', shades:25,
    blurb:'An ultra fine, non sanded formulation with a water repelling property, specially formulated for narrow grouting joints and for water tanks.' },
  groutSealer: {
    name:'Swisstek Grout Sealer', std:'', pack:'200 ml bottle', img:'grout-sealer',
    cat:'tiling',
    blurb:'Protects all porous cementitious grout joints from stains while keeping a natural look. Comes with an applicator tip.' },
  sw101: {
    name:'SW 101 Epoxy Grout', std:'', pack:'5 kg pack', img:'sw101-epoxy-grout',
    cat:'waterproofing', shades:12,
    blurb:'A hygienic, hard wearing, impervious epoxide resin based grout with high resistance to chemical attack, abrasion and impact. VOC free and BPA free.' },
  aquaShield: {
    name:'Aqua Shield 2K Waterproofer', std:'', pack:'5 kg pack', img:'aqua-shield-2k',
    cat:'waterproofing',
    blurb:'A cementitious base blended with graded aggregates and acrylic additives, for concrete slabs, rooftops, columns, retaining walls, swimming pools, water tanks, bathrooms and kitchens.' },
  silicone: {
    name:'Swisstek General Purpose Silicone', std:'', pack:'300 ml', img:'silicone',
    cat:'waterproofing',
    blurb:'All purpose silicone sealant for perimeter and corner joints. Available in clear, black and white.' },
  skimPremium: {
    name:'Skim Coat Premium', std:'', pack:'20 kg bag', img:'skimcoat-premium',
    cat:'walls',
    blurb:'A premium cementitious water based compound modified with improved polymer, suited to interior as well as exterior applications.' },
  skimDeluxe: {
    name:'Skim Coat Deluxe', std:'', pack:'20 kg bag', img:'skimcoat-deluxe',
    cat:'walls',
    blurb:'A premium cementitious water based compound modified with improved polymer, suited to interior applications.' },
  swissparkett: {
    name:'Swissparkett Wooden Flooring', std:'', pack:'', img:'swissparkett-floor',
    cat:'flooring',
    blurb:'Solid timber flooring in Burma Teak, Indonesian Teak, Pyinkado, Tauari, Merbau and Taukkyan.' }
};

/* Showroom categories. Scene imagery is generated concept visualisation and
   is labelled as such in the UI. Product photography is Swisstek's own. */
SW.categories = [
  { id:'tiling',       name:'Tile Installation', img:'app-bathroom',
    note:'Adhesives, grout, sealer', products:['adhesiveSuper','adhesiveSuperPlus','adhesiveUltraGrip','adhesiveUltraGripWhite','groutPolymer','groutSuperPolymer','groutSealer'] },
  { id:'waterproofing',name:'Waterproofing',     img:'app-bathroom',
    note:'Aqua Shield 2K, SW 101, silicone', products:['aquaShield','sw101','silicone'] },
  { id:'walls',        name:'Wall Finishing',    img:'hero-living',
    note:'Skim Coat', products:['skimPremium','skimDeluxe'] },
  { id:'flooring',     name:'Wooden Flooring',   img:'app-flooring',
    note:'Swissparkett', products:['swissparkett'] },
  { id:'roofing',      name:'Roofing',           img:'app-roofing',
    note:'Roof Master range', products:[] },
  { id:'pebbles',      name:'Decorative Pebbles',img:'app-pebbles',
    note:'Landscaping', products:[] }
];

SW.img = function(name){ return SW.base + 'assets/img/products/' + name + '.webp'; };
SW.scene = function(name){ return SW.base + 'assets/img/scenes/' + name + '.webp'; };
SW.base = '';

/* ==========================================================================
   SWISSTEK ALUMINIUM
   swisstekaluminium.com. Aluminium extrusion manufacturer, subsidiary of
   Vallibel One PLC and LANKATILES PLC. Positioning quoted from their site:
   "precision-engineered, sustainable aluminium extrusions".
   Category and product names are verbatim from their products page.
   ========================================================================== */

SW.aluminium = {
  blurb: 'Precision engineered, sustainable aluminium extrusions, manufactured in ' +
         'Sri Lanka for global markets.',
  classes: ['Premium Class', 'Superior Class', 'Classic Class'],
  categories: [
    { id:'alu-arch', name:'Architectural', scene:'aluarch',
      note:'Windows, doors, partitions, curtain wall',
      products:['Swing Windows','Curtain Wall','Folding Doors','Glass Partition',
                'Kitchen Cupboards','Louvers','Office Partitions','Panel Doors',
                'Shop Fronts','Sliding Doors Windows','Swing Doors','Tile Skirtings',
                'Tilt Turn Windows'] },
    { id:'alu-hardware', name:'Hardware', scene:'aluhouse',
      note:'Angles, tubes, channels, plates',
      products:['Thin Angles','Thick Angles','Tubes (Square/Rectangular)','Round Tube',
                'Plates','Channels','Double Channels','Rung Ladders'] },
    { id:'alu-household', name:'Household', scene:'aluhouse',
      note:'Ladders, tables, racks, prefabricated doors',
      products:['Outdoor Tables & Chairs','Foldable Tables','Shoe Racks',
                'Multi Purpose Ladders','Step Ladders','Pre-fabricated Fanlight Windows',
                'Pre-fabricated Bathroom Doors','Pre-fabricated Panel Doors'] },
    { id:'alu-solar', name:'Solar Structures', scene:'aluarch',
      note:'Roof, ground and floating mounted',
      products:['Roof Mounted Structures','Ground Mounted Structures',
                'Floating Mounted Structures'] }
  ],
  /* Sliding door systems named on their sliding doors and windows page. */
  systems:['SA 3000 (C-Groove)','SA 5000 (SLIMLINE)','SA 2000 (C-Groove)',
           'S100c (C-Groove)','S113 Lift & Slide','S98 Comdoor','S80 Lite',
           '100mm (Comdoor)']
};

/* The three collections Swisstek actually organises the range around,
   as shown on swisstekceylon.com. */
SW.collections = [
  { id:'finishing', name:'Finishing Collection', scene:'app-bathroom',
    note:'Everything between the substrate and the surface',
    products:['adhesiveSuper','adhesiveSuperPlus','adhesiveUltraGrip',
              'adhesiveUltraGripWhite','groutPolymer','groutSuperPolymer',
              'groutSealer','sw101','aquaShield','silicone','skimPremium','skimDeluxe'] },
  { id:'cleaning', name:'Cleaning Collection', scene:'hero-living',
    note:'Tile Cleaner', products:[] },
  { id:'beautification', name:'Beautification Collection', scene:'app-pebbles',
    note:'Decorative Pebbles', products:[] }
];

/* Verbatim from swisstekceylon.com. Quoted, not paraphrased. */
SW.site = {
  heroSlides: [
    'Bring your dream space to life.',
    'Experience elegance of luxury spaces.',
    'Indulge in the comfort of luxury living.'
  ],
  welcomeHeading: 'Welcome to SWISSTEK',
  welcomeBody: "In Sri Lanka's construction industry, Swisstek is a company like no " +
    'other. With an unmatchable range of products that are all ISO certified, we are ' +
    'the only Ceylonese company to have secured the SLS Certification for Tile Mortar ' +
    'and Tile Grout.',
  tilerClub: { heading:'Connect With an Industry Expert', cta:'Find Expert' },
  news: [
    'Swisstek at the forefront of transparent prices in local hardware sector',
    'Daminda Perera Takes the Helm as Group Managing Director at Swisstek',
    'Swisstek Strengthens Community Impact with Vidyartha Rugby Development Camp at Mahiyanganaya'
  ],
  testimonials: [
    { q:'One of the biggest reasons for me to choose Swisstek is their thorough knowledge of the products.',
      n:'Jehan De Silva', r:'Architect' },
    { q:"I've been using Swisstek tile mortar for many years now, It makes my life so much easier.",
      n:'V. Shivakuma', r:'Tiler' },
    { q:'With a vast distribution channel Swisstek products are available any part of the island.',
      n:'Pubudu Jayakodi', r:'Contractor' }
  ]
};

/* ==========================================================================
   FILM LIBRARY

   Every entry below was read off Swisstek's own two YouTube channels on
   2 August 2026 and each video id was confirmed against YouTube's oEmbed
   endpoint, so nothing here is a guessed id. `t` is the video's exact
   published title, reproduced verbatim; `n` is a short display label written
   for this interface. No product name, code or figure has been invented.

   Channels
     Swisstek Ceylon PLC     youtube.com/channel/UCIfyjrma94XmCxih8oBkAvQ
     Swisstek Aluminium      youtube.com/channel/UCZTGB-rrjQZITMIyJnmYVbw

   Not found on either channel, so deliberately left empty rather than
   substituted: Swissparkett wooden flooring, general purpose silicone,
   Roof Master roofing, decorative pebbles.
   ========================================================================== */

SW.films = {
  /* ---- Swisstek Ceylon PLC -------------------------------------------- */
  'eqU80nfWyyg': { n:'SW 101 Epoxy Grout, full application',  t:'SWISSTEK- SW 101 (Epoxy Grout).',
                   d:'7:23', l:'EN', k:'Usage guide', c:'Swisstek Ceylon PLC' },
  'ItmThsr4_34': { n:'SW 101 Epoxy Grout, Sinhala',           t:'Swisstek ටයිල් සීලන්ට් (ඒපොක්සි ටයිල් ග්‍රවුට්)',
                   d:'3:44', l:'SI', k:'Usage guide', c:'Swisstek Ceylon PLC' },
  'f4qmNnk5ifQ': { n:'Aqua Shield 2K, full application',      t:'Swisstek Aqua Shield 2K Waterproofer - English',
                   d:'6:07', l:'EN', k:'Usage guide', c:'Swisstek Ceylon PLC' },
  'Ldq0XqJUYJ4': { n:'Aqua Shield 2K, Tamil',                 t:'Swisstek Aqua Shield 2K Waterproofer - Tamil',
                   d:'6:07', l:'TA', k:'Usage guide', c:'Swisstek Ceylon PLC' },
  'dGiQhV3QQyw': { n:'Aqua Shield 2K on site',                t:'Swisstek Aqua Shield 2K Waterproofer',
                   d:'6:21', l:'EN', k:'Demonstration', c:'Swisstek Ceylon PLC' },
  '7H97GkCPg9c': { n:'Aqua Shield 2K, television spot',       t:'Swisstek Aqua Shield 2K Waterproofer - Chooty Malli Podi Malli',
                   d:'1:13', l:'SI', k:'Brand film', c:'Swisstek Ceylon PLC' },
  'J07dLagu-qs': { n:'Skim Coat, product film',               t:'SWISSTEK SKIM COAT',
                   d:'0:46', l:'EN', k:'Product film', c:'Swisstek Ceylon PLC' },
  'XbvSZNYLs5g': { n:'Skim Coat, television spot',            t:'Swisstek Skim Coat - Chooty Malli Podi Malli',
                   d:'1:04', l:'SI', k:'Brand film', c:'Swisstek Ceylon PLC' },
  'm04vVKkLLKU': { n:'Tile Adhesive, product film',           t:'SWISSTEK TILE ADHESIVE',
                   d:'0:46', l:'EN', k:'Product film', c:'Swisstek Ceylon PLC' },
  '5PdVVdPfiHc': { n:'Tile Adhesive, television spot',        t:'Swisstek Tile Adhesive - Chooty Malli Podi Malli',
                   d:'0:55', l:'SI', k:'Brand film', c:'Swisstek Ceylon PLC' },
  'GW_RhODQq6o': { n:'Mixing and laying, 30 minute set',      t:'Swisstek Tile Mortar',
                   d:'3:47', l:'SI', k:'Demonstration', c:'Swisstek Ceylon PLC' },
  '5S0rKs5OhmQ': { n:'Tile grout, Sinhala',                   t:'Swisstek ටයිල් ග්‍රවුට්',
                   d:'',     l:'SI', k:'Product film', c:'Swisstek Ceylon PLC' },
  'g9Fn4gdpw5I': { n:'Grout Sealer, applicator tip',          t:'Swisstek Grout Sealer',
                   d:'0:07', l:'EN', k:'Product film', c:'Swisstek Ceylon PLC' },
  'nXDs3FIfR1k': { n:'Grout Sealer, Sinhala',                 t:'Swisstek ග්‍රවුට් සීලර්',
                   d:'',     l:'SI', k:'Product film', c:'Swisstek Ceylon PLC' },
  'jC-xE_bTvZA': { n:'Quick Flow, poured and levelled',       t:'Swisstek Quick Flow',
                   d:'4:38', l:'EN', k:'Demonstration', c:'Swisstek Ceylon PLC' },

  /* ---- Swisstek Aluminium --------------------------------------------- */
  'uMUtQXLY6Hg': { n:'Engineered for what matters',           t:'Swisstek. Engineered for what matters!',
                   d:'0:35', l:'EN', k:'Brand film', c:'Swisstek Aluminium' },
  'GcCKjc_Z7p8': { n:'Inside the Reality Centre',             t:'The Journey through Swisstek Aluminium Reality Centre',
                   d:'',     l:'EN', k:'Showroom tour', c:'Swisstek Aluminium' },
  '6p90M-uI8Ck': { n:'Inside the Design Studio',              t:'Step Inside the Swisstek Design Studio | Modern Aluminium Solutions in Sri Lanka',
                   d:'2:46', l:'EN', k:'Showroom tour', c:'Swisstek Aluminium' },
  'hxWPQdFEhyQ': { n:'Architect 2026 stand',                  t:'Swisstek at Architect 2026 | Innovation, Precision & Performance',
                   d:'2:44', l:'EN', k:'Brand film', c:'Swisstek Aluminium' },
  'zOxLlZKW68k': { n:'SLIMLINE, style and function',          t:'Swisstek Aluminium SLIMLINE - The Ultimate Blend of Style and Functionality',
                   d:'',     l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  '8TnnjBvieN4': { n:'SLIMLINE sliding doors',                t:'SLIMLINE SEIRES Sliding Doors',
                   d:'',     l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'LOVKS94r8ro': { n:'The Superior Class range',              t:"Introducing Swisstek Aluminium's Superior Class!",
                   d:'',     l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'VsUFff75q18': { n:'Fabrication, sliding and folding doors',t:'Fabrication of Sliding & Folding Doors from Swisstek Aluminium',
                   d:'',     l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'Oz0uZ6oV3Fs': { n:'Fabrication, 100mm sliding doors',      t:'Fabrication of 100mm Sliding doors from Swisstek Aluminium',
                   d:'2:34', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'IrxY3DwxboQ': { n:'Fabrication, 100mm triple track window',t:'Fabrication of 100mm Sliding Triple Track Window from Swisstek Aluminium',
                   d:'2:30', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'wv4XCS7rA0w': { n:'Fabrication, 76mm panel door',          t:'Fabrication of 76 mm Panel Door from Swisstek Aluminium',
                   d:'2:26', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'hLHkGltWO6s': { n:'Fabrication, 72mm sliding window',      t:'Fabrication of 72mm Sliding Window from Swisstek Aluminium',
                   d:'2:36', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'qNTuAFG7dSk': { n:"Fabrication, 50mm 'c' casement window", t:"Fabrication of 50mm 'c' Grove Casement Window from Swisstek Aluminium",
                   d:'1:41', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'NCYbkSAO-0Y': { n:"Fabrication, 50mm 'c' groove door",     t:"Fabrication of 50mm 'c' Groove Door from Swisstek Aluminium",
                   d:'1:11', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'vMGPGHeOShM': { n:'Fabrication, 50mm tilt and turn window',t:'Fabrication of a 50 mm Grove Tilt & Turn Window from Swisstek Aluminium',
                   d:'2:12', l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'Dsw0cGX3mzg': { n:'Fabrication, pantry cupboards',         t:'Fabrications - Pantry Cupboards',
                   d:'',     l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  '2o63lzVpWl8': { n:'Fabrication, fly screen window',        t:'Fabrications - Fly Screen Window',
                   d:'',     l:'EN', k:'Fabrication guide', c:'Swisstek Aluminium' },
  'C6VnPSzFdYo': { n:'Pre-fabricated bathroom doors',         t:'SWISSTEK Aluminium | Bathroom Doors - English Version',
                   d:'2:40', l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'JUaOXvq0Pd0': { n:'Pre-fabricated fanlight windows',       t:'SWISSTEK Aluminium | Fanlight Windows - English Version',
                   d:'2:29', l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'LpHcsmYRI8o': { n:'Kitchen cabinets',                      t:'Swisstek Aluminium Kitchen Cabinets | English Version',
                   d:'2:58', l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  '2gikPcAzthY': { n:'Multi purpose ladders',                 t:'Swisstek Aluminium Multi-Purpose Ladders',
                   d:'',     l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'p6VFdJe73s4': { n:'Ground mount solar accessories',        t:'Swisstek Aluminium Introducing New Ground Mount Solar Accessories | English Version',
                   d:'',     l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'AaSWuCXuYFA': { n:'Solar structures',                      t:'Swisstek Solar Structure - Engineered for Dependability',
                   d:'',     l:'EN', k:'Product film', c:'Swisstek Aluminium' },
  'G-SBPFiI3r8': { n:'Installing a tile skirting',            t:'How to Install a Swisstek Tile Skirting - Sinhala',
                   d:'',     l:'SI', k:'Usage guide', c:'Swisstek Aluminium' }
};

/* Films attached to a product record. A film is listed against a product only
   where the published title names that product. Where Swisstek has published
   a film about a range we do not hold a verified product record for, it is
   attached to the space instead, never to a product it does not name. */
SW.productFilms = {
  sw101:                 ['eqU80nfWyyg', 'ItmThsr4_34'],
  aquaShield:            ['f4qmNnk5ifQ', 'dGiQhV3QQyw', 'Ldq0XqJUYJ4', '7H97GkCPg9c'],
  skimPremium:           ['J07dLagu-qs', 'XbvSZNYLs5g'],
  skimDeluxe:            ['J07dLagu-qs', 'XbvSZNYLs5g'],
  adhesiveSuper:         ['m04vVKkLLKU', '5PdVVdPfiHc'],
  adhesiveSuperPlus:     ['m04vVKkLLKU', '5PdVVdPfiHc'],
  adhesiveUltraGrip:     ['m04vVKkLLKU', '5PdVVdPfiHc'],
  adhesiveUltraGripWhite:['m04vVKkLLKU', '5PdVVdPfiHc'],
  groutPolymer:          ['5S0rKs5OhmQ'],
  groutSuperPolymer:     ['5S0rKs5OhmQ'],
  groutSealer:           ['g9Fn4gdpw5I', 'nXDs3FIfR1k']
};

/* Films attached to a space. Empty arrays are left in place on purpose: they
   are the spaces where Swisstek has not published a film, and the interface
   says so rather than borrowing one from a neighbouring range. */
SW.spaceFilms = {
  atrium:   ['uMUtQXLY6Hg', 'GcCKjc_Z7p8', '6p90M-uI8Ck', 'hxWPQdFEhyQ'],
  tiling:   ['GW_RhODQq6o', 'm04vVKkLLKU', '5PdVVdPfiHc', '5S0rKs5OhmQ', 'G-SBPFiI3r8'],
  wetarea:  ['eqU80nfWyyg', 'f4qmNnk5ifQ', 'dGiQhV3QQyw', 'Ldq0XqJUYJ4', 'ItmThsr4_34', '7H97GkCPg9c'],
  walls:    ['J07dLagu-qs', 'XbvSZNYLs5g'],
  flooring: ['jC-xE_bTvZA'],
  roofing:  [],
  pebbles:  [],
  aluarch:  ['Oz0uZ6oV3Fs', 'IrxY3DwxboQ', 'hLHkGltWO6s', 'wv4XCS7rA0w', 'VsUFff75q18',
             'qNTuAFG7dSk', 'NCYbkSAO-0Y', 'vMGPGHeOShM', 'zOxLlZKW68k', '8TnnjBvieN4', 'LOVKS94r8ro'],
  aluhouse: ['C6VnPSzFdYo', 'JUaOXvq0Pd0', 'LpHcsmYRI8o', 'Dsw0cGX3mzg', '2o63lzVpWl8',
             '2gikPcAzthY', 'AaSWuCXuYFA', 'p6VFdJe73s4'],
  specdesk: ['uMUtQXLY6Hg', 'GcCKjc_Z7p8']
};
