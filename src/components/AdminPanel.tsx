import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockDb } from '../mockDb';
import { nhost, toUuid, isValidUuid } from '../lib/nhost';
import { User, BinTag, BinReport, PrivateMessage, Bin, AuditLogEntry, RegistrationHistoryItem, SupportTicket } from '../types';
import { 
  ShieldCheck, Users, QrCode, AlertTriangle, CheckCircle, Search, Filter, 
  Ban, RefreshCw, Key, Trash2, ArrowUpRight, BarChart2, PlusCircle, 
  Check, Archive, Download, Info, MapPin, Mail, Send, History, Globe, Map, Edit, UserX, User as UserIcon, Home, X, LifeBuoy
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  tags: BinTag[];
  reports: BinReport[];
  messages: PrivateMessage[];
  bins: Bin[];
  setView: (view: string, params?: Record<string, any>) => void;
  onRefresh: () => void;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/** Convert UK Lat/Lng to percentage coordinates for SVG UK Map */
const projectLatLng = (lat: number, lng: number) => {
  const minLat = 49.9, maxLat = 59.0, minLng = -8.0, maxLng = 2.0;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);
  return { x, y };
};

/** Create pulsing map marker icon */
const createPulsingIcon = (colorClass: string, isSelected: boolean) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `
    <div class="relative flex items-center justify-center h-6 w-6">
      <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full ${colorClass} opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border-2 ${isSelected ? 'border-amber-400 scale-125' : 'border-white'} shadow-md"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Map postcode prefix to realistic UK coordinates */
const getCoordinatesForPostcode = (postcode: string = ''): { lat: number; lng: number } => {
  const clean = postcode.trim().toUpperCase();
  const area = clean.match(/^[A-Z]+/)?.[0] || '';

  // London catch-all
  if (['SW','EC','WC','W','N','SE','E','NW','HA','EN','UB','TW','KT','CR','SM','BR','DA','RM','IG'].includes(area)) {
    return { lat: 51.5074, lng: -0.1278 };
  }

  const mapping: Record<string, { lat: number; lng: number }> = {
    OX:{lat:51.7520,lng:-1.2577}, TE:{lat:54.5742,lng:-1.2355}, TS:{lat:54.5742,lng:-1.2355}, B:{lat:52.4862,lng:-1.8904},
    M:{lat:53.4808,lng:-2.2426}, LS:{lat:53.8008,lng:-1.5491}, NE:{lat:54.9783,lng:-1.6178}, BS:{lat:51.4545,lng:-2.5879},
    G:{lat:55.8642,lng:-4.2518}, EH:{lat:55.9533,lng:-3.1883}, CF:{lat:51.4816,lng:-3.1791}, BT:{lat:54.5973,lng:-5.9301},
    L:{lat:53.4084,lng:-2.9916}, S:{lat:53.3811,lng:-1.4701}, NG:{lat:52.9548,lng:-1.1581}, CB:{lat:52.2053,lng:0.1218},
    CO:{lat:51.8892,lng:0.9042}, CV:{lat:52.4068,lng:-1.5197}, DE:{lat:52.9225,lng:-1.4746}, DN:{lat:53.5228,lng:-1.1311},
    LE:{lat:52.6369,lng:-1.1398}, LN:{lat:53.2307,lng:-0.5402}, NR:{lat:52.6309,lng:1.2974}, PL:{lat:50.3755,lng:-4.1427},
    PO:{lat:50.8166,lng:-1.0849}, SO:{lat:50.9097,lng:-1.4044}, ST:{lat:53.0027,lng:-2.1794}, WA:{lat:53.3901,lng:-2.5970},
    YO:{lat:53.9591,lng:-1.0815}, AL:{lat:51.7500,lng:-0.3400}, BA:{lat:51.3800,lng:-2.3600}, BD:{lat:53.7900,lng:-1.7500},
    BH:{lat:50.7200,lng:-1.8800}, CH:{lat:53.1900,lng:-2.8900}, CM:{lat:51.7300,lng:0.4700}, DL:{lat:54.5200,lng:-1.5500},
    GL:{lat:51.8600,lng:-2.2400}, HD:{lat:53.6400,lng:-1.7800}, HG:{lat:53.9900,lng:-1.5400}, HU:{lat:53.7400,lng:-0.3300},
    HX:{lat:53.7200,lng:-1.8600}, IP:{lat:52.0600,lng:1.1500}, LA:{lat:54.0400,lng:-2.8000}, LU:{lat:51.8800,lng:-0.4100},
    ME:{lat:51.3800,lng:0.5000}, MK:{lat:52.0400,lng:-0.7600}, NN:{lat:52.2400,lng:-0.9000}, PE:{lat:52.5700,lng:-0.2400},
    PR:{lat:53.7600,lng:-2.7000}, RG:{lat:51.4500,lng:-0.9700}, SG:{lat:51.9000,lng:-0.2000}, SL:{lat:51.5100,lng:-0.5900},
    SN:{lat:51.5600,lng:-1.7800}, SP:{lat:51.0700,lng:-1.7900}, SR:{lat:54.9000,lng:-1.3800}, TA:{lat:51.0200,lng:-3.1000},
    TF:{lat:52.6800,lng:-2.4800}, TN:{lat:51.2700,lng:0.5200}, WR:{lat:52.1900,lng:-2.2200}, WV:{lat:52.5900,lng:-2.1300}
  };

  if (mapping[area]) return mapping[area];
  const hash = clean.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return { lat: 53.2 + ((hash%100)/40-1.25), lng: -2.2 + ((hash%50)/25-1.0) };
};

/** Resolve coordinates and label for a given tag */
const getCoordsForTag = (tag: BinTag, bins: Bin[], users: User[]) => {
  const bin = bins.find(b => b.serialNumber === tag.serialNumber);
  if (bin) return { ...getCoordinatesForPostcode(bin.postcode), postcode: bin.postcode, label: `${bin.houseNumber||''} ${bin.street||''}, ${bin.town||''}` };

  if (tag.ownerId) {
    const owner = users.find(u => u.uid === tag.ownerId);
    if (owner?.postcode) return { ...getCoordinatesForPostcode(owner.postcode), postcode: owner.postcode, label: `Owner: ${owner.firstName} ${owner.lastName}` };
  }

  const serialNum = parseInt(tag.serialNumber.replace(/\D/g,''),10)||0;
  const prefixes = ['SW1A','OX1','M1','LS1','NE1','BS1','G1','CF1','BT1','EH1','L1','NG1','CB1','CO1','B1'];
  const prefix = prefixes[serialNum%prefixes.length];
  const c = getCoordinatesForPostcode(prefix);
  return {
    lat: c.lat + ((serialNum%71)-35)*0.015,
    lng: c.lng + (((serialNum*13)%71)-35)*0.015,
    postcode: prefix,
    label: 'Unassigned Warehouse Inventory'
  };
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminPanel({
  users, tags, reports, messages, bins, setView, onRefresh
}: AdminPanelProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard'|'users'|'tags'|'reports'|'tickets'|'messaging'|'history'>('dashboard');

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');

  useEffect(() => {
    setTickets(mockDb.getSupportTickets('ALL'));
  }, [activeTab]);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [reportFilter, setReportFilter] = useState('All');
  const [logSearch, setLogSearch] = useState('');

  // Map State
  const [selectedMapBin, setSelectedMapBin] = useState<Bin|null>(null);
  const [selectedMapUser, setSelectedMapUser] = useState<User|null>(null);
  const [mapStyle, setMapStyle] = useState<'color'|'voyager'|'dark'>('color');
  const mapInstanceRef = useRef<L.Map|null>(null);
  const tileLayerRef = useRef<L.TileLayer|null>(null);
  const markersRef = useRef<Record<string,L.Marker>>({});

  // Edit Forms
  const [isEditingBin, setIsEditingBin] = useState(false);
  const [editHouse, setEditHouse] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editTown, setEditTown] = useState('');
  const [editPostcode, setEditPostcode] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');

  // Add Tag to User Modal state
  const [addTagModalUser, setAddTagModalUser] = useState<User | null>(null);
  const [newTagSerial, setNewTagSerial] = useState('SBT-00000020');
  const [newTagBinType, setNewTagBinType] = useState<'Green' | 'Blue' | 'Brown' | 'Black'>('Green');
  const [newTagHouse, setNewTagHouse] = useState('');
  const [newTagStreet, setNewTagStreet] = useState('');
  const [newTagTown, setNewTagTown] = useState('');
  const [newTagPostcode, setNewTagPostcode] = useState('');
  const [newTagCollectionDay, setNewTagCollectionDay] = useState('Tuesday');

  // Edit Tag Modal state (Physical Tags Tab)
  const [editingTag, setEditingTag] = useState<BinTag | null>(null);
  const [editTagBinType, setEditTagBinType] = useState<'Green' | 'Blue' | 'Brown' | 'Black'>('Green');
  const [editTagHouse, setEditTagHouse] = useState('');
  const [editTagStreet, setEditTagStreet] = useState('');
  const [editTagTown, setEditTagTown] = useState('');
  const [editTagPostcode, setEditTagPostcode] = useState('');

  // Custom Confirmation Modal State (replaces native window.confirm which fails in sandboxed iframes)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    subMessage?: string;
    confirmText: string;
    cancelText?: string;
    variant?: 'danger' | 'amber' | 'emerald' | 'blue';
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Custom Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Custom Password Reset Display Modal State
  const [resetPassInfo, setResetPassInfo] = useState<{
    email: string;
    pass: string;
  } | null>(null);

  const handleOpenEditTagModal = (t: BinTag) => {
    setEditingTag(t);
    const bin = bins.find(b => b.serialNumber === t.serialNumber);
    const owner = users.find(u => u.uid === t.ownerId);
    setEditTagBinType((bin?.binType as any) || 'Green');
    setEditTagHouse(bin?.houseNumber || '12');
    setEditTagStreet(bin?.street || 'High Street');
    setEditTagTown(bin?.town || 'Lincoln');
    setEditTagPostcode(bin?.postcode || owner?.postcode || 'LN5 8PE');
  };

  const handleSaveTagEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    const serial = editingTag.serialNumber;
    const bin = bins.find(b => b.serialNumber === serial);
    if (bin) {
      mockDb.updateBin(bin.binId, {
        binType: editTagBinType,
        houseNumber: editTagHouse,
        street: editTagStreet,
        town: editTagTown,
        postcode: editTagPostcode
      });
    }

    try {
      await nhost.graphql.request({
        query: `mutation UpdateTagInCloud($s: String!, $bt: String, $h: String, $st: String, $p: String) {
          update_tags(
            where: { serial_number: { _eq: $s } },
            _set: { house_number: $h, street_name: $st, postcode: $p }
          ) { affected_rows }
        }`,
        variables: { s: serial, bt: editTagBinType, h: editTagHouse, st: editTagStreet, p: editTagPostcode }
      });
    } catch (err) { console.warn('[Nhost Tag Edit Sync]', err); }

    onRefresh();
    setEditingTag(null);
    showToast(`Tag ${serial} updated successfully.`);
  };

  const handleOpenAddTagModal = (u: User) => {
    setAddTagModalUser(u);
    const maxSerialNum = tags.reduce((max, t) => {
      const match = t.serialNumber.match(/SBT-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        return val > max ? val : max;
      }
      return max;
    }, 15);
    const nextSerial = `SBT-${String(maxSerialNum + 1).padStart(8, '0')}`;
    setNewTagSerial(nextSerial);
    setNewTagBinType('Green');
    setNewTagHouse('12');
    setNewTagStreet('High Street');
    setNewTagTown('Lincoln');
    setNewTagPostcode(u.postcode || 'LN5 8PE');
    setNewTagCollectionDay('Tuesday');
  };

  const handleAdminAddTagToUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTagModalUser) return;
    
    const serial = newTagSerial.trim().toUpperCase();
    if (!/^SBT-\d{8}$/.test(serial)) {
      showToast('Serial number must be in format SBT-XXXXXXXX (e.g. SBT-00000020)', 'error');
      return;
    }
    
    const result = mockDb.registerBin(addTagModalUser.uid, serial, {
      binType: newTagBinType,
      houseNumber: newTagHouse || '12',
      street: newTagStreet || 'High Street',
      town: newTagTown || 'Lincoln',
      county: 'Lincolnshire',
      country: 'United Kingdom',
      postcode: newTagPostcode || addTagModalUser.postcode || 'LN5 8PE',
      collectionDayDate: newTagCollectionDay,
      collectionDayTime: '07:00 AM'
    });
    
    if (!result.success) {
      showToast(result.error || 'Failed to add tag', 'error');
      return;
    }
    
    try {
      const uuid = toUuid(addTagModalUser.uid);
      await nhost.graphql.request({
        query: `
          mutation AddUserTag($s: String!, $st: String!, $u: uuid, $h: String, $stName: String, $p: String, $bt: String) {
            insert_tags_one(
              object: {
                serial_number: $s,
                status: $st,
                registered_by: $u,
                registered_date: "now()",
                house_number: $h,
                street_name: $stName,
                postcode: $p,
                bin_type: $bt
              },
              on_conflict: {
                constraint: tags_pkey,
                update_columns: [status, registered_by, house_number, street_name, postcode, bin_type]
              }
            ) {
              serial_number
            }
          }
        `,
        variables: {
          s: serial,
          st: 'Registered',
          u: uuid,
          h: newTagHouse || '12',
          stName: newTagStreet || 'High Street',
          p: newTagPostcode || addTagModalUser.postcode || 'LN5 8PE',
          bt: newTagBinType
        }
      });
    } catch (err) {
      console.warn('[Nhost Add Tag sync]', err);
    }
    
    onRefresh();
    showToast(`Tag ${serial} (${newTagBinType} bin) successfully assigned to ${addTagModalUser.firstName} ${addTagModalUser.lastName}!`, 'success');
    setAddTagModalUser(null);
  };

  // Bulk Generation
  const [bulkStartNum, setBulkStartNum] = useState(250);
  const [bulkCount, setBulkCount] = useState(100);
  const [genSuccess, setGenSuccess] = useState<string|null>(null);

  // Messaging
  const [msgTarget, setMsgTarget] = useState<'all'|string>('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [msgSuccess, setMsgSuccess] = useState<string|null>(null);

  // Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [regHistory, setRegHistory] = useState<RegistrationHistoryItem[]>([]);

  // ─── Derived Stats ────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const totalTags = 50_000_000;
  const registeredTags = tags.filter(t => t.status === 'Registered').length;
  const disabledTags = tags.filter(t => t.status === 'Disabled').length;
  const availableTags = totalTags - registeredTags - disabledTags;
  const lostBinsCount = bins.filter(b => b.status === 'Lost').length;
  const damagedBinsCount = bins.filter(b => b.status === 'Damaged').length;
  const openReportsCount = reports.filter(r => ['Unread','Read'].includes(r.status)).length;

  // ─── Effects ──────────────────────────────────────────────────────────────
  const pullLogs = () => {
    setAuditLogs(mockDb.getAllAuditLogs());
    setRegHistory(mockDb.getAllRegistrationHistory());
  };
  useEffect(pullLogs, [users, bins]);

  // Leaflet Map Initialisation & Markers
  useEffect(() => {
    if (activeTab !== 'dashboard') {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
      tileLayerRef.current = null;
      return;
    }

    const container = document.getElementById('leaflet-admin-map');
    if (container && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(container, { center: [54.5, -3.5], zoom: 5.5, minZoom: 4, maxZoom: 16, zoomControl: true });
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    tileLayerRef.current?.remove();
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    if (mapStyle === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    } else if (mapStyle === 'voyager') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    }
    tileLayerRef.current = L.tileLayer(tileUrl, { attribution, maxZoom: 20 }).addTo(map);

    // Remove stale markers
    const registeredTagsForMap = tags.filter(t => t.status === 'Registered' || bins.some(b => b.serialNumber === t.serialNumber));
    Object.keys(markersRef.current).forEach(s => {
      if (!registeredTagsForMap.some(t => t.serialNumber === s)) { markersRef.current[s].remove(); delete markersRef.current[s]; }
    });

    // Add/update markers ONLY for registered tags with address & postcode
    registeredTagsForMap.forEach(tag => {
      const details = getCoordsForTag(tag, bins, users);
      const isSelected = selectedMapBin?.serialNumber === tag.serialNumber;
      let colorClass = 'bg-[#45D153]';
      if (tag.status === 'Available') colorClass = 'bg-teal-400';
      if (tag.status === 'Lost') colorClass = 'bg-rose-500';
      if (tag.status === 'Disabled') colorClass = 'bg-slate-400';
      const bin = bins.find(b => b.serialNumber === tag.serialNumber);
      if (bin?.status === 'Damaged') colorClass = 'bg-orange-500';
      if (isSelected) colorClass = 'bg-amber-400';

      markersRef.current[tag.serialNumber]?.remove();
      const marker = L.marker([details.lat, details.lng], { icon: createPulsingIcon(colorClass, isSelected) })
        .addTo(map)
        .on('click', () => {
          if (bin) handleSelectMapDot(bin);
          else handleSelectMapDot({
            binId: `tag-${tag.serialNumber}`, serialNumber: tag.serialNumber, binType: 'Other',
            houseNumber: 'N/A', street: 'Registered Tag', town: 'Live Location',
            county: 'N/A', country: 'United Kingdom', postcode: details.postcode,
            status: tag.status === 'Available' ? 'Active' : 'Lost',
            nextCollection: 'Schedules active', ownerId: tag.ownerId || '',
            registeredDate: tag.registeredDate || new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        });
      marker.bindPopup(`
        <div class="text-xs p-2.5 font-sans text-gray-950 min-w-[170px]">
          <p class="font-bold border-b border-gray-100 pb-1 mb-1.5 font-mono">${tag.serialNumber}</p>
          <p class="font-semibold text-[11px]">${bin ? `${bin.houseNumber||''} ${bin.street||''}` : 'Registered Smart Tag'}</p>
          <p class="text-[10px] text-gray-500">${bin ? `${bin.town||''}, ${bin.postcode||''}` : `Postcode: ${details.postcode}`}</p>
          <p class="mt-2 font-mono text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm">
            Status: ${tag.status} ${bin ? `• ${bin.binType}` : ''}
          </p>
        </div>
      `);
      markersRef.current[tag.serialNumber] = marker;
      if (isSelected) map.setView([details.lat, details.lng], 12);
    });
  }, [activeTab, bins, tags, users, selectedMapBin, mapStyle]);

  useEffect(() => () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; }, []);

  // Auto‑create valid serial search entries
  useEffect(() => {
    const trimmed = tagSearch.trim().toUpperCase();
    if (/^SBT-\d{1,8}$/.test(trimmed)) {
      const num = parseInt(trimmed.split('-')[1],10);
      if (num >= 1 && num <= 50_000_000) {
        const formatted = `SBT-${String(num).padStart(8,'0')}`;
        if (!tags.some(t => t.serialNumber === formatted)) {
          mockDb.validateSerialNumber(formatted);
          onRefresh();
        }
      }
    }
  }, [tagSearch, tags, onRefresh]);

  // ─── Event Handlers ───────────────────────────────────────────────────────
  const handleSelectMapDot = (bin: Bin) => {
    setSelectedMapBin(bin);
    setSelectedMapUser(users.find(u => u.uid === bin.ownerId) || null);
    setIsEditingBin(false);
  };

  const handleSaveMapDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapBin) return;
    mockDb.updateBin(selectedMapBin.binId, { houseNumber: editHouse, street: editStreet, town: editTown, postcode: editPostcode });
    if (selectedMapUser && editUserEmail.trim()) mockDb.updateUser(selectedMapUser.uid, { email: editUserEmail.trim() });

    try {
      await nhost.graphql.request({
        query: `mutation UpdateBin($binId:String!,$h:String!,$s:String!,$t:String!,$p:String!){ update_tags(where:{id:{_eq:$binId}},_set:{status:"Registered"}){affected_rows} }`,
        variables: { binId: selectedMapBin.binId, h: editHouse, s: editStreet, t: editTown, p: editPostcode }
      });
      if (selectedMapUser && editUserEmail.trim()) {
        await nhost.graphql.request({
          query: `mutation UpdUser($uid:String!,$e:String!){ update_sbt_profiles(where:{user_id:{_eq:$uid}},_set:{email:$e}){affected_rows} }`,
          variables: { uid: selectedMapUser.uid, e: editUserEmail.trim() }
        });
      }
    } catch (err) { console.warn('[Nhost] sync warning:', err); }

    const logs = mockDb.getAllAuditLogs();
    logs.push({ id:`audit-${Math.random().toString(36).slice(2,9)}`, userId: selectedMapBin.ownerId, action:'ADMIN_MODIFIED_BIN_AND_OWNER', ipAddress:'127.0.0.1 (Admin)', userAgent:navigator.userAgent, createdAt:new Date().toISOString(), status:'SUCCESS' });
    localStorage.setItem('sbt_audit_logs', JSON.stringify(logs));

    onRefresh(); setIsEditingBin(false); setSelectedMapBin(null); setSelectedMapUser(null);
    showToast('Bin & owner details updated successfully.');
  };

  const handleToggleUserStatus = async (uid: string, curr: User['status']) => {
    const next = curr === 'Active' ? 'Suspended' : 'Active';
    mockDb.updateUser(uid, { status: next });
    try {
      await nhost.graphql.request({ query:`mutation($u:String!,$s:String!){ update_sbt_profiles(where:{user_id:{_eq:$u}},_set:{status:$s}){affected_rows} }`, variables:{u:uid,s:next} });
    } catch (e) { console.warn('[Nhost]',e); }
    onRefresh();
    showToast(`Homeowner status updated to ${next}.`, 'info');
  };

  const handlePromoteToAdmin = async (uid: string) => {
    mockDb.updateUser(uid, { accountType: 'admin' });
    try {
      await nhost.graphql.request({ query:`mutation($u:String!){ update_sbt_profiles(where:{user_id:{_eq:$u}},_set:{account_type:"admin"}){affected_rows} }`, variables:{u:uid} });
    } catch (e) { console.warn('[Nhost]',e); }
    onRefresh();
    showToast('User promoted to administrator.', 'success');
  };

  const handleToggleTagStatus = async (serial: string, curr: BinTag['status']) => {
    const next = curr === 'Disabled' ? 'Available' : 'Disabled';
    mockDb.updateTag(serial, { status: next });
    try {
      await nhost.graphql.request({ query:`mutation($s:String!,$st:String!){ update_tags(where:{serial_number:{_eq:$s}},_set:{status:$st}){affected_rows} }`, variables:{s:serial,st:next} });
    } catch (e) { console.warn('[Nhost]',e); }
    onRefresh();
    showToast(`Tag ${serial} status set to ${next}.`, 'info');
  };

  const handleBulkGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkStartNum <=0 || bulkCount <=0) return;
    const res = mockDb.generateTagsBulk(bulkStartNum, bulkCount);
    if (res.success) { onRefresh(); setGenSuccess(`Generated ${res.count} tags.`); setTimeout(()=>setGenSuccess(null),4000); }
  };

  const handleResolveReport = (id: string) => { mockDb.resolveReport(id); onRefresh(); showToast('Report resolved.'); };
  const handleArchiveReport = (id: string) => { mockDb.archiveReport(id); onRefresh(); showToast('Report archived.'); };
  
  const requestDeleteReport = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Incident Report?',
      message: 'Are you sure you want to delete this report from the system?',
      confirmText: 'Delete Report',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        mockDb.deleteReport(id);
        onRefresh();
        showToast('Incident report deleted.', 'info');
      }
    });
  };

  const handleResetPassword = async (email: string) => {
    try {
      const pass = mockDb.adminResetUserPassword(email);
      try {
        await nhost.graphql.request({ query:`mutation($e:String!,$p:String!){ update_sbt_profiles(where:{email:{_eq:$e}},_set:{password_hash:$p}){affected_rows} }`, variables:{e:email,p:pass} });
      } catch (e) { console.warn('[Nhost]',e); }
      onRefresh();
      setResetPassInfo({ email, pass });
    } catch (e: any) {
      showToast(e?.message || 'Error resetting password', 'error');
    }
  };

  const requestResetUserAssociation = (uid: string, email: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Unassign All Tags for ${email}?`,
      message: `Are you sure you want to unassign and release all tags linked to ${email}?`,
      subMessage: `The tags will be returned to warehouse stock. The homeowner profile account will remain active.`,
      confirmText: 'Unassign All Tags',
      cancelText: 'Cancel',
      variant: 'amber',
      onConfirm: async () => {
        try {
          mockDb.adminResetUserAssociation(uid);
        } catch (e) { console.warn('[mockDb reset user assoc]', e); }

        try {
          const uuid = toUuid(uid);
          await nhost.graphql.request({
            query:`mutation($s:String!,$u:uuid){
              delete_collection_alerts(where:{_or:[{registered_by:{_eq:$u}},{registered_by:{_eq:$s}}]}){affected_rows}
              delete_sbt_bins(where:{_or:[{owner_id:{_eq:$s}},{registered_by:{_eq:$s}}]}){affected_rows}
              update_tags(where:{_or:[{registered_by:{_eq:$u}},{registered_by:{_eq:$s}}]},_set:{status:"Available",registered_by:null}){affected_rows}
            }`,
            variables:{s:uid,u:uuid}
          });
        } catch (e) { console.warn('[Nhost tag reset sync]',e); }
        onRefresh();
        setSelectedMapBin(null);
        setSelectedMapUser(null);
        showToast(`All tags unassigned from ${email}. Homeowner profile remains active.`, 'info');
      }
    });
  };

  const requestResetTag = (serial: string, binType?: string, ownerName?: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete / Release Tag ${serial}?`,
      message: `Are you sure you want to delete tag ${serial} ${binType ? `(${binType} Bin)` : ''} ${ownerName ? `linked to ${ownerName}` : ''}?`,
      subMessage: `This removes tag ${serial} from the homeowner and releases it back to available stock. The homeowner profile account will NOT be deleted.`,
      confirmText: `Delete Tag ${serial}`,
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          mockDb.adminResetTag(serial);
        } catch (e) { console.warn('[mockDb reset tag]', e); }

        try {
          await nhost.graphql.request({
            query:`mutation($s:String!){
              delete_collection_alerts(where:{tag:{serial_number:{_eq:$s}}}){affected_rows}
              delete_sbt_bins(where:{serial_number:{_eq:$s}}){affected_rows}
              update_tags(where:{serial_number:{_eq:$s}},_set:{status:"Available",registered_by:null}){affected_rows}
            }`,
            variables:{s:serial}
          });
        } catch (e) { console.warn('[Nhost Tag Delete Sync]',e); }
        onRefresh();
        setSelectedMapBin(null);
        setSelectedMapUser(null);
        showToast(`Tag ${serial} deleted and returned to available stock. Homeowner profile preserved.`, 'success');
      }
    });
  };

  const requestDeleteUser = (uid: string, email: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Permanently Delete Homeowner (${email})?`,
      message: `WARNING: Are you sure you want to permanently delete homeowner profile ${email}?`,
      subMessage: `This will erase their profile, linked tags, bins, and alert records from both local storage and Nhost/Hasura database. This action cannot be undone.`,
      confirmText: `Delete ${email}`,
      cancelText: 'Keep Homeowner',
      variant: 'danger',
      onConfirm: async () => {
        try {
          mockDb.deleteUser(uid);
        } catch (e) { console.warn('[mockDb delete user]', e); }

        try {
          const uuid = toUuid(uid);
          await nhost.graphql.request({
            query:`mutation($s:String!,$u:uuid){
              delete_collection_alerts(where:{_or:[{registered_by:{_eq:$u}},{registered_by:{_eq:$s}}]}){affected_rows}
              delete_sbt_bins(where:{_or:[{owner_id:{_eq:$s}},{registered_by:{_eq:$s}}]}){affected_rows}
              delete_sbt_profiles(where:{user_id:{_eq:$s}}){affected_rows}
              update_tags(where:{_or:[{registered_by:{_eq:$u}},{registered_by:{_eq:$s}}]},_set:{status:"Available",registered_by:null}){affected_rows}
            }`,
            variables:{s:uid,u:uuid}
          });
        } catch (e) { console.warn('[Nhost user delete sync]',e); }
        onRefresh();
        setSelectedMapBin(null);
        setSelectedMapUser(null);
        showToast(`Homeowner account profile (${email}) permanently deleted.`, 'error');
      }
    });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    const adminEmail = mockDb.getCurrentUser()?.email || 'admin0115@gmail.com';

    if (msgTarget === 'all') {
      users.forEach(u => mockDb.addNotification(u.uid, 'System', broadcastTitle, broadcastBody, 'notifications'));
      try {
        await nhost.graphql.request({
          query: `mutation SendBroadcast($msg: String!, $sender: String!) {
            insert_messages(objects: [
              { serial_number: "SBT-ADMIN-MSG", owner_id: "BROADCAST", sender_name: "SBT Municipal Admin", sender_email: $sender, message: $msg, status: "Unread" }
            ]) { affected_rows }
          }`,
          variables: { msg: `${broadcastTitle}: ${broadcastBody}`, sender: adminEmail }
        });
      } catch (err) { console.warn('[Nhost Broadcast]', err); }
      setMsgSuccess(`Broadcast sent to ${users.length} homeowners.`);
    } else {
      const target = users.find(u => u.uid === msgTarget);
      if (target) {
        mockDb.addNotification(target.uid, 'Private Message', `Direct: ${broadcastTitle}`, broadcastBody, 'notifications');
        const msgs = mockDb.getMessages();
        const newMsgId = `msg-adm-${Math.random().toString(36).slice(2,9)}`;
        msgs.push({
          messageId: newMsgId,
          serialNumber: 'SBT-ADMIN-MSG',
          ownerId: target.uid,
          senderName: 'SBT Municipal Admin',
          senderEmail: adminEmail,
          message: `${broadcastTitle}: ${broadcastBody}`,
          createdAt: new Date().toISOString(),
          status: 'Unread'
        });
        localStorage.setItem('sbt_messages', JSON.stringify(msgs));

        try {
          await nhost.graphql.request({
            query: `mutation SendDirectMessage($msg: String!, $sender: String!, $owner: String!) {
              insert_messages_one(object: {
                serial_number: "SBT-ADMIN-MSG",
                owner_id: $owner,
                sender_name: "SBT Municipal Admin",
                sender_email: $sender,
                message: $msg
              }) { id }
            }`,
            variables: { msg: `${broadcastTitle}: ${broadcastBody}`, sender: adminEmail, owner: target.uid }
          });
        } catch (err) { console.warn('[Nhost Direct Message]', err); }
        setMsgSuccess(`Private message sent to ${target.firstName} ${target.lastName} (${target.email}).`);
      }
    }
    setBroadcastTitle(''); setBroadcastBody(''); setTimeout(()=>setMsgSuccess(null), 4000); onRefresh();
  };

  // ─── Filters ──────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => 
    [u.firstName,u.lastName,u.email,u.postcode||''].some(s => s.toLowerCase().includes(userSearch.toLowerCase()))
  );
  const filteredTags = tags.filter(t => 
    t.serialNumber.toLowerCase().includes(tagSearch.toLowerCase()) && (tagFilter === 'All' || t.status === tagFilter)
  );
  const filteredReports = reports.filter(r => 
    reportFilter === 'All' || r.reportType === reportFilter || r.status === reportFilter
  );
  const filteredLogs = auditLogs.filter(l => 
    [l.action,l.userId,l.status].some(s => s.toLowerCase().includes(logSearch.toLowerCase()))
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 select-none space-y-6">
      {/* Top Quick Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#45D153] bg-[#04352b] border border-[#064e3f] hover:border-[#45D153] hover:bg-[#064e3f] rounded-xl transition-all cursor-pointer shadow-sm"
          title="Return to Public Home Screen"
        >
          <Home className="h-4 w-4 text-[#45D153]" />
          <span>Home Screen</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#02241d] p-6 rounded-2xl border border-[#064e3f] shadow-lg text-white">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
            SBT Municipal Command Node
          </h1>
          <p className="text-emerald-300 text-xs sm:text-sm mt-1 font-mono uppercase tracking-wider">DISTRICT SYSTEM CONTROL • LIVE TELEMETRY</p>
        </div>
        <div className="flex flex-wrap bg-[#011a14] p-1.5 rounded-xl border border-[#064e3f] gap-1">
          {[
            {id:'dashboard',label:'Live Map & KPIs',count:''},
            {id:'users',label:'Homeowners',count:`(${totalUsers})`},
            {id:'tags',label:'Physical Tags',count:`(${totalTags.toLocaleString()})`},
            {id:'reports',label:'Incidents',count:`(${openReportsCount})`},
            {id:'tickets',label:'Support Tickets',count:`(${tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length})`},
            {id:'messaging',label:'Broadcast & Chat',count:''},
            {id:'history',label:'History Audit',count:''}
          ].map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab===tab.id?'bg-[#45D153] text-[#04352b]':'text-gray-400 hover:text-white'}`}>
              {tab.label}{tab.count}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Dashboard ─── */}
      {activeTab==='dashboard' && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-white">
          <div className="bg-[#04352b] p-5 rounded-2xl border border-[#064e3f]">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Total Registrations</span>
            <p className="text-3xl font-extrabold mt-2">{totalUsers}</p>
            <div className="flex items-center gap-1 mt-2 text-[#45D153] text-xs font-mono"><Users className="h-3.5 w-3.5" />NHOST SYNCED</div>
          </div>
          <div className="bg-[#04352b] p-5 rounded-2xl border border-[#064e3f]">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Linked Smart Plates</span>
            <p className="text-3xl font-extrabold mt-2 text-[#45D153]">{registeredTags}</p>
            <div className="text-emerald-300 text-[10px] font-mono mt-2">{availableTags.toLocaleString()} UNASSIGNED</div>
          </div>
          <div className="bg-[#04352b] p-5 rounded-2xl border border-[#064e3f]">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Lost & Damage Alerts</span>
            <p className="text-3xl font-extrabold mt-2 text-rose-400">{lostBinsCount+damagedBinsCount}</p>
            <div className="text-rose-300 text-[10px] font-mono mt-2"><AlertTriangle className="h-3.5 w-3.5 inline" /> RECOVERIES</div>
          </div>
          <div className="bg-[#04352b] p-5 rounded-2xl border border-[#064e3f]">
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Nhost Gateway</span>
            <p className="text-xl font-mono mt-2 text-[#45D153] flex items-center gap-1"><CheckCircle className="h-5 w-5" />ONLINE 100%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#02241d]/85 border border-[#064e3f] p-5 rounded-2xl text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-[#45D153] font-mono flex items-center gap-1.5"><Globe className="h-4 w-4" />Live UK Smart Tag Grid</h3>
                <p className="text-[10px] text-emerald-100/60 mt-0.5">Real‑time telemetry map</p>
              </div>
              <div className="flex bg-[#011a14] border border-[#064e3f] p-1 rounded-lg gap-1 text-[9px] font-mono">
                {(['color','voyager','dark'] as const).map(s => (
                  <button key={s} onClick={()=>setMapStyle(s)}
                    className={`px-2 py-0.5 rounded uppercase ${mapStyle===s?'bg-[#45D153] text-[#04352b]':'text-emerald-300 hover:text-white'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div id="leaflet-admin-map" className="w-full h-[400px] bg-[#011713] rounded-xl border border-[#064e3f] overflow-hidden" />
            <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-mono text-emerald-300 bg-[#011713]/40 p-2.5 rounded-lg">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#45D153]"></span>Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Missing</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>Damaged</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>Selected</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-2xl text-white">
              <div className="flex justify-between items-start border-b border-[#064e3f] pb-3 mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#45D153] font-mono">Live Plate Inspector</h4>
                  <p className="text-[10px] text-emerald-100/50 mt-0.5">Click a map marker</p>
                </div>
                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">Telemetry</span>
              </div>
              {!selectedMapBin ? (
                <div className="text-center py-16 text-emerald-100/40 space-y-2">
                  <Globe className="h-10 w-10 mx-auto animate-pulse" />
                  <p className="text-xs">Select a marker to inspect details and apply overrides.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="bg-[#011a14] p-4 rounded-xl border border-[#064e3f] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-[#45D153]">{selectedMapBin.serialNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${selectedMapBin.status==='Active'?'bg-[#45D153]/10 text-[#45D153]':'bg-rose-950/40 text-rose-300'}`}>{selectedMapBin.status}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase block">Owner</span>
                      <span className="font-bold">{selectedMapUser?`${selectedMapUser.firstName} ${selectedMapUser.lastName}`:'Unknown'}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{selectedMapUser?.email}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase block">Address</span>
                      <span className="font-medium">{selectedMapBin.houseNumber} {selectedMapBin.street}, {selectedMapBin.town}, {selectedMapBin.postcode}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase block">Next Collection</span>
                      <span className="text-[#45D153] font-bold">{selectedMapBin.nextCollection||'Paused'}</span>
                    </div>
                  </div>
                  {isEditingBin ? (
                    <form onSubmit={handleSaveMapDetails} className="space-y-3 bg-[#011a14]/60 p-4 rounded-xl border border-amber-500/20">
                      <h5 className="text-[10px] font-black text-amber-400 uppercase">Override Details</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="block text-[9px] text-gray-400 font-mono mb-1">House No</label><input type="text" value={editHouse} onChange={e=>setEditHouse(e.target.value)} className="w-full h-8 bg-emerald-950/40 border border-[#064e3f] rounded px-2 text-white font-mono text-xs" required /></div>
                        <div><label className="block text-[9px] text-gray-400 font-mono mb-1">Postcode</label><input type="text" value={editPostcode} onChange={e=>setEditPostcode(e.target.value)} className="w-full h-8 bg-emerald-950/40 border border-[#064e3f] rounded px-2 text-white font-mono text-xs" required /></div>
                      </div>
                      <div><label className="block text-[9px] text-gray-400 font-mono mb-1">Street</label><input type="text" value={editStreet} onChange={e=>setEditStreet(e.target.value)} className="w-full h-8 bg-emerald-950/40 border border-[#064e3f] rounded px-2 text-white font-mono text-xs" required /></div>
                      <div><label className="block text-[9px] text-gray-400 font-mono mb-1">Town</label><input type="text" value={editTown} onChange={e=>setEditTown(e.target.value)} className="w-full h-8 bg-emerald-950/40 border border-[#064e3f] rounded px-2 text-white font-mono text-xs" required /></div>
                      <div><label className="block text-[9px] text-gray-400 font-mono mb-1">Owner Email</label><input type="email" value={editUserEmail} onChange={e=>setEditUserEmail(e.target.value)} className="w-full h-8 bg-emerald-950/40 border border-[#064e3f] rounded px-2 text-white font-mono text-xs" required /></div>
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={()=>setIsEditingBin(false)} className="px-2.5 py-1 bg-slate-800 text-white rounded text-[10px]">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded text-[10px]">Save</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-2 pt-2">
                      <button onClick={()=>{setIsEditingBin(true); setEditHouse(selectedMapBin.houseNumber); setEditStreet(selectedMapBin.street); setEditTown(selectedMapBin.town); setEditPostcode(selectedMapBin.postcode); setEditUserEmail(selectedMapUser?.email||'');}}
                        className="w-full py-2 border border-[#45D153]/30 hover:bg-[#45D153]/10 text-[#45D153] font-black rounded-lg text-[10px] uppercase flex items-center justify-center gap-1.5"><Edit className="h-3.5 w-3.5" />Edit</button>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={()=>requestResetTag(selectedMapBin.serialNumber, selectedMapBin.binType, selectedMapUser ? `${selectedMapUser.firstName} ${selectedMapUser.lastName}` : undefined)} className="py-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 font-bold rounded-lg text-[10px] uppercase cursor-pointer">Reset Tag</button>
                        <button onClick={()=>selectedMapUser&&requestDeleteUser(selectedMapUser.uid,selectedMapUser.email)} className="py-2 bg-rose-900/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 font-bold rounded-lg text-[10px] uppercase cursor-pointer">Delete User</button>
                      </div>
                    </div>
                  )}
                  <div className="pt-4 mt-4 border-t border-[#064e3f] text-[9.5px] text-emerald-100/50 flex items-start gap-1.5">
                    <Info className="h-4 w-4 text-[#45D153] flex-shrink-0" />
                    <span>Changes save directly to Nhost in real‑time.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>}

      {/* ─── Users ─── */}
      {activeTab==='users' && <>
        <div className="flex gap-2 bg-[#02241d] border border-[#064e3f] rounded-xl p-3 max-w-md">
          <Search className="h-5 w-5 text-[#45D153]" />
          <input type="text" value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search name, email, postcode…" className="w-full text-xs bg-transparent text-white placeholder-emerald-100/40 outline-none" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-mono sticky top-0">
                <tr><th className="px-6 py-3.5">Homeowner</th><th className="px-6 py-3.5">Role</th><th className="px-6 py-3.5">Postcode</th><th className="px-6 py-3.5">Registered</th><th className="px-6 py-3.5">Status & Linked Tags</th><th className="px-6 py-3.5 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => {
                  const uBins = bins.filter(b => b.ownerId === u.uid);
                  return (
                    <tr key={u.uid} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {u.profilePhoto ? (
                            <img
                              src={u.profilePhoto}
                              alt={`${u.firstName} ${u.lastName}`}
                              className="h-8 w-8 rounded-full object-cover border border-emerald-200 bg-emerald-50 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-emerald-50 text-[#04352b] flex items-center justify-center font-bold border border-emerald-100 shrink-0">{u.firstName[0]}{u.lastName[0]}</div>
                          )}
                          <div><p className="font-bold text-gray-900">{u.firstName} {u.lastName}</p><p className="text-[10px] text-gray-400 font-mono">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${u.accountType==='admin'?'bg-amber-100 text-amber-800':'bg-gray-100 text-gray-500'}`}>{u.accountType}</span></td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-600">{u.postcode||'–'}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.status==='Active'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>{u.status}</span>
                            <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                              {uBins.length} Tag{uBins.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {uBins.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {uBins.map((b, idx) => (
                                <span
                                  key={b.binId || idx}
                                  className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#04352b] border border-emerald-200 text-[10px] font-mono font-bold transition-all shadow-2xs group"
                                  title={`${b.binType} Bin • ${b.houseNumber} ${b.street}`}
                                >
                                  <span className="text-emerald-700">Tag {idx + 1}:</span>
                                  <span className="font-mono">{b.serialNumber}</span>
                                  <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-200/90 text-emerald-950 font-black uppercase">{b.binType}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); requestResetTag(b.serialNumber, b.binType, `${u.firstName} ${u.lastName}`); }}
                                    className="ml-1 p-0.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer"
                                    title={`Delete ONLY tag ${b.serialNumber} (preserves homeowner account profile)`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] font-mono text-gray-400 italic">No tags registered</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAddTagModal(u)}
                          className="px-2.5 py-1 bg-[#04352b] hover:bg-[#064e3f] text-[#45D153] border border-[#064e3f] rounded text-[10px] font-black uppercase transition-all shadow-xs cursor-pointer"
                          title={`Add Smart Bin Tag for ${u.firstName}`}
                        >
                          + Tag
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.email)}
                          className="px-2 py-1 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded text-[10px] font-bold cursor-pointer"
                          title="Generate temporary password"
                        >
                          Reset Pass
                        </button>
                        {u.accountType !== 'admin' && (
                          <button
                            onClick={() => requestResetUserAssociation(u.uid, u.email)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 rounded text-[10px] font-bold cursor-pointer"
                            title="Unlink all tags assigned to this homeowner"
                          >
                            Reset Assoc
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUserStatus(u.uid, u.status)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                            u.status === 'Active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                          }`}
                          title={u.status === 'Active' ? 'Suspend homeowner account' : 'Reactivate homeowner account'}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => requestDeleteUser(u.uid, u.email)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded text-[10px] font-bold cursor-pointer"
                          title="Permanently delete user profile & tags"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>}

      {/* ─── Physical Tags ─── */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-[#02241d] border border-[#064e3f] p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 py-2 w-full sm:w-80">
              <Search className="h-4 w-4 text-[#45D153]" />
              <input
                type="text"
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                placeholder="Search tag serial (e.g. SBT-00000000)..."
                className="w-full text-xs bg-transparent text-white placeholder-emerald-100/40 outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-300">Filter:</span>
              {(['All', 'Registered', 'Available', 'Disabled'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTagFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    tagFilter === st ? 'bg-[#45D153] text-[#04352b]' : 'bg-[#011a14] text-gray-300 hover:text-white border border-[#064e3f]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 uppercase font-mono sticky top-0">
                  <tr>
                    <th className="px-6 py-3.5">Serial Number</th>
                    <th className="px-6 py-3.5">Bin Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Registered To</th>
                    <th className="px-6 py-3.5">Address & Postcode</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTags.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic font-mono">
                        No physical tags matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTags.slice(0, 100).map(t => {
                      const owner = users.find(u => u.uid === t.ownerId);
                      const bin = bins.find(b => b.serialNumber === t.serialNumber);
                      return (
                        <tr key={t.serialNumber} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-mono font-black text-[#04352b]">{t.serialNumber}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold font-mono text-[10px]">
                              {bin?.binType || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                t.status === 'Registered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'Available'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {owner ? (
                              <div>
                                <p className="font-bold text-gray-900">{owner.firstName} {owner.lastName}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{owner.email}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Unassigned Stock</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {bin ? (
                              <p className="font-medium text-gray-700">
                                {bin.houseNumber} {bin.street}, {bin.postcode}
                              </p>
                            ) : owner ? (
                              <p className="font-medium text-gray-700">{owner.postcode || 'N/A'}</p>
                            ) : (
                              <span className="text-gray-400 font-mono text-[10px]">LN5 8PE (Warehouse)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditTagModal(t)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => requestResetTag(t.serialNumber, bin?.binType, owner ? `${owner.firstName} ${owner.lastName}` : undefined)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10px] font-bold cursor-pointer"
                              title="Unlink tag from homeowner and reset to Available stock"
                            >
                              Reset Tag
                            </button>
                            <button
                              onClick={() => requestResetTag(t.serialNumber, bin?.binType, owner ? `${owner.firstName} ${owner.lastName}` : undefined)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              title="Delete tag record and return to Available stock"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Incidents & Reports ─── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-[#02241d] border border-[#064e3f] p-4 rounded-xl text-white">
            <span className="text-xs font-mono text-emerald-300">Filter Incidents:</span>
            {(['All', 'Lost', 'Damaged', 'Resolved', 'Archived'] as const).map(rf => (
              <button
                key={rf}
                onClick={() => setReportFilter(rf)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  reportFilter === rf ? 'bg-[#45D153] text-[#04352b]' : 'bg-[#011a14] text-gray-300 hover:text-white border border-[#064e3f]'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 uppercase font-mono sticky top-0">
                  <tr>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Serial Tag</th>
                    <th className="px-6 py-3.5">Reporter / Email</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic font-mono">
                        No incident reports matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map(r => (
                      <tr key={r.reportId} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              r.reportType === 'Found' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.reportType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-[#04352b]">{r.serialNumber}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{r.finderName || 'Homeowner'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{r.finderEmail || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-700">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{r.description || 'No additional details.'}</td>
                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          {r.status !== 'Resolved' && (
                            <button
                              onClick={() => handleResolveReport(r.reportId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Resolve
                            </button>
                          )}
                          {r.status !== 'Archived' && (
                            <button
                              onClick={() => handleArchiveReport(r.reportId)}
                              className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-[10px] font-bold"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => requestDeleteReport(r.reportId)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Broadcast & Messaging ─── */}
      {activeTab === 'messaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#02241d] border border-[#064e3f] p-6 rounded-2xl text-white space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-black uppercase text-[#45D153] font-mono flex items-center gap-2">
                <Send className="h-4 w-4" />
                Dispatch Broadcast or Direct Message
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Send real-time alerts or messages that sync instantly with Nhost / Hasura backend databases.
              </p>
            </div>

            {msgSuccess && (
              <div className="p-3 bg-emerald-950 border border-[#45D153] text-[#45D153] rounded-xl text-xs font-bold font-mono">
                {msgSuccess}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-emerald-400 uppercase mb-1">Target Recipient</label>
                <select
                  value={msgTarget}
                  onChange={e => setMsgTarget(e.target.value)}
                  className="w-full h-10 bg-[#011a14] border border-[#064e3f] rounded-xl px-3 text-white font-sans outline-none focus:border-[#45D153]"
                >
                  <option value="all">All Registered Homeowners (Broadcast)</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-emerald-400 uppercase mb-1">Message Subject / Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Bank Holiday Collection Schedule Notice"
                  className="w-full h-10 bg-[#011a14] border border-[#064e3f] rounded-xl px-3 text-white outline-none focus:border-[#45D153]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-emerald-400 uppercase mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={e => setBroadcastBody(e.target.value)}
                  placeholder="Type message text here..."
                  className="w-full bg-[#011a14] border border-[#064e3f] rounded-xl p-3 text-white outline-none focus:border-[#45D153]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] font-black uppercase rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Send Message & Sync to Nhost
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white border border-gray-100 p-6 rounded-2xl space-y-4 shadow-xs">
            <h4 className="text-xs font-black uppercase text-gray-900 font-mono">Recent Dispatched Messages</h4>
            <div className="space-y-3 max-h-[450px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No messages sent yet.</p>
              ) : (
                messages.slice(0, 30).map(m => (
                  <div key={m.messageId} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                      <span className="font-bold text-gray-700">{m.senderName} ({m.senderEmail || 'N/A'})</span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(m.createdAt).toLocaleString()}</span>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this message from chat feed & Nhost backend?')) {
                              mockDb.deleteMessage(m.messageId);
                              onRefresh();
                            }
                          }}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 bg-white p-2 rounded-lg border border-gray-100">{m.message}</p>
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#04352b] font-bold">
                      <span>Tag: {m.serialNumber}</span>
                      <span>Owner: {m.ownerId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Municipal Support Tickets Control ─── */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="bg-[#02241d] border border-[#064e3f] p-6 rounded-2xl text-white space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#064e3f] pb-4">
              <div>
                <h3 className="text-sm font-black uppercase text-[#45D153] font-mono flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  Municipal Support Tickets Control
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Read, manage, update status, and delete support tickets sent by users. All updates sync directly to Nhost / Hasura support_tickets database.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Total Tickets: {tickets.length}
                </span>
                <button
                  onClick={() => {
                    setTickets(mockDb.getSupportTickets('ALL'));
                    onRefresh();
                  }}
                  className="px-3 py-1.5 bg-[#064e3f] hover:bg-[#04352b] text-[#45D153] border border-[#45D153]/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                  placeholder="Search subject, description, ticket ID, or user ID..."
                  className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-xl pl-9 pr-3 text-xs text-white placeholder-emerald-100/40 outline-none focus:border-[#45D153] font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1 bg-[#011a14] p-1 rounded-xl border border-[#064e3f]">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setTicketFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase font-mono transition-all cursor-pointer ${
                      ticketFilter === st ? 'bg-[#45D153] text-[#04352b]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets Grid / List */}
            {tickets.filter(t => {
              const matchFilter = ticketFilter === 'ALL' ? true : t.status === ticketFilter;
              const q = ticketSearch.toLowerCase().trim();
              const matchSearch = !q || 
                t.subject.toLowerCase().includes(q) || 
                (t.description || '').toLowerCase().includes(q) ||
                t.id.toLowerCase().includes(q) ||
                t.userId.toLowerCase().includes(q);
              return matchFilter && matchSearch;
            }).length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-100/60 font-mono bg-[#011a14] rounded-2xl border border-[#064e3f]">
                No support tickets match the selected criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.filter(t => {
                  const matchFilter = ticketFilter === 'ALL' ? true : t.status === ticketFilter;
                  const q = ticketSearch.toLowerCase().trim();
                  const matchSearch = !q || 
                    t.subject.toLowerCase().includes(q) || 
                    (t.description || '').toLowerCase().includes(q) ||
                    t.id.toLowerCase().includes(q) ||
                    t.userId.toLowerCase().includes(q);
                  return matchFilter && matchSearch;
                }).map(t => {
                  const submitter = users.find(u => u.uid === t.userId);
                  return (
                    <div key={t.id} className="bg-[#011a14] border border-[#064e3f] rounded-2xl p-4 space-y-3 shadow-md flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block">ID: {t.id}</span>
                            <h4 className="font-bold text-white text-sm mt-0.5">{t.subject}</h4>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                              t.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              t.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-[#064e3f] text-[#45D153]'
                            }`}>
                              {t.priority}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                              t.status === 'OPEN' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' :
                              t.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              t.status === 'RESOLVED' ? 'bg-emerald-950 text-[#45D153] border border-[#45D153]/40' :
                              'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#02241d] p-3 rounded-xl border border-[#064e3f]/60 text-xs text-emerald-100/90 leading-relaxed font-sans">
                          {t.description}
                        </div>

                        <div className="text-[10px] font-mono text-gray-400 space-y-0.5 pt-1">
                          <div>Submitter: <span className="text-emerald-300 font-bold">{submitter ? `${submitter.firstName} ${submitter.lastName} (${submitter.email})` : t.userId}</span></div>
                          <div>Submitted: {new Date(t.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="pt-3 border-t border-[#064e3f] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-gray-400 uppercase">Set Status:</span>
                          <select
                            value={t.status}
                            onChange={(e) => {
                              const newSt = e.target.value as any;
                              mockDb.updateSupportTicketStatus(t.id, newSt);
                              setTickets(mockDb.getSupportTickets('ALL'));
                              onRefresh();
                            }}
                            className="bg-[#04352b] border border-[#064e3f] text-[#45D153] rounded-lg text-[10px] font-mono font-bold px-2 py-1 outline-none cursor-pointer focus:border-[#45D153]"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete support ticket ${t.id}?`)) {
                              mockDb.deleteSupportTicket(t.id);
                              setTickets(mockDb.getSupportTickets('ALL'));
                              onRefresh();
                            }
                          }}
                          className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Audit History ─── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-[#02241d] border border-[#064e3f] p-4 rounded-xl text-white">
            <Search className="h-4 w-4 text-[#45D153]" />
            <input
              type="text"
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Filter audit log action, user ID, status..."
              className="w-full text-xs bg-transparent text-white placeholder-emerald-100/40 outline-none font-mono"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 uppercase font-mono sticky top-0">
                  <tr>
                    <th className="px-6 py-3.5">Action</th>
                    <th className="px-6 py-3.5">User ID</th>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                        No audit logs recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3.5 font-bold text-gray-900">{l.action}</td>
                        <td className="px-6 py-3.5 text-gray-600">{l.userId}</td>
                        <td className="px-6 py-3.5 text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              l.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-400">{l.ipAddress}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tag Modal (Physical Tags Tab) */}
      {editingTag && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02241d] border border-[#064e3f] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#064e3f] pb-3">
              <div>
                <h3 className="text-sm font-black text-amber-400 uppercase font-mono">Edit Tag {editingTag.serialNumber}</h3>
                <p className="text-xs text-gray-300 font-sans mt-0.5">Override bin details & location in Nhost</p>
              </div>
              <button onClick={() => setEditingTag(null)} className="text-gray-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTagEdits} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-amber-400 font-mono uppercase mb-1">Bin Type</label>
                <select
                  value={editTagBinType}
                  onChange={e => setEditTagBinType(e.target.value as any)}
                  className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-2 text-white font-sans outline-none focus:border-amber-400"
                >
                  <option value="Green">Green (General)</option>
                  <option value="Blue">Blue (Recycling)</option>
                  <option value="Brown">Brown (Garden/Food)</option>
                  <option value="Black">Black (Residual)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-amber-400 font-mono uppercase mb-1">House Number</label>
                  <input
                    type="text"
                    value={editTagHouse}
                    onChange={e => setEditTagHouse(e.target.value)}
                    className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-amber-400 font-mono uppercase mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editTagPostcode}
                    onChange={e => setEditTagPostcode(e.target.value.toUpperCase())}
                    className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white font-mono uppercase outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-amber-400 font-mono uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={editTagStreet}
                  onChange={e => setEditTagStreet(e.target.value)}
                  className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-amber-400 font-mono uppercase mb-1">Town / City</label>
                <input
                  type="text"
                  value={editTagTown}
                  onChange={e => setEditTagTown(e.target.value)}
                  className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded-lg text-xs shadow-md"
                >
                  Save Tag Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tag to Homeowner Modal */}
      {addTagModalUser && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02241d] border border-[#064e3f] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#064e3f] pb-3">
              <div>
                <h3 className="text-sm font-black text-[#45D153] uppercase font-mono">Assign Tag to Homeowner</h3>
                <p className="text-xs text-gray-300 font-sans mt-0.5">{addTagModalUser.firstName} {addTagModalUser.lastName} ({addTagModalUser.email})</p>
              </div>
              <button onClick={() => setAddTagModalUser(null)} className="text-gray-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdminAddTagToUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-emerald-400 font-mono uppercase mb-1">Tag Serial Number</label>
                <input
                  type="text"
                  value={newTagSerial}
                  onChange={e => setNewTagSerial(e.target.value)}
                  className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white font-mono font-bold outline-none focus:border-[#45D153]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-emerald-400 font-mono uppercase mb-1">Bin Type</label>
                  <select
                    value={newTagBinType}
                    onChange={e => setNewTagBinType(e.target.value as any)}
                    className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-2 text-white font-sans outline-none focus:border-[#45D153]"
                  >
                    <option value="Green">Green (General)</option>
                    <option value="Blue">Blue (Recycling)</option>
                    <option value="Brown">Brown (Garden/Food)</option>
                    <option value="Black">Black (Residual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-emerald-400 font-mono uppercase mb-1">Collection Day</label>
                  <select
                    value={newTagCollectionDay}
                    onChange={e => setNewTagCollectionDay(e.target.value)}
                    className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-2 text-white font-sans outline-none focus:border-[#45D153]"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-emerald-400 font-mono uppercase mb-1">Postcode *</label>
                  <input
                    type="text"
                    value={newTagPostcode}
                    onChange={e => setNewTagPostcode(e.target.value.toUpperCase())}
                    className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white font-mono uppercase outline-none focus:border-[#45D153]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-400 font-mono uppercase mb-1">House Number *</label>
                  <input
                    type="text"
                    value={newTagHouse}
                    onChange={e => setNewTagHouse(e.target.value)}
                    className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white outline-none focus:border-[#45D153]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-emerald-400 font-mono uppercase mb-1">Street Address *</label>
                <input
                  type="text"
                  value={newTagStreet}
                  onChange={e => setNewTagStreet(e.target.value)}
                  className="w-full h-9 bg-[#011a14] border border-[#064e3f] rounded-lg px-3 text-white outline-none focus:border-[#45D153]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddTagModalUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] font-black uppercase rounded-lg text-xs shadow-md"
                >
                  Assign Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Custom Confirmation Modal ─── */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02241d] border border-[#064e3f] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-full flex-shrink-0 ${
                confirmModal.variant === 'danger' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                confirmModal.variant === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase font-mono text-white tracking-wide">{confirmModal.title}</h3>
                <p className="text-xs text-gray-200 leading-relaxed">{confirmModal.message}</p>
                {confirmModal.subMessage && (
                  <p className="text-[11px] text-emerald-300/80 font-mono pt-1 leading-snug">{confirmModal.subMessage}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#064e3f] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(null);
                  await action();
                }}
                className={`px-4 py-2 font-black uppercase rounded-lg text-xs shadow-md transition-all cursor-pointer ${
                  confirmModal.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : confirmModal.variant === 'amber'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b]'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Password Reset Display Modal ─── */}
      {resetPassInfo && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02241d] border border-[#064e3f] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#064e3f] pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#45D153]" />
                <h3 className="text-sm font-black text-[#45D153] uppercase font-mono">Password Reset Generated</h3>
              </div>
              <button onClick={() => setResetPassInfo(null)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-200">
                Temporary login password generated for <span className="font-mono font-bold text-emerald-300">{resetPassInfo.email}</span>:
              </p>
              <div className="bg-[#011a14] border border-[#064e3f] rounded-xl p-3 flex items-center justify-between">
                <span className="font-mono font-black text-lg text-[#45D153] tracking-wider select-all">{resetPassInfo.pass}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetPassInfo.pass);
                    showToast('Temporary password copied to clipboard!', 'success');
                  }}
                  className="px-3 py-1 bg-[#064e3f] hover:bg-[#086a55] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <p className="text-[10px] text-gray-400 italic">
                The homeowner can use this password immediately to log into their dashboard.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setResetPassInfo(null)}
                className="px-5 py-2 bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] font-black uppercase rounded-lg text-xs cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification Banner ─── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium animate-in slide-in-from-bottom-5 duration-200 max-w-md bg-[#02241d] border-[#064e3f] text-white">
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-[#45D153] flex-shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-amber-400 flex-shrink-0" />}
          <span className="leading-snug">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-gray-400 hover:text-white p-1 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}