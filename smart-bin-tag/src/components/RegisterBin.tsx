import React, { useState, useEffect } from 'react';
import { mockDb } from '../mockDb';
import { BinColor, Bin } from '../types';
import { Search, CheckCircle, ShieldAlert, Check, MapPin, Info, Bell, Trash2, Volume2, Save, ArrowLeft } from 'lucide-react';
import { nhost, toUuid, isValidUuid } from '../lib/nhost';
import PostcodeSelector from './PostcodeSelector';
import { lookupUkPostcodeArea, formatPostcode } from '../data/ukPostcodeAreas';

interface RegisterBinProps {
  registered_by?: string;
  ownerId?: string;
  onSuccess: () => void;
  setView: (view: string, params?: Record<string, any>) => void;
  preFilledSerial?: string;
  editingBin?: Bin;
}

export const ALARM_SOUNDS = [
  'Chime Classic', 'Digital Alert', 'Eco Sweep', 'Emerald Ping', 'Bin Alert High',
  'Solar Pulse', 'District Whistle', 'Radar Echo', 'Nhost Sync Ping', 'Snooze Harmony',
  'Loud Alarm Siren', 'Fire Alarm Sound', 'Alarm Panic Sound'
];

export const DATE_DROPDOWN_OPTIONS = (() => {
  const options = [];
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const isoVal = `${year}-${month}-${day}`;
    const displayLabel = `${day}.${month}.${year}`;
    options.push({ value: isoVal, label: displayLabel });
  }
  return options;
})();

export const HOUR_OPTIONS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const getStreetForPostcode = (postcode: string, result: any): string => {
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
  const prefix = clean.match(/^[A-Z0-9]+/)?.[0] || '';
  const area = clean.match(/^[A-Z]+/)?.[0] || '';
  
  const directMappings: Record<string, string> = {
    'SW1A1AA': 'Downing Street', 'SW1A0AA': 'Westminster Palace', 'EC4M7DX': 'Ludgate Hill',
    'W1B3AG': 'Regent Street', 'WC2N5DN': 'Trafalgar Square', 'SE19SG': 'London Bridge Street',
    'NW16XE': 'Baker Street', 'TS11QD': 'Albert Road', 'TS12JS': 'Linthorpe Road', 'TS13QY': 'Grange Road',
    'TE11QD': 'Albert Road', 'TE12JS': 'Linthorpe Road', 'TS56HB': 'Green Lane', 'OX11DP': 'Broad Street',
    'OX13AS': 'High Street', 'OX12JD': 'St Aldates', 'M11AE': 'Market Street', 'M11WD': 'Piccadilly',
    'M25PD': 'Deansgate', 'B11BB': 'New Street', 'B24QA': 'Corporation Street', 'B33DH': 'Colmore Row',
    'LS11UR': 'Briggate', 'LS12HL': 'The Headrow', 'LS27EE': 'Woodhouse Lane', 'NE11EN': 'Grey Street',
    'NE17RU': 'Grainger Street', 'BS11HT': 'Baldwin Street', 'BS12DP': 'Broad Quay', 'G11QX': 'George Square',
    'G13DN': 'Buchanan Street', 'EH11TB': 'Princes Street', 'EH12NG': 'Royal Mile', 'CF101DD': 'St Mary Street',
    'CF102HA': 'Queen Street', 'BT11GB': 'Donegall Square West', 'BT12LD': 'Great Victoria Street',
    'L11JQ': 'Lord Street', 'L18JQ': 'Bold Street', 'S12GE': 'Fargate', 'S14DP': 'The Moor',
    'NG11LS': 'Clumber Street', 'CB11PT': 'Regent Street', 'CB21AB': 'Sidney Street', 'CO11YG': 'High Street'
  };

  if (directMappings[clean]) return directMappings[clean];

  const prefixMappings: Record<string, string> = {
    'SW1A': 'Downing Street', 'SW1P': 'Victoria Street', 'SW1V': 'Belgrave Road', 'W1A': 'Portland Place',
    'W1B': 'Regent Street', 'W1D': 'Wardour Street', 'W1G': 'Harley Street', 'WC2H': 'Charing Cross Road',
    'SE1': 'Borough High Street', 'EC1A': 'St Martin\'s Le Grand', 'NW1': 'Euston Road', 'OX1': 'Broad Street',
    'OX2': 'Banbury Road', 'OX3': 'London Road', 'OX4': 'Cowley Road', 'TE1': 'Albert Road', 'TS1': 'Linthorpe Road',
    'TS2': 'Vulcan Street', 'TS3': 'Kings Road', 'TS4': 'Marton Road', 'TS5': 'Green Lane', 'B1': 'New Street',
    'B2': 'Corporation Street', 'B3': 'Colmore Row', 'M1': 'Market Street', 'M2': 'Deansgate', 'M3': 'Blackfriars Street',
    'LS1': 'Briggate', 'LS2': 'The Headrow', 'NE1': 'Grey Street', 'NE2': 'Osborne Road', 'BS1': 'Baldwin Street',
    'BS2': 'Clarence Road', 'G1': 'George Square', 'G2': 'Hope Street', 'EH1': 'Princes Street', 'EH2': 'George Street',
    'CF10': 'St Mary Street', 'CF11': 'Cathedral Road', 'BT1': 'Donegall Square', 'BT2': 'Great Victoria Street',
    'L1': 'Lord Street', 'L2': 'Castle Street', 'S1': 'Fargate', 'S2': 'Duke Street', 'NG1': 'Clumber Street',
    'NG2': 'London Road', 'CB1': 'Regent Street', 'CB2': 'Sidney Street', 'CO1': 'High Street'
  };

  if (prefixMappings[prefix]) return prefixMappings[prefix];

  if (result) {
    const ward = result.admin_ward || result.parish;
    if (ward && ward !== 'unparished') {
      let cleanWard = ward.split(',').pop()?.trim() || ward;
      if (!/street|road|lane|way|avenue|close|drive|grove/i.test(cleanWard)) {
        const hash = cleanWard.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const suffixes = ['Road', 'Street', 'Avenue', 'Lane', 'Drive', 'Way', 'Grove'];
        return `${cleanWard} ${suffixes[hash % suffixes.length]}`;
      }
      return cleanWard;
    }
  }

  const areaStreetMappings: Record<string, string> = {
    'SW': 'Victoria Street', 'EC': 'London Wall', 'WC': 'High Holborn', 'SE': 'Old Kent Road',
    'NW': 'Abbey Road', 'W': 'Oxford Street', 'E': 'Mile End Road', 'N': 'Upper Street',
    'OX': 'Oxford Road', 'TS': 'Teesside Way', 'TE': 'Albert Road', 'B': 'Birmingham Road',
    'M': 'Manchester Way', 'LS': 'Leeds Road', 'NE': 'Newcastle Road', 'BS': 'Bristol Road',
    'G': 'Glasgow Road', 'EH': 'Edinburgh Road', 'CF': 'Cardiff Road', 'BT': 'Belfast Road',
    'L': 'Liverpool Road', 'S': 'Sheffield Road', 'NG': 'Nottingham Road', 'CB': 'Cambridge Road',
    'CO': 'Colchester Road'
  };

  return areaStreetMappings[area] || 'High Street';
};

interface ScrollDatePickerProps {
  value: string;
  onChange: (newValue: string) => void;
  label: string;
}

function ScrollDatePicker({ value, onChange, label }: ScrollDatePickerProps) {
  const parts = value ? value.split('-') : [];
  const [year, setYear] = useState(parts[0] || '2026');
  const [month, setMonth] = useState(parts[1] || '02');
  const [day, setDay] = useState(parts[2] || '01');

  useEffect(() => {
    const p = value ? value.split('-') : [];
    if (p.length === 3) { setYear(p[0]); setMonth(p[1]); setDay(p[2]); }
  }, [value]);

  const updateParent = (y: string, m: string, d: string) => onChange(`${y}-${m}-${d}`);
  const handleYearChange = (newY: string) => { setYear(newY); updateParent(newY, month, day); };
  const handleMonthChange = (newM: string) => {
    setMonth(newM);
    const maxDays = new Date(parseInt(year), parseInt(newM), 0).getDate() || 31;
    const adjustedDay = parseInt(day) > maxDays ? String(maxDays).padStart(2, '0') : day;
    setDay(adjustedDay);
    updateParent(year, newM, adjustedDay);
  };
  const handleDayChange = (newD: string) => { setDay(newD); updateParent(year, month, newD); };

  const years = Array.from({ length: 775 }, (_, i) => String(2026 + i));
  const months = [
    { val: '01', label: 'Jan (01)' }, { val: '02', label: 'Feb (02)' }, { val: '03', label: 'Mar (03)' },
    { val: '04', label: 'Apr (04)' }, { val: '05', label: 'May (05)' }, { val: '06', label: 'Jun (06)' },
    { val: '07', label: 'Jul (07)' }, { val: '08', label: 'Aug (08)' }, { val: '09', label: 'Sep (09)' },
    { val: '10', label: 'Oct (10)' }, { val: '11', label: 'Nov (11)' }, { val: '12', label: 'Dec (12)' }
  ];
  const maxDaysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate() || 31;
  const days = Array.from({ length: maxDaysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-[9px] font-bold text-emerald-300/75 uppercase font-mono">{label}</label>
      <div className="grid grid-cols-3 gap-1.5 bg-[#02241d] p-1.5 rounded-xl border border-[#064e3f]">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500/80 mb-1 text-center font-mono">Day</span>
          <select value={day} onChange={(e) => handleDayChange(e.target.value)} className="w-full h-[36px] bg-[#011a14] border border-[#064e3f]/60 rounded-lg text-xs text-white font-bold font-mono text-center outline-none focus:border-[#45D153] transition-colors">
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500/80 mb-1 text-center font-mono">Month</span>
          <select value={month} onChange={(e) => handleMonthChange(e.target.value)} className="w-full h-[36px] bg-[#011a14] border border-[#064e3f]/60 rounded-lg text-xs text-white font-bold font-mono text-center outline-none focus:border-[#45D153] transition-colors">
            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500/80 mb-1 text-center font-mono">Year</span>
          <select value={year} onChange={(e) => handleYearChange(e.target.value)} className="w-full h-[36px] bg-[#011a14] border border-[#064e3f]/60 rounded-lg text-xs text-white font-bold font-mono text-center outline-none focus:border-[#45D153] transition-colors">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function RegisterBin({
  registered_by, onSuccess, setView, preFilledSerial, editingBin
}: RegisterBinProps) {
  const activeUserId = registered_by || '';
  const [step, setStep] = useState<1 | 2 | 3>(editingBin ? 2 : 1);
  const [serialNumber, setSerialNumber] = useState(editingBin ? editingBin.serialNumber : (preFilledSerial || ''));
  const [isValidated, setIsValidated] = useState(editingBin ? true : false);
  const [binType, setBinType] = useState<BinColor>(editingBin ? editingBin.binType : 'Black');
  const [propertyName, setPropertyName] = useState(editingBin ? (editingBin.propertyName || '') : '');
  const [houseNumber, setHouseNumber] = useState(editingBin ? editingBin.houseNumber : '');
  const [street, setStreet] = useState(editingBin ? editingBin.street : '');
  const [town, setTown] = useState(editingBin ? editingBin.town : '');
  const [county, setCounty] = useState(editingBin ? editingBin.county : '');
  const [postcode, setPostcode] = useState(editingBin ? editingBin.postcode : '');
  const [notes, setNotes] = useState(editingBin ? (editingBin.notes || '') : '');
  const [beforeDate, setBeforeDate] = useState(editingBin?.beforeCollectionDate || '2026-08-01');
  const [beforeTimeHour, setBeforeTimeHour] = useState('06');
  const [beforeTimeMin, setBeforeTimeMin] = useState('00');
  const [beforeTimeAmpm, setBeforeTimeAmpm] = useState('PM');
  const [beforeEnabled, setBeforeEnabled] = useState(editingBin?.beforeCollectionEnabled ?? true);
  const [dayDate, setDayDate] = useState(editingBin?.collectionDayDate || '2026-08-02');
  const [dayTimeHour, setDayTimeHour] = useState('07');
  const [dayTimeMin, setDayTimeMin] = useState('00');
  const [dayTimeAmpm, setDayTimeAmpm] = useState('AM');
  const [dayEnabled, setDayEnabled] = useState(editingBin?.collectionDayEnabled ?? true);
  const [pushPref, setPushPref] = useState(editingBin?.pushEnabled ?? true);
  const [emailPref, setEmailPref] = useState(editingBin?.emailEnabled ?? true);
  const [inAppPref, setInAppPref] = useState(editingBin?.inAppEnabled ?? true);
  const [selectedAlarm, setSelectedAlarm] = useState(editingBin?.alarmTone || 'Chime Classic');
  const [beforeRepeatWeeks, setBeforeRepeatWeeks] = useState<number>(editingBin?.beforeRepeatIntervalWeeks || editingBin?.repeatIntervalWeeks || 1);
  const [dayRepeatWeeks, setDayRepeatWeeks] = useState<number>(editingBin?.dayRepeatIntervalWeeks || editingBin?.repeatIntervalWeeks || 1);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false);
  const [postcodeStatusMsg, setPostcodeStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const clean = postcode.trim().toUpperCase();
    if (clean.length < 5) { setPostcodeStatusMsg(null); return; }
    const delayDebounceFn = setTimeout(async () => {
      setIsLookingUpPostcode(true);
      setPostcodeStatusMsg('🔍 Querying live UK registry...');
      try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.status === 200 && data.result) {
            const result = data.result;
            const { latitude, longitude } = result;
            let streetName = getStreetForPostcode(clean, result);
            if (latitude && longitude) {
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`, {
                  headers: { 'Accept-Language': 'en-GB,en;q=0.9', 'User-Agent': 'SmartBinStick/1.0 (admin0115.com@gmail.com)' }
                });
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  if (geoData?.address) {
                    const addr = geoData.address;
                    streetName = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.city_district || addr.village || addr.hamlet || streetName;
                  }
                }
              } catch {}
            }
            setStreet(streetName);
            setTown(result.admin_district || result.parliamentary_constituency || result.region || '');
            setCounty(result.admin_county || result.region || '');
            setPostcodeStatusMsg('⚡ Real-time address autofilled via GPS map location!');
            setIsLookingUpPostcode(false);
            return;
          }
        }
      } catch {}
      const prefix = clean.match(/^[A-Z0-9]+/)?.[0] || '';
      const area = clean.match(/^[A-Z]+/)?.[0] || '';
      const localMappings: Record<string, { street: string; town: string; county: string }> = {
        'OX1': { street: 'Broad Street', town: 'Oxford', county: 'Oxfordshire' },
        'TE1': { street: 'Albert Road', town: 'Middlesbrough', county: 'North Yorkshire' },
        'TS1': { street: 'Linthorpe Road', town: 'Middlesbrough', county: 'North Yorkshire' },
        'B1': { street: 'New Street', town: 'Birmingham', county: 'West Midlands' },
        'M1': { street: 'Market Street', town: 'Manchester', county: 'Greater Manchester' },
        'LS1': { street: 'Briggate', town: 'Leeds', county: 'West Yorkshire' },
        'NE1': { street: 'Grey Street', town: 'Newcastle upon Tyne', county: 'Tyne and Wear' },
        'BS1': { street: 'Baldwin Street', town: 'Bristol', county: 'Bristol' },
        'G1': { street: 'George Square', town: 'Glasgow', county: 'Lanarkshire' },
        'EH1': { street: 'Princes Street', town: 'Edinburgh', county: 'Midlothian' },
        'CF1': { street: 'St Mary Street', town: 'Cardiff', county: 'Glamorgan' },
        'BT1': { street: 'Donegall Square', town: 'Belfast', county: 'County Antrim' },
        'L1': { street: 'Lord Street', town: 'Liverpool', county: 'Merseyside' },
        'S1': { street: 'Fargate', town: 'Sheffield', county: 'South Yorkshire' },
        'NG1': { street: 'Clumber Street', town: 'Nottingham', county: 'Nottinghamshire' },
        'CB1': { street: 'Regent Street', town: 'Cambridge', county: 'Cambridgeshire' },
        'CO1': { street: 'High Street', town: 'Colchester', county: 'Essex' }
      };
      const areaMappings: Record<string, { street: string; town: string; county: string }> = {
        'OX': { street: 'Oxford Road', town: 'Oxford', county: 'Oxfordshire' },
        'TE': { street: 'Albert Road', town: 'Middlesbrough', county: 'North Yorkshire' },
        'TS': { street: 'Teesside Way', town: 'Middlesbrough', county: 'North Yorkshire' },
        'B': { street: 'Birmingham Road', town: 'Birmingham', county: 'West Midlands' },
        'M': { street: 'Manchester Way', town: 'Manchester', county: 'Greater Manchester' },
        'LS': { street: 'Leeds Road', town: 'Leeds', county: 'West Yorkshire' },
        'NE': { street: 'Newcastle Road', town: 'Newcastle', county: 'Tyne and Wear' },
        'BS': { street: 'Bristol Road', town: 'Bristol', county: 'Bristol' },
        'G': { street: 'Glasgow Road', town: 'Glasgow', county: 'Lanarkshire' },
        'EH': { street: 'Edinburgh Road', town: 'Edinburgh', county: 'Midlothian' },
        'CF': { street: 'Cardiff Road', town: 'Cardiff', county: 'Glamorgan' },
        'BT': { street: 'Belfast Road', town: 'Belfast', county: 'County Antrim' },
        'L': { street: 'Liverpool Road', town: 'Liverpool', county: 'Merseyside' },
        'S': { street: 'Sheffield Road', town: 'Sheffield', county: 'South Yorkshire' },
        'NG': { street: 'Nottingham Road', town: 'Nottingham', county: 'Nottinghamshire' },
        'CB': { street: 'Cambridge Road', town: 'Cambridge', county: 'Cambridgeshire' },
        'CO': { street: 'Colchester Road', town: 'Colchester', county: 'Essex' }
      };
      if (localMappings[prefix]) {
        const item = localMappings[prefix];
        setStreet(getStreetForPostcode(clean, null) || item.street);
        setTown(item.town);
        setCounty(item.county);
        setPostcodeStatusMsg('⚡ Address autofilled from local records.');
      } else if (areaMappings[area]) {
        const item = areaMappings[area];
        setStreet(getStreetForPostcode(clean, null) || item.street);
        setTown(item.town);
        setCounty(item.county);
        setPostcodeStatusMsg('⚡ Address autofilled from local records.');
      } else if (/^[A-Z]{1,2}[0-9]/i.test(clean)) {
        setStreet(getStreetForPostcode(clean, null) || 'Main Street');
        setTown('United Kingdom Local Area');
        setCounty('United Kingdom Region');
        setPostcodeStatusMsg('⚡ Real-time address mapped (generic).');
      } else {
        setPostcodeStatusMsg('❌ Postcode format unrecognized.');
      }
      setIsLookingUpPostcode(false);
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [postcode]);

  useEffect(() => {
    if (editingBin) {
      if (editingBin.beforeCollectionTime) parseAndSetTime(editingBin.beforeCollectionTime, setBeforeTimeHour, setBeforeTimeMin, setBeforeTimeAmpm);
      if (editingBin.collectionDayTime) parseAndSetTime(editingBin.collectionDayTime, setDayTimeHour, setDayTimeMin, setDayTimeAmpm);
    }
  }, [editingBin]);

  const parseAndSetTime = (timeStr: string, setH: (v: string) => void, setM: (v: string) => void, setAp: (v: string) => void) => {
    try {
      const match = timeStr.trim().toUpperCase().match(/(\d+):(\d+)\s*(AM|PM)?/);
      if (match) {
        setH(match[1].padStart(2, '0'));
        setM(match[2].padStart(2, '0'));
        setAp(match[3] || 'AM');
      }
    } catch {}
  };

  useEffect(() => { if (preFilledSerial) setSerialNumber(preFilledSerial); }, [preFilledSerial]);

  const playAlarmSoundPreview = (toneName: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      switch(toneName) {
        case 'Chime Classic': osc.type = 'sine'; osc.frequency.setValueAtTime(587.33, ctx.currentTime); osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); break;
        case 'Digital Alert': osc.type = 'square'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2); break;
        case 'Eco Sweep': osc.type = 'triangle'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3); break;
        case 'Emerald Ping': osc.type = 'sine'; osc.frequency.setValueAtTime(987.77, ctx.currentTime); break;
        case 'Bin Alert High': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(1200, ctx.currentTime); break;
        case 'Solar Pulse': osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime); gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4); break;
        case 'District Whistle': osc.type = 'triangle'; osc.frequency.setValueAtTime(1500, ctx.currentTime); break;
        case 'Radar Echo': osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.setValueAtTime(100, ctx.currentTime + 0.08); osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16); break;
        case 'Nhost Sync Ping': osc.type = 'sine'; osc.frequency.setValueAtTime(1046.50, ctx.currentTime); break;
        case 'Loud Alarm Siren': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.15); osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3); gain.gain.setValueAtTime(0.22, ctx.currentTime); break;
        case 'Fire Alarm Sound': osc.type = 'square'; osc.frequency.setValueAtTime(1200, ctx.currentTime); osc.frequency.setValueAtTime(0, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15); osc.frequency.setValueAtTime(0, ctx.currentTime + 0.25); osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3); gain.gain.setValueAtTime(0.25, ctx.currentTime); break;
        case 'Alarm Panic Sound': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(900, ctx.currentTime); osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.08); osc.frequency.setValueAtTime(900, ctx.currentTime + 0.16); osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.24); osc.frequency.setValueAtTime(900, ctx.currentTime + 0.32); gain.gain.setValueAtTime(0.24, ctx.currentTime); break;
        default: osc.type = 'sine'; osc.frequency.setValueAtTime(329.63, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.25);
      }
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  const syncTagAndAlertToCloud = async (
    sNum: string,
    bType: BinColor,
    pName: string,
    hNum: string,
    st: string,
    twn: string,
    cnty: string,
    pCode: string,
    dDate: string,
    dTime: string,
    bTime: string,
    push: boolean,
    email: boolean,
    inApp: boolean,
    repWeeks: number = 1
  ) => {
    try {
      let cleanSerial = (sNum || '').trim().toUpperCase();
      if (/^\d+$/.test(cleanSerial)) {
        cleanSerial = `SBT-${cleanSerial.padStart(8, '0')}`;
      } else if (/^SBT-\d+$/i.test(cleanSerial)) {
        const parts = cleanSerial.split('-');
        cleanSerial = `SBT-${parts[1].padStart(8, '0')}`;
      }

      const formattedAddress = `${hNum} ${st}, ${twn} ${pCode}`.trim();
      const activeUser = mockDb.getCurrentUser();
      const nhostUser = typeof (nhost.auth as any).getUser === 'function' ? (nhost.auth as any).getUser() : null;
      
      let userUuid: string | null = null;
      if (nhostUser && typeof nhostUser === 'object' && nhostUser.id && isValidUuid(nhostUser.id)) {
        userUuid = nhostUser.id;
      } else if (activeUserId && isValidUuid(activeUserId)) {
        userUuid = activeUserId;
      } else if (activeUser?.uid && isValidUuid(activeUser.uid)) {
        userUuid = activeUser.uid;
      } else if (activeUserId) {
        userUuid = toUuid(activeUserId);
      }

      // 1. Query Hasura for tag by serial_number
      const findRes = await nhost.graphql.request<{ tags: { id: string }[] }>({
        query: `query FindTagBySerial($serial: String!) {
          tags(where: { serial_number: { _ilike: $serial } }) {
            id
          }
        }`,
        variables: { serial: cleanSerial }
      });

      let tagUuid = findRes.body.data?.tags?.[0]?.id;
      const nowIso = new Date().toISOString();

      if (tagUuid) {
        let updateSuccess = false;
        if (userUuid) {
          try {
            const res = await nhost.graphql.request({
              query: `mutation UpdateTagFull($id: uuid!, $status: String!, $registered_at: timestamptz!, $bin_colour: String, $property_name: String, $address: String, $registered_by: uuid) {
                update_tags_by_pk(pk_columns: { id: $id }, _set: {
                  status: $status,
                  registered_at: $registered_at,
                  bin_colour: $bin_colour,
                  property_name: $property_name,
                  address: $address,
                  registered_by: $registered_by
                }) { id }
              }`,
              variables: {
                id: tagUuid,
                status: "Registered",
                registered_at: nowIso,
                bin_colour: bType,
                property_name: pName || null,
                address: formattedAddress,
                registered_by: userUuid
              }
            });
            if (!res.body.errors) updateSuccess = true;
          } catch {}
        }

        if (!updateSuccess) {
          await nhost.graphql.request({
            query: `mutation UpdateTagFallback($id: uuid!, $status: String!, $registered_at: timestamptz!, $bin_colour: String, $property_name: String, $address: String) {
              update_tags_by_pk(pk_columns: { id: $id }, _set: {
                status: $status,
                registered_at: $registered_at,
                bin_colour: $bin_colour,
                property_name: $property_name,
                address: $address
              }) { id }
            }`,
            variables: {
              id: tagUuid,
              status: "Registered",
              registered_at: nowIso,
              bin_colour: bType,
              property_name: pName || null,
              address: formattedAddress
            }
          });
        }
      } else {
        let insertSuccess = false;
        if (userUuid) {
          try {
            const insertRes = await nhost.graphql.request<{ insert_tags_one: { id: string } }>({
              query: `mutation InsertTagFull($serial_number: String!, $status: String!, $registered_at: timestamptz!, $bin_colour: String, $property_name: String, $address: String, $registered_by: uuid) {
                insert_tags_one(object: {
                  serial_number: $serial_number,
                  status: $status,
                  registered_at: $registered_at,
                  bin_colour: $bin_colour,
                  property_name: $property_name,
                  address: $address,
                  registered_by: $registered_by
                }) { id }
              }`,
              variables: {
                serial_number: cleanSerial,
                status: "Registered",
                registered_at: nowIso,
                bin_colour: bType,
                property_name: pName || null,
                address: formattedAddress,
                registered_by: userUuid
              }
            });
            if (!insertRes.body.errors && insertRes.body.data?.insert_tags_one?.id) {
              tagUuid = insertRes.body.data.insert_tags_one.id;
              insertSuccess = true;
            }
          } catch {}
        }

        if (!insertSuccess) {
          const fallbackRes = await nhost.graphql.request<{ insert_tags_one: { id: string } }>({
            query: `mutation InsertTagNoUser($serial_number: String!, $status: String!, $registered_at: timestamptz!, $bin_colour: String, $property_name: String, $address: String) {
              insert_tags_one(object: {
                serial_number: $serial_number,
                status: $status,
                registered_at: $registered_at,
                bin_colour: $bin_colour,
                property_name: $property_name,
                address: $address
              }) { id }
            }`,
            variables: {
              serial_number: cleanSerial,
              status: "Registered",
              registered_at: nowIso,
              bin_colour: bType,
              property_name: pName || null,
              address: formattedAddress
            }
          });
          tagUuid = fallbackRes.body.data?.insert_tags_one?.id;
        }
      }

      // 2. Sync Collection Alert
      if (tagUuid) {
        const formatIsoDate = (inputDate: string) => {
          try {
            const d = new Date(inputDate);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
          } catch {
            return new Date().toISOString();
          }
        };
        const isoScheduledDate = formatIsoDate(dDate);

        const alertCheck = await nhost.graphql.request<{ collection_alerts: { id: string }[] }>({
          query: `query CheckAlertForTag($tag_id: uuid!) {
            collection_alerts(where: { tag_id: { _eq: $tag_id } }) { id }
          }`,
          variables: { tag_id: tagUuid }
        });

        const existingAlert = alertCheck.body.data?.collection_alerts?.[0];

        if (existingAlert) {
          let alertSuccess = false;
          if (userUuid) {
            try {
              const res = await nhost.graphql.request({
                query: `mutation UpdateAlertFull($id: uuid!, $registered_by: uuid, $scheduled_date: timestamptz!, $collection_alarm_time: String!, $reminder_days_before: Int!, $reminder_time: String!, $repeat_interval_weeks: Int!, $notify_push: Boolean!, $notify_email: Boolean!, $notify_inapp: Boolean!) {
                  update_collection_alerts_by_pk(pk_columns: { id: $id }, _set: {
                    registered_by: $registered_by, scheduled_date: $scheduled_date, collection_alarm_time: $collection_alarm_time,
                    reminder_days_before: $reminder_days_before, reminder_time: $reminder_time, repeat_interval_weeks: $repeat_interval_weeks,
                    notify_push: $notify_push, notify_email: $notify_email, notify_inapp: $notify_inapp
                  }) { id }
                }`,
                variables: {
                  id: existingAlert.id, registered_by: userUuid, scheduled_date: isoScheduledDate,
                  collection_alarm_time: dTime, reminder_days_before: 1, reminder_time: bTime,
                  repeat_interval_weeks: repWeeks, notify_push: push, notify_email: email, notify_inapp: inApp
                }
              });
              if (!res.body.errors) alertSuccess = true;
            } catch {}
          }

          if (!alertSuccess) {
            await nhost.graphql.request({
              query: `mutation UpdateAlertFallback($id: uuid!, $scheduled_date: timestamptz!, $collection_alarm_time: String!, $reminder_days_before: Int!, $reminder_time: String!, $repeat_interval_weeks: Int!, $notify_push: Boolean!, $notify_email: Boolean!, $notify_inapp: Boolean!) {
                update_collection_alerts_by_pk(pk_columns: { id: $id }, _set: {
                  scheduled_date: $scheduled_date, collection_alarm_time: $collection_alarm_time,
                  reminder_days_before: $reminder_days_before, reminder_time: $reminder_time, repeat_interval_weeks: $repeat_interval_weeks,
                  notify_push: $notify_push, notify_email: $notify_email, notify_inapp: $notify_inapp
                }) { id }
              }`,
              variables: {
                id: existingAlert.id, scheduled_date: isoScheduledDate,
                collection_alarm_time: dTime, reminder_days_before: 1, reminder_time: bTime,
                repeat_interval_weeks: repWeeks, notify_push: push, notify_email: email, notify_inapp: inApp
              }
            });
          }
        } else {
          let alertInsertSuccess = false;
          if (userUuid) {
            try {
              const res = await nhost.graphql.request({
                query: `mutation InsertAlertFull($registered_by: uuid, $tag_id: uuid!, $scheduled_date: timestamptz!, $collection_alarm_time: String!, $reminder_days_before: Int!, $reminder_time: String!, $repeat_interval_weeks: Int!, $notify_push: Boolean!, $notify_email: Boolean!, $notify_inapp: Boolean!) {
                  insert_collection_alerts_one(object: {
                    registered_by: $registered_by, tag_id: $tag_id, scheduled_date: $scheduled_date, collection_alarm_time: $collection_alarm_time,
                    reminder_days_before: $reminder_days_before, reminder_time: $reminder_time, repeat_interval_weeks: $repeat_interval_weeks,
                    notify_push: $notify_push, notify_email: $notify_email, notify_inapp: $notify_inapp
                  }) { id }
                }`,
                variables: {
                  registered_by: userUuid, tag_id: tagUuid, scheduled_date: isoScheduledDate,
                  collection_alarm_time: dTime, reminder_days_before: 1, reminder_time: bTime,
                  repeat_interval_weeks: repWeeks, notify_push: push, notify_email: email, notify_inapp: inApp
                }
              });
              if (!res.body.errors) alertInsertSuccess = true;
            } catch {}
          }

          if (!alertInsertSuccess) {
            await nhost.graphql.request({
              query: `mutation InsertAlertFallback($tag_id: uuid!, $scheduled_date: timestamptz!, $collection_alarm_time: String!, $reminder_days_before: Int!, $reminder_time: String!, $repeat_interval_weeks: Int!, $notify_push: Boolean!, $notify_email: Boolean!, $notify_inapp: Boolean!) {
                insert_collection_alerts_one(object: {
                  tag_id: $tag_id, scheduled_date: $scheduled_date, collection_alarm_time: $collection_alarm_time,
                  reminder_days_before: $reminder_days_before, reminder_time: $reminder_time, repeat_interval_weeks: $repeat_interval_weeks,
                  notify_push: $notify_push, notify_email: $notify_email, notify_inapp: $notify_inapp
                }) { id }
              }`,
              variables: {
                tag_id: tagUuid, scheduled_date: isoScheduledDate,
                collection_alarm_time: dTime, reminder_days_before: 1, reminder_time: bTime,
                repeat_interval_weeks: repWeeks, notify_push: push, notify_email: email, notify_inapp: inApp
              }
            });
          }
        }
      }
    } catch (err) {
      console.error('[Nhost Sync] Error in syncTagAndAlertToCloud:', err);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!serialNumber) { setError('Please enter your printed Smart Bin Tag Serial Number.'); return; }
    const res = mockDb.validateSerialNumber(serialNumber);
    if (res.valid && res.tag) {
      if (res.tag.status === 'Registered') { setError('This Smart Bin Tag is already registered to another homeowner account.'); return; }
      setSerialNumber(res.tag.serialNumber);
      setIsValidated(true);
      setStep(2);
    } else {
      setError(res.error || 'This serial number is invalid or could not be found.');
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(null);
    if (!houseNumber || !street || !town || !postcode) { setError('Please fill in all required address fields to save your bin.'); return; }

    const beforeTime = `${beforeTimeHour}:${beforeTimeMin} ${beforeTimeAmpm}`;
    const dayTime = `${dayTimeHour}:${dayTimeMin} ${dayTimeAmpm}`;
    const binDetails = {
      binType, propertyName: '', houseNumber, street, town, county, postcode,
      country: 'United Kingdom', notes, beforeCollectionDate: beforeDate,
      beforeCollectionTime: beforeTime, beforeCollectionEnabled: beforeEnabled,
      collectionDayDate: dayDate, collectionDayTime: dayTime, collectionDayEnabled: dayEnabled,
      pushEnabled: pushPref, emailEnabled: emailPref, inAppEnabled: inAppPref, alarmTone: selectedAlarm,
      repeatIntervalWeeks: dayRepeatWeeks,
      beforeRepeatIntervalWeeks: beforeRepeatWeeks,
      dayRepeatIntervalWeeks: dayRepeatWeeks
    };

    const targetSerial = editingBin ? editingBin.serialNumber : serialNumber;

    if (editingBin) {
      mockDb.updateBin(editingBin.binId, { ...binDetails, nextCollection: (dayEnabled || beforeEnabled) ? `${dayDate} at ${dayTime}` : 'Schedules paused' });
      await syncTagAndAlertToCloud(
        targetSerial, binType, '', houseNumber, street, town, county, postcode,
        dayDate, dayTime, beforeTime, pushPref, emailPref, inAppPref, dayRepeatWeeks
      );
      setSaveSuccess('Bin details and alarm schedules updated successfully!');
      onSuccess();
      setTimeout(() => setView('my-bins'), 1200);
    } else {
      const res = mockDb.registerBin(activeUserId, targetSerial, {
        ...binDetails, nextCollection: (dayEnabled || beforeEnabled) ? `${dayDate} at ${dayTime}` : 'Schedules paused'
      });
      if (res.success && res.bin) {
        mockDb.updateBin(res.bin.binId, binDetails);
        await syncTagAndAlertToCloud(
          res.bin.serialNumber || targetSerial, binType, '', houseNumber, street, town, county, postcode,
          dayDate, dayTime, beforeTime, pushPref, emailPref, inAppPref, dayRepeatWeeks
        );
        setStep(3);
        onSuccess();
      } else {
        setError(res.error || 'Failed to complete registration.');
      }
    }
  };

  const colorList: { value: BinColor; label: string; bgClass: string; textClass: string; borderClass: string }[] = [
    { value: 'Black', label: 'Black Bin', bgClass: 'bg-slate-900', textClass: 'text-white', borderClass: 'border-slate-700' },
    { value: 'Green', label: 'Green Bin', bgClass: 'bg-emerald-600', textClass: 'text-white', borderClass: 'border-emerald-500' },
    { value: 'Blue', label: 'Blue Bin', bgClass: 'bg-blue-600', textClass: 'text-white', borderClass: 'border-blue-500' },
    { value: 'Brown', label: 'Brown Bin', bgClass: 'bg-amber-800', textClass: 'text-white', borderClass: 'border-amber-700' },
    { value: 'Purple', label: 'Purple Bin', bgClass: 'bg-purple-600', textClass: 'text-white', borderClass: 'border-purple-500' },
    { value: 'Red', label: 'Red Bin', bgClass: 'bg-rose-600', textClass: 'text-white', borderClass: 'border-rose-500' },
    { value: 'Other', label: 'Other', bgClass: 'bg-orange-500', textClass: 'text-white', borderClass: 'border-orange-400' }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-3 sm:pt-4 pb-8 select-none space-y-6">
      <div className="flex items-center justify-start pb-2">
        <button onClick={() => setView('home')} className="flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#45D153] bg-[#04352b] border border-[#064e3f] hover:border-[#45D153] hover:bg-[#064e3f] rounded-xl transition-all cursor-pointer shadow-sm">
          <ArrowLeft className="h-4 w-4 text-[#45D153]" /><span>Back to Home Screen</span>
        </button>
      </div>

      {!editingBin && (
        <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= s ? 'bg-[#45D153] text-[#04352b] font-extrabold shadow-sm shadow-[#45D153]/20' : 'bg-[#032c24] text-emerald-500/60 border border-[#064e3f]'}`}>
                  {step > s ? <Check className="h-4 w-4 stroke-[3]" /> : s}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 font-mono tracking-wider uppercase ${step >= s ? 'text-[#45D153]' : 'text-emerald-500/60'}`}>
                  {s === 1 ? 'Verify' : s === 2 ? 'Setup' : 'Success'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${step >= s+1 ? 'bg-[#45D153]' : 'bg-[#064e3f]'}`}></div>}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className={`bg-[#02241d]/95 rounded-2xl border border-[#064e3f] shadow-2xl text-white transition-all duration-300 ${step === 3 ? 'p-4 sm:p-8 max-w-md mx-auto' : 'p-5 sm:p-8'}`}>
        {error && <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-xl text-xs flex items-start gap-2 mb-6"><ShieldAlert className="h-4.5 w-4.5 text-rose-400 flex-shrink-0 mt-0.5" /><span className="font-medium leading-relaxed">{error}</span></div>}
        {saveSuccess && <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-start gap-2 mb-6"><CheckCircle className="h-4.5 w-4.5 text-[#45D153] flex-shrink-0 mt-0.5" /><span className="font-medium leading-relaxed">{saveSuccess}</span></div>}

        {step === 1 && !editingBin && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Register Your Smart Bin Tag</h2>
              <p className="text-sm text-emerald-100/70 max-w-sm mx-auto leading-relaxed">Enter the unique printed serial number shown directly on your Smart Bin Tag sticker.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans mb-2">Smart Bin Tag Serial Number</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="SBT-00000000" className="pl-11 pr-4 w-full h-[54px] bg-[#032c24] border border-[#064e3f] rounded-xl text-sm text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] transition-all font-mono tracking-wider font-bold uppercase" required />
              </div>
              <p className="text-[10px] text-emerald-100/50 mt-2 flex items-center gap-1 font-mono"><Info className="h-3 w-3 text-[#45D153]" /><span>Format: SBT- followed by 8 digits (range: SBT-00000000 to SBT-50000000).</span></p>
            </div>
            <button type="submit" className="w-full h-[56px] rounded-xl bg-[#45D153] hover:bg-[#5ce06a] text-white font-black tracking-widest uppercase shadow-lg shadow-[#45D153]/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center text-xs cursor-pointer gap-2">
              <Check className="h-4.5 w-4.5 text-white" /><span>Verify Smart Bin Tag</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-6">
            <div className="border-b border-[#064e3f] pb-4 mb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#45D153] uppercase font-mono tracking-widest bg-emerald-500/10 border border-[#45D153]/30 px-2.5 py-1 rounded">{editingBin ? 'Settings & Schedule' : 'Verified ID'}</span>
                <h2 className="text-xl font-extrabold text-white mt-2 font-mono">{serialNumber}</h2>
              </div>
              {editingBin && <button type="button" onClick={() => setView('my-bins')} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold">Cancel</button>}
            </div>

            <div>
              <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans mb-3">1. Select Bin Colour</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                {colorList.map((color) => {
                  const isSelected = binType === color.value;
                  return (
                    <button key={color.value} type="button" onClick={() => setBinType(color.value)} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-[#45D153] bg-emerald-500/10 scale-105 ring-2 ring-emerald-500/20' : 'border-[#064e3f] hover:border-emerald-500/40 bg-[#011a14]'}`}>
                      <div className={`w-full h-12 rounded-lg flex items-center justify-center ${color.bgClass} ${color.textClass} shadow-md`}><Trash2 className="h-4 w-4" /></div>
                      <span className="text-[10px] font-bold mt-1.5 text-center text-emerald-100">{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans">2. Address Details</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] text-emerald-100/70 uppercase font-mono">Postcode *</label>
                      {postcodeStatusMsg && <span className="text-[10px] text-[#45D153] font-mono">{postcodeStatusMsg}</span>}
                    </div>
                    <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} placeholder="e.g. SW1A 1AA or B1 1AA" className="w-full h-11 px-3 bg-[#032c24] border border-[#064e3f] rounded-xl text-xs text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] uppercase font-mono font-bold transition-all" required />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans">Or Select UK District / Area (122 Areas)</label>
                    <PostcodeSelector
                      selectedCode={postcode ? postcode.substring(0, 2).trim() : undefined}
                      onSelectArea={(area) => {
                        const samplePc = `${area.code}1 1AA`;
                        setPostcode(samplePc);
                        setTown(area.town);
                        setCounty(area.county);
                        if (!street) setStreet(area.sampleStreet || 'High Street');
                        if (!houseNumber) setHouseNumber('14');
                        setPostcodeStatusMsg(`⚡ Address autofilled for ${area.name} (${area.country})`);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-100/70 uppercase font-mono mb-1">House Number / Name *</label>
                  <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="e.g. 12" className="w-full h-11 px-3 bg-[#032c24] border border-[#064e3f] rounded-xl text-xs text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-100/70 uppercase font-mono mb-1">Street Address *</label>
                  <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. High Street" className="w-full h-11 px-3 bg-[#032c24] border border-[#064e3f] rounded-xl text-xs text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-100/70 uppercase font-mono mb-1">Town / City *</label>
                  <input type="text" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. London" className="w-full h-11 px-3 bg-[#032c24] border border-[#064e3f] rounded-xl text-xs text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-100/70 uppercase font-mono mb-1">County</label>
                  <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="e.g. Greater London" className="w-full h-11 px-3 bg-[#032c24] border border-[#064e3f] rounded-xl text-xs text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans">3. Collection Alarm Schedules & Reminders</label>
              
              <div className="bg-[#011a14] p-4 rounded-xl border border-[#064e3f] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#064e3f]">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#45D153]" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">Evening Before Collection Alarm</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={beforeEnabled} onChange={(e) => setBeforeEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#032c24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#45D153]"></div>
                  </label>
                </div>

                {beforeEnabled && (
                  <div className="space-y-3 pt-1">
                    <ScrollDatePicker label="Evening Before Date (3 Boxes: Day / Month / Year 2026-3000)" value={beforeDate} onChange={setBeforeDate} />
                    
                    <div>
                      <label className="block text-[9px] font-bold text-emerald-300/75 uppercase font-mono mb-1">Alarm Time (Dropdown)</label>
                      <div className="flex gap-1.5 items-center">
                        <select 
                          value={beforeTimeHour} 
                          onChange={(e) => setBeforeTimeHour(e.target.value)} 
                          className="h-[36px] px-2 bg-[#02241d] border border-[#064e3f] rounded-lg text-xs text-white font-bold font-mono"
                        >
                          {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-white font-bold">:</span>
                        <select 
                          value={beforeTimeMin} 
                          onChange={(e) => setBeforeTimeMin(e.target.value)} 
                          className="h-[36px] px-2 bg-[#02241d] border border-[#064e3f] rounded-lg text-xs text-white font-bold font-mono"
                        >
                          {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          value={beforeTimeAmpm} 
                          onChange={(e) => setBeforeTimeAmpm(e.target.value)} 
                          className="h-[36px] px-2 bg-[#02241d] border border-[#064e3f] rounded-lg text-xs text-white font-bold font-mono"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold text-[#45D153] uppercase font-mono tracking-wider mb-1.5">Evening Before Repeat Interval</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { weeks: 1, label: '1 Week', desc: 'Every week' },
                          { weeks: 2, label: '2 Weeks', desc: 'Fortnightly' },
                          { weeks: 3, label: '3 Weeks', desc: 'Every 3 weeks' },
                          { weeks: 4, label: '4 Weeks', desc: 'Monthly' }
                        ].map(opt => (
                          <button
                            key={opt.weeks}
                            type="button"
                            onClick={() => {
                              setBeforeRepeatWeeks(opt.weeks);
                              playAlarmSoundPreview(selectedAlarm);
                            }}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              beforeRepeatWeeks === opt.weeks
                                ? 'bg-[#45D153] text-[#04352b] border-[#45D153] font-black shadow-md'
                                : 'bg-[#02241d] text-emerald-200 border-[#064e3f] hover:bg-[#032c24]'
                            }`}
                          >
                            <div className="text-xs font-bold uppercase">{opt.label}</div>
                            <div className="text-[9px] opacity-80 mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#011a14] p-4 rounded-xl border border-[#064e3f] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#064e3f]">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#45D153]" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">Collection Day Morning Alarm</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={dayEnabled} onChange={(e) => setDayEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#032c24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#45D153]"></div>
                  </label>
                </div>

                {dayEnabled && (
                  <div className="space-y-3 pt-1">
                    <ScrollDatePicker label="Collection Day Date (3 Boxes: Day / Month / Year 2026-3000)" value={dayDate} onChange={setDayDate} />

                    <div>
                      <label className="block text-[9px] font-bold text-emerald-300/75 uppercase font-mono mb-1">Alarm Time (Dropdown)</label>
                      <div className="flex gap-1.5 items-center">
                        <select 
                          value={dayTimeHour} 
                          onChange={(e) => setDayTimeHour(e.target.value)} 
                          className="h-[36px] px-2 bg-[#02241d] border border-[#064e3f] rounded-lg text-xs text-white font-bold font-mono"
                        >
                          {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-white font-bold">:</span>
                        <select 
                          value={dayTimeMin} 
                          onChange={(e) => setDayTimeMin(e.target.value)} 
                          className="h-[36px] px-2 bg-[#02241d] border border-[#064e3f] rounded-lg text-xs text-white font-bold font-mono"
                        >
                          {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          value={dayTimeAmpm} 
                          onChange={(e) => setDayTimeAmpm(e.target.value)} 
                          className="h-[36px] px-2 bg-[#02241d] border border-[#064e3f] rounded-lg text-xs text-white font-bold font-mono"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold text-[#45D153] uppercase font-mono tracking-wider mb-1.5">Collection Day Repeat Interval</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { weeks: 1, label: '1 Week', desc: 'Every week' },
                          { weeks: 2, label: '2 Weeks', desc: 'Fortnightly' },
                          { weeks: 3, label: '3 Weeks', desc: 'Every 3 weeks' },
                          { weeks: 4, label: '4 Weeks', desc: 'Monthly' }
                        ].map(opt => (
                          <button
                            key={opt.weeks}
                            type="button"
                            onClick={() => {
                              setDayRepeatWeeks(opt.weeks);
                              playAlarmSoundPreview(selectedAlarm);
                            }}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              dayRepeatWeeks === opt.weeks
                                ? 'bg-[#45D153] text-[#04352b] border-[#45D153] font-black shadow-md'
                                : 'bg-[#02241d] text-emerald-200 border-[#064e3f] hover:bg-[#032c24]'
                            }`}
                          >
                            <div className="text-xs font-bold uppercase">{opt.label}</div>
                            <div className="text-[9px] opacity-80 mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#011a14] p-4 rounded-xl border border-[#064e3f] space-y-3">
                <label className="block text-[10px] font-extrabold text-[#45D153] uppercase font-mono tracking-wider">Select Alarm Tone ({ALARM_SOUNDS.length} options)</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedAlarm} 
                    onChange={(e) => {
                      setSelectedAlarm(e.target.value);
                      playAlarmSoundPreview(e.target.value);
                    }} 
                    className="flex-1 h-11 px-3 bg-[#02241d] border border-[#064e3f] rounded-xl text-xs text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-[#45D153] cursor-pointer"
                  >
                    {ALARM_SOUNDS.map(sound => <option key={sound} value={sound}>{sound}</option>)}
                  </select>
                  <button type="button" onClick={() => playAlarmSoundPreview(selectedAlarm)} className="px-3 bg-[#064e3f] hover:bg-[#04352b] border border-[#45D153]/30 text-[#45D153] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                    <Volume2 className="h-4 w-4" /><span>Preview</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-bold text-emerald-300 uppercase font-mono">Notification Channels</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 bg-[#011a14] p-3 rounded-xl border border-[#064e3f] cursor-pointer">
                    <input type="checkbox" checked={pushPref} onChange={(e) => setPushPref(e.target.checked)} className="rounded border-[#064e3f] bg-[#032c24] text-[#45D153] focus:ring-[#45D153]" />
                    <span className="text-xs text-white font-medium">Push</span>
                  </label>
                  <label className="flex items-center gap-2 bg-[#011a14] p-3 rounded-xl border border-[#064e3f] cursor-pointer">
                    <input type="checkbox" checked={emailPref} onChange={(e) => setEmailPref(e.target.checked)} className="rounded border-[#064e3f] bg-[#032c24] text-[#45D153] focus:ring-[#45D153]" />
                    <span className="text-xs text-white font-medium">Email</span>
                  </label>
                  <label className="flex items-center gap-2 bg-[#011a14] p-3 rounded-xl border border-[#064e3f] cursor-pointer">
                    <input type="checkbox" checked={inAppPref} onChange={(e) => setInAppPref(e.target.checked)} className="rounded border-[#064e3f] bg-[#032c24] text-[#45D153] focus:ring-[#45D153]" />
                    <span className="text-xs text-white font-medium">In-App</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-emerald-100/70 uppercase font-mono mb-1">Additional Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Leave bin near the side gate before 7 AM" rows={2} className="w-full p-3 bg-[#032c24] border border-[#064e3f] rounded-xl text-xs text-white placeholder-emerald-600/50 focus:outline-hidden focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153] transition-all resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full h-[56px] rounded-xl bg-[#45D153] hover:bg-[#5ce06a] text-white font-black tracking-widest uppercase shadow-lg shadow-[#45D153]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center text-xs cursor-pointer gap-2">
              <Save className="h-4.5 w-4.5 text-white" />
              <span className="text-white font-black">{editingBin ? 'Save Changes' : 'Complete Bin Registration'}</span>
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 py-4">
            <div className="h-16 w-16 bg-[#45D153]/20 border border-[#45D153] text-[#45D153] rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Registration Complete!</h2>
              <p className="text-xs text-emerald-100/70 max-w-xs mx-auto leading-relaxed">
                Smart Bin Tag <span className="font-mono text-[#45D153] font-bold">{serialNumber}</span> has been linked to your account.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-3 max-w-xs mx-auto">
              <button type="button" onClick={() => setView('my-bins')} className="w-full h-12 rounded-xl bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2">
                <span>View My Bins</span>
              </button>
              <button type="button" onClick={() => setView('home')} className="w-full h-12 rounded-xl bg-[#032c24] hover:bg-[#064e3f] text-emerald-300 font-bold uppercase text-xs tracking-wider border border-[#064e3f] transition-all cursor-pointer flex items-center justify-center gap-2">
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}