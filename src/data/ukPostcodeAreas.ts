export interface PostcodeAreaInfo {
  code: string;
  name: string;
  town: string;
  county: string;
  country: 'England' | 'Wales' | 'Scotland';
  sampleStreet?: string;
}

export const ENGLAND_POSTCODE_AREAS: PostcodeAreaInfo[] = [
  { code: 'B', name: 'Birmingham', town: 'Birmingham', county: 'West Midlands', country: 'England', sampleStreet: 'Bull Ring' },
  { code: 'BA', name: 'Bath', town: 'Bath', county: 'Somerset', country: 'England', sampleStreet: 'Great Pulteney Street' },
  { code: 'BB', name: 'Blackburn', town: 'Blackburn', county: 'Lancashire', country: 'England', sampleStreet: 'Preston New Road' },
  { code: 'BD', name: 'Bradford', town: 'Bradford', county: 'West Yorkshire', country: 'England', sampleStreet: 'Manningham Lane' },
  { code: 'BH', name: 'Bournemouth', town: 'Bournemouth', county: 'Dorset', country: 'England', sampleStreet: 'Exeter Road' },
  { code: 'BL', name: 'Bolton', town: 'Bolton', county: 'Greater Manchester', country: 'England', sampleStreet: 'Deansgate' },
  { code: 'BN', name: 'Brighton', town: 'Brighton', county: 'East Sussex', country: 'England', sampleStreet: 'Grand Parade' },
  { code: 'BR', name: 'Bromley', town: 'Bromley', county: 'Greater London', country: 'England', sampleStreet: 'High Street' },
  { code: 'BS', name: 'Bristol', town: 'Bristol', county: 'Bristol', country: 'England', sampleStreet: 'Baldwin Street' },
  { code: 'CA', name: 'Carlisle', town: 'Carlisle', county: 'Cumbria', country: 'England', sampleStreet: 'Lowther Street' },
  { code: 'CB', name: 'Cambridge', town: 'Cambridge', county: 'Cambridgeshire', country: 'England', sampleStreet: 'Regent Street' },
  { code: 'CH', name: 'Chester', town: 'Chester', county: 'Cheshire', country: 'England', sampleStreet: 'Watergate Street' },
  { code: 'CM', name: 'Chelmsford', town: 'Chelmsford', county: 'Essex', country: 'England', sampleStreet: 'High Street' },
  { code: 'CO', name: 'Colchester', town: 'Colchester', county: 'Essex', country: 'England', sampleStreet: 'High Street' },
  { code: 'CR', name: 'Croydon', town: 'Croydon', county: 'Greater London', country: 'England', sampleStreet: 'George Street' },
  { code: 'CT', name: 'Canterbury', town: 'Canterbury', county: 'Kent', country: 'England', sampleStreet: 'St Peters Street' },
  { code: 'CV', name: 'Coventry', town: 'Coventry', county: 'Warwickshire', country: 'England', sampleStreet: 'Broadgate' },
  { code: 'CW', name: 'Crewe', town: 'Crewe', county: 'Cheshire', country: 'England', sampleStreet: 'Macon Way' },
  { code: 'DA', name: 'Dartford', town: 'Dartford', county: 'Kent', country: 'England', sampleStreet: 'Lowfield Street' },
  { code: 'DE', name: 'Derby', town: 'Derby', county: 'Derbyshire', country: 'England', sampleStreet: 'Friar Gate' },
  { code: 'DH', name: 'Durham', town: 'Durham', county: 'County Durham', country: 'England', sampleStreet: 'Saddler Street' },
  { code: 'DL', name: 'Darlington', town: 'Darlington', county: 'County Durham', country: 'England', sampleStreet: 'High Row' },
  { code: 'DN', name: 'Doncaster', town: 'Doncaster', county: 'South Yorkshire', country: 'England', sampleStreet: 'St Sepulchre Gate' },
  { code: 'DT', name: 'Dorchester', town: 'Dorchester', county: 'Dorset', country: 'England', sampleStreet: 'High West Street' },
  { code: 'DY', name: 'Dudley', town: 'Dudley', county: 'West Midlands', country: 'England', sampleStreet: 'High Street' },
  { code: 'E', name: 'East London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'Whitechapel Road' },
  { code: 'EC', name: 'City of London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'Lombard Street' },
  { code: 'EN', name: 'Enfield', town: 'Enfield', county: 'Greater London', country: 'England', sampleStreet: 'London Road' },
  { code: 'EX', name: 'Exeter', town: 'Exeter', county: 'Devon', country: 'England', sampleStreet: 'High Street' },
  { code: 'FY', name: 'Blackpool', town: 'Blackpool', county: 'Lancashire', country: 'England', sampleStreet: 'Promenade' },
  { code: 'GL', name: 'Gloucester', town: 'Gloucester', county: 'Gloucestershire', country: 'England', sampleStreet: 'Southgate Street' },
  { code: 'GU', name: 'Guildford', town: 'Guildford', county: 'Surrey', country: 'England', sampleStreet: 'High Street' },
  { code: 'HA', name: 'Harrow', town: 'Harrow', county: 'Greater London', country: 'England', sampleStreet: 'Station Road' },
  { code: 'HD', name: 'Huddersfield', town: 'Huddersfield', county: 'West Yorkshire', country: 'England', sampleStreet: 'New Street' },
  { code: 'HG', name: 'Harrogate', town: 'Harrogate', county: 'North Yorkshire', country: 'England', sampleStreet: 'Prospect Place' },
  { code: 'HP', name: 'Hemel Hempstead', town: 'Hemel Hempstead', county: 'Hertfordshire', country: 'England', sampleStreet: 'Marlowes' },
  { code: 'HR', name: 'Hereford', town: 'Hereford', county: 'Herefordshire', country: 'England', sampleStreet: 'High Town' },
  { code: 'HU', name: 'Hull', town: 'Kingston upon Hull', county: 'East Riding of Yorkshire', country: 'England', sampleStreet: 'Anlaby Road' },
  { code: 'HX', name: 'Halifax', town: 'Halifax', county: 'West Yorkshire', country: 'England', sampleStreet: 'Commercial Street' },
  { code: 'IG', name: 'Ilford', town: 'Ilford', county: 'Greater London', country: 'England', sampleStreet: 'Cranbrook Road' },
  { code: 'IP', name: 'Ipswich', town: 'Ipswich', county: 'Suffolk', country: 'England', sampleStreet: 'Tavern Street' },
  { code: 'KT', name: 'Kingston upon Thames', town: 'Kingston upon Thames', county: 'Greater London', country: 'England', sampleStreet: 'Clarence Street' },
  { code: 'L', name: 'Liverpool', town: 'Liverpool', county: 'Merseyside', country: 'England', sampleStreet: 'Lord Street' },
  { code: 'LA', name: 'Lancaster', town: 'Lancaster', county: 'Lancashire', country: 'England', sampleStreet: 'Market Street' },
  { code: 'LE', name: 'Leicester', town: 'Leicester', county: 'Leicestershire', country: 'England', sampleStreet: 'Belgrave Gate' },
  { code: 'LN', name: 'Lincoln', town: 'Lincoln', county: 'Lincolnshire', country: 'England', sampleStreet: 'High Street' },
  { code: 'LS', name: 'Leeds', town: 'Leeds', county: 'West Yorkshire', country: 'England', sampleStreet: 'Briggate' },
  { code: 'LU', name: 'Luton', town: 'Luton', county: 'Bedfordshire', country: 'England', sampleStreet: 'George Street' },
  { code: 'M', name: 'Manchester', town: 'Manchester', county: 'Greater Manchester', country: 'England', sampleStreet: 'Market Street' },
  { code: 'ME', name: 'Medway', town: 'Chatham', county: 'Kent', country: 'England', sampleStreet: 'High Street' },
  { code: 'MK', name: 'Milton Keynes', town: 'Milton Keynes', county: 'Buckinghamshire', country: 'England', sampleStreet: 'Midsummer Boulevard' },
  { code: 'N', name: 'North London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'Upper Street' },
  { code: 'NE', name: 'Newcastle upon Tyne', town: 'Newcastle upon Tyne', county: 'Tyne and Wear', country: 'England', sampleStreet: 'Grey Street' },
  { code: 'NG', name: 'Nottingham', town: 'Nottingham', county: 'Nottinghamshire', country: 'England', sampleStreet: 'Clumber Street' },
  { code: 'NN', name: 'Northampton', town: 'Northampton', county: 'Northamptonshire', country: 'England', sampleStreet: 'Abington Street' },
  { code: 'NR', name: 'Norwich', town: 'Norwich', county: 'Norfolk', country: 'England', sampleStreet: 'Gentleman\'s Walk' },
  { code: 'NW', name: 'North West London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'Finchley Road' },
  { code: 'OL', name: 'Oldham', town: 'Oldham', county: 'Greater Manchester', country: 'England', sampleStreet: 'Yorkshire Street' },
  { code: 'OX', name: 'Oxford', town: 'Oxford', county: 'Oxfordshire', country: 'England', sampleStreet: 'Broad Street' },
  { code: 'PE', name: 'Peterborough', town: 'Peterborough', county: 'Cambridgeshire', country: 'England', sampleStreet: 'Bridge Street' },
  { code: 'PL', name: 'Plymouth', town: 'Plymouth', county: 'Devon', country: 'England', sampleStreet: 'Armada Way' },
  { code: 'PO', name: 'Portsmouth', town: 'Portsmouth', county: 'Hampshire', country: 'England', sampleStreet: 'Commercial Road' },
  { code: 'PR', name: 'Preston', town: 'Preston', county: 'Lancashire', country: 'England', sampleStreet: 'Fishergate' },
  { code: 'RG', name: 'Reading', town: 'Reading', county: 'Berkshire', country: 'England', sampleStreet: 'Broad Street' },
  { code: 'RH', name: 'Redhill', town: 'Redhill', county: 'Surrey', country: 'England', sampleStreet: 'Station Road' },
  { code: 'RM', name: 'Romford', town: 'Romford', county: 'Greater London', country: 'England', sampleStreet: 'South Street' },
  { code: 'S', name: 'Sheffield', town: 'Sheffield', county: 'South Yorkshire', country: 'England', sampleStreet: 'Fargate' },
  { code: 'SE', name: 'South East London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'Rye Lane' },
  { code: 'SG', name: 'Stevenage', town: 'Stevenage', county: 'Hertfordshire', country: 'England', sampleStreet: 'Queensway' },
  { code: 'SK', name: 'Stockport', town: 'Stockport', county: 'Greater Manchester', country: 'England', sampleStreet: 'Merseyway' },
  { code: 'SL', name: 'Slough', town: 'Slough', county: 'Berkshire', country: 'England', sampleStreet: 'High Street' },
  { code: 'SM', name: 'Sutton', town: 'Sutton', county: 'Greater London', country: 'England', sampleStreet: 'High Street' },
  { code: 'SN', name: 'Swindon', town: 'Swindon', county: 'Wiltshire', country: 'England', sampleStreet: 'Regent Street' },
  { code: 'SO', name: 'Southampton', town: 'Southampton', county: 'Hampshire', country: 'England', sampleStreet: 'Above Bar Street' },
  { code: 'SP', name: 'Salisbury', town: 'Salisbury', county: 'Wiltshire', country: 'England', sampleStreet: 'Silver Street' },
  { code: 'SR', name: 'Sunderland', town: 'Sunderland', county: 'Tyne and Wear', country: 'England', sampleStreet: 'Fawcett Street' },
  { code: 'SS', name: 'Southend-on-Sea', town: 'Southend-on-Sea', county: 'Essex', country: 'England', sampleStreet: 'High Street' },
  { code: 'ST', name: 'Stoke-on-Trent', town: 'Stoke-on-Trent', county: 'Staffordshire', country: 'England', sampleStreet: 'Piccadilly' },
  { code: 'SW', name: 'South West London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'King\'s Road' },
  { code: 'TA', name: 'Taunton', town: 'Taunton', county: 'Somerset', country: 'England', sampleStreet: 'Fore Street' },
  { code: 'TD', name: 'TD (Borders)', town: 'Berwick-upon-Tweed', county: 'Northumberland', country: 'England', sampleStreet: 'Marygate' },
  { code: 'TF', name: 'Telford', town: 'Telford', county: 'Shropshire', country: 'England', sampleStreet: 'Telford Centre' },
  { code: 'TN', name: 'Tunbridge Wells', town: 'Royal Tunbridge Wells', county: 'Kent', country: 'England', sampleStreet: 'The Pantiles' },
  { code: 'TQ', name: 'Torquay', town: 'Torquay', county: 'Devon', country: 'England', sampleStreet: 'Fleet Street' },
  { code: 'TR', name: 'Truro', town: 'Truro', county: 'Cornwall', country: 'England', sampleStreet: 'Lemon Street' },
  { code: 'TS', name: 'Teesside', town: 'Middlesbrough', county: 'North Yorkshire', country: 'England', sampleStreet: 'Linthorpe Road' },
  { code: 'TW', name: 'Twickenham', town: 'Twickenham', county: 'Greater London', country: 'England', sampleStreet: 'Church Street' },
  { code: 'UB', name: 'Uxbridge', town: 'Uxbridge', county: 'Greater London', country: 'England', sampleStreet: 'High Street' },
  { code: 'W', name: 'West London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'Oxford Street' },
  { code: 'WA', name: 'Warrington', town: 'Warrington', county: 'Cheshire', country: 'England', sampleStreet: 'Bridge Street' },
  { code: 'WC', name: 'Central London', town: 'London', county: 'Greater London', country: 'England', sampleStreet: 'High Holborn' },
  { code: 'WD', name: 'Watford', town: 'Watford', county: 'Hertfordshire', country: 'England', sampleStreet: 'High Street' },
  { code: 'WF', name: 'Wakefield', town: 'Wakefield', county: 'West Yorkshire', country: 'England', sampleStreet: 'Kirkgate' },
  { code: 'WN', name: 'Wigan', town: 'Wigan', county: 'Greater Manchester', country: 'England', sampleStreet: 'Standishgate' },
  { code: 'WR', name: 'Worcester', town: 'Worcester', county: 'Worcestershire', country: 'England', sampleStreet: 'High Street' },
  { code: 'WS', name: 'Walsall / Solihull', town: 'Solihull', county: 'West Midlands', country: 'England', sampleStreet: 'High Street' },
  { code: 'WV', name: 'Wolverhampton', town: 'Wolverhampton', county: 'West Midlands', country: 'England', sampleStreet: 'Dudley Street' }
];

export const WALES_POSTCODE_AREAS: PostcodeAreaInfo[] = [
  { code: 'CF', name: 'Cardiff', town: 'Cardiff', county: 'Glamorgan', country: 'Wales', sampleStreet: 'St Mary Street' },
  { code: 'CH', name: 'Chester (Flintshire part)', town: 'Deeside', county: 'Flintshire', country: 'Wales', sampleStreet: 'Chester Road' },
  { code: 'LD', name: 'Llandrindod Wells', town: 'Llandrindod Wells', county: 'Powys', country: 'Wales', sampleStreet: 'Middleton Street' },
  { code: 'LL', name: 'Llandudno', town: 'Llandudno', county: 'Conwy', country: 'Wales', sampleStreet: 'Mostyn Street' },
  { code: 'NP', name: 'Newport', town: 'Newport', county: 'Gwent', country: 'Wales', sampleStreet: 'Commercial Street' },
  { code: 'SA', name: 'Swansea', town: 'Swansea', county: 'West Glamorgan', country: 'Wales', sampleStreet: 'Wind Street' },
  { code: 'SY', name: 'Shrewsbury (Powys part)', town: 'Welshpool', county: 'Powys', country: 'Wales', sampleStreet: 'Broad Street' },
  { code: 'TD', name: 'TD (Borders part)', town: 'Galashiels', county: 'Borders', country: 'Wales', sampleStreet: 'High Street' }
];

export const SCOTLAND_POSTCODE_AREAS: PostcodeAreaInfo[] = [
  { code: 'AB', name: 'Aberdeen', town: 'Aberdeen', county: 'Aberdeenshire', country: 'Scotland', sampleStreet: 'Union Street' },
  { code: 'DD', name: 'Dundee', town: 'Dundee', county: 'Angus', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'DG', name: 'Dumfries', town: 'Dumfries', county: 'Dumfries and Galloway', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'EH', name: 'Edinburgh', town: 'Edinburgh', county: 'Midlothian', country: 'Scotland', sampleStreet: 'Princes Street' },
  { code: 'FK', name: 'Falkirk', town: 'Falkirk', county: 'Stirlingshire', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'G', name: 'Glasgow', town: 'Glasgow', county: 'Lanarkshire', country: 'Scotland', sampleStreet: 'George Square' },
  { code: 'HS', name: 'Outer Hebrides', town: 'Stornoway', county: 'Western Isles', country: 'Scotland', sampleStreet: 'Cromwell Street' },
  { code: 'IV', name: 'Inverness', town: 'Inverness', county: 'Highland', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'KA', name: 'Kilmarnock', town: 'Kilmarnock', county: 'Ayrshire', country: 'Scotland', sampleStreet: 'King Street' },
  { code: 'KW', name: 'Kirkwall', town: 'Kirkwall', county: 'Orkney', country: 'Scotland', sampleStreet: 'Albert Street' },
  { code: 'KY', name: 'Kirkcaldy', town: 'Kirkcaldy', county: 'Fife', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'ML', name: 'Motherwell', town: 'Motherwell', county: 'Lanarkshire', country: 'Scotland', sampleStreet: 'Brandon Parade' },
  { code: 'PA', name: 'Paisley', town: 'Paisley', county: 'Renfrewshire', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'PH', name: 'Perth', town: 'Perth', county: 'Perthshire', country: 'Scotland', sampleStreet: 'High Street' },
  { code: 'ZE', name: 'Shetland', town: 'Lerwick', county: 'Shetland Islands', country: 'Scotland', sampleStreet: 'Commercial Street' }
];

export const ALL_UK_POSTCODE_AREAS: PostcodeAreaInfo[] = [
  ...ENGLAND_POSTCODE_AREAS,
  ...WALES_POSTCODE_AREAS,
  ...SCOTLAND_POSTCODE_AREAS
];

/**
 * Format any user inputted postcode string into standard UK uppercase format (e.g. sw1a1aa -> SW1A 1AA)
 */
export function formatPostcode(postcode: string): string {
  if (!postcode) return '';
  const clean = postcode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length > 4 && !clean.includes(' ')) {
    return clean.slice(0, clean.length - 3) + ' ' + clean.slice(clean.length - 3);
  }
  return clean;
}

/**
 * Look up postcode details based on entered postcode string or prefix
 */
export function lookupUkPostcodeArea(postcodeStr: string): PostcodeAreaInfo | undefined {
  if (!postcodeStr) return undefined;
  const clean = postcodeStr.trim().toUpperCase().replace(/\s+/g, '');
  
  // Try 2-letter prefix match first (e.g. SW, EH, CF, B1 -> B)
  const twoLetterMatch = clean.match(/^[A-Z]{2}/)?.[0];
  if (twoLetterMatch) {
    const found = ALL_UK_POSTCODE_AREAS.find(a => a.code === twoLetterMatch);
    if (found) return found;
  }

  // Try 1-letter prefix match (e.g. B, E, G, L, M, N, S, W)
  const oneLetterMatch = clean.match(/^[A-Z]{1}/)?.[0];
  if (oneLetterMatch) {
    const found = ALL_UK_POSTCODE_AREAS.find(a => a.code === oneLetterMatch);
    if (found) return found;
  }

  return undefined;
}
