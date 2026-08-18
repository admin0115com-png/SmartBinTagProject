import React, { useState, useEffect, useCallback } from 'react';
import { mockDb } from '../mockDb';
import type { BinReport } from '../types';
import { 
  AlertCircle, CheckCircle, MapPin, Mail, MessageSquare, Phone, 
  User as UserIcon, Send, Upload, X, Check, ArrowLeft
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ==== Type Definitions ====
type ActionType = 'found' | 'damaged';

interface TargetBinInfo {
  binType?: string;
  status?: string;
  registered: boolean;
}

interface SelectedCoords {
  lat: number;
  lng: number;
}

interface ReportsProps {
  initialAction: ActionType;
  initialSerial?: string;
  setView: (view: string, params?: Record<string, unknown>) => void;
  onRefresh: () => void;
}

// ==== Component ====
export default function Reports({
  initialAction,
  initialSerial,
  setView,
  onRefresh
}: ReportsProps) {
  const currentUser = mockDb.getCurrentUser();
  const isAdmin = currentUser?.accountType === 'admin';

  // Allow any user (guest, homeowner, admin) to submit found or damaged bin reports
  const getValidInitialAction = useCallback((): ActionType => {
    return initialAction === 'damaged' ? 'damaged' : 'found';
  }, [initialAction]);

  const [action, setAction] = useState<ActionType>(getValidInitialAction);
  const [serialNumber, setSerialNumber] = useState(initialSerial || '');
  const [isValidated, setIsValidated] = useState(false);
  const [targetBinInfo, setTargetBinInfo] = useState<TargetBinInfo | null>(null);

  // Form Fields
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [postcode, setPostcode] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [finderName, setFinderName] = useState('');
  const [finderEmail, setFinderEmail] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [messageText, setMessageText] = useState('');

  // Status
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<SelectedCoords | null>(null);

  // Validate pre-filled serial number on mount
  useEffect(() => {
    if (initialSerial) {
      setSerialNumber(initialSerial);
      validateSerial(initialSerial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSerial]);

  // Clear errors when switching tabs
  useEffect(() => {
    setError(null);
    if (serialNumber) validateSerial(serialNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  // Serial Validation Logic
  const validateSerial = useCallback((serial: string): boolean => {
    setError(null);
    const trimmedSerial = serial.trim().toUpperCase();

    if (!trimmedSerial) {
      setIsValidated(false);
      setTargetBinInfo(null);
      return false;
    }

    const validationResult = mockDb.validateSerialNumber(trimmedSerial);
    if (validationResult.valid && validationResult.tag) {
      setIsValidated(true);
      const bins = mockDb.getBins();
      const matchedBin = bins.find(b => b.serialNumber === validationResult.tag!.serialNumber);
      setTargetBinInfo(matchedBin 
        ? { binType: matchedBin.binType, status: matchedBin.status, registered: true }
        : { registered: false }
      );
      return true;
    }

    setIsValidated(false);
    setTargetBinInfo(null);
    setError(validationResult.error || 'This Serial Number does not exist or has been disabled.');
    return false;
  }, []);

  const handleSerialBlur = () => validateSerial(serialNumber);
  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSerialNumber(val);
    if (val.length >= 12) validateSerial(val);
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateSerial(serialNumber)) return;

    if (action === 'found') {
      if (!location.trim()) {
        setError('Please specify where you found the wheelie bin.');
        return;
      }

      mockDb.submitReport({
        serialNumber: serialNumber.trim().toUpperCase(),
        reportType: 'Found',
        description: messageText.trim() || undefined,
        location: location.trim(),
        postcode: postcode.trim() || undefined,
        houseNumber: houseNumber.trim() || undefined,
        gpsCoordinates: gpsCoordinates.trim() || undefined,
        photoUrl: photoUrl || undefined,
        finderName: finderName.trim() || undefined,
        finderEmail: finderEmail.trim() || undefined,
        finderPhone: finderPhone.trim() || undefined
      });
    } else if (action === 'damaged') {
      if (!description.trim()) {
        setError('Please describe the bin damage details.');
        return;
      }

      mockDb.submitReport({
        serialNumber: serialNumber.trim().toUpperCase(),
        reportType: 'Damaged',
        description: description.trim(),
        location: location.trim() || 'Stored homeowner location',
        gpsCoordinates: gpsCoordinates.trim() || undefined,
        photoUrl: photoUrl || undefined,
        finderName: finderName.trim() || undefined,
        finderEmail: finderEmail.trim() || undefined
      });
    }

    setSuccess(true);
    onRefresh();
  };

  // Full Form Reset
  const resetForm = () => {
    setSerialNumber('');
    setIsValidated(false);
    setTargetBinInfo(null);
    setDescription('');
    setLocation('');
    setPostcode('');
    setHouseNumber('');
    setGpsCoordinates('');
    setPhotoUrl(null);
    setFinderName('');
    setFinderEmail('');
    setFinderPhone('');
    setMessageText('');
    setSuccess(false);
    setError(null);
    setSelectedCoords(null);
  };

  // Map Initialization & Cleanup
  useEffect(() => {
    if (!isMapModalOpen) return;

    const timer = setTimeout(() => {
      const mapEl = document.getElementById('click-map');
      if (!mapEl) return;

      const map = L.map('click-map').setView([53.2294, -0.5386], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const greenMarkerIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div class="relative flex items-center justify-center h-6 w-6">
            <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-[#45D153] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-[#45D153] border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      let marker: L.Marker | null = null;
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedCoords({ lat, lng });
        marker ? marker.setLatLng(e.latlng) : (marker = L.marker(e.latlng, { icon: greenMarkerIcon }).addTo(map));
      };

      map.on('click', handleMapClick);
      return () => { map.off('click', handleMapClick); map.remove(); };
    }, 150);

    return () => clearTimeout(timer);
  }, [isMapModalOpen]);

  const handleSaveMapLocation = () => {
    if (!selectedCoords) return;
    const { lat, lng } = selectedCoords;
    setGpsCoordinates(`${lat.toFixed(6)}° N, ${lng.toFixed(6)}° W`);
    setLocation("High Street, Lincoln (Pinned on Map)");
    setPostcode("LN5 8HE");
    setHouseNumber("78");
    setIsMapModalOpen(false);
  };

  const getHeaderIcon = () => {
    switch (action) {
      case 'found': return <MapPin className="h-7 w-7 text-amber-400 animate-bounce" />;
      case 'damaged': return <AlertCircle className="h-7 w-7 text-rose-500 animate-pulse" />;
    }
  };

  // ==== Render ====
  return (
    <div className="max-w-xl mx-auto px-4 pt-3 sm:pt-4 pb-8 select-none">
      {/* Back Button */}
      <div className="flex items-center justify-start mb-6">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#45D153] bg-[#04352b] border border-[#064e3f] hover:border-[#45D153] hover:bg-[#064e3f] rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-[#45D153]" />
          <span>Back to Home Screen</span>
        </button>
      </div>

      {/* Action Tabs */}
      {!success && (
        <div className="flex border border-[#064e3f] mb-8 max-w-sm mx-auto bg-[#011a14] p-1 rounded-xl">
          <button 
            onClick={() => setAction('found')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${action === 'found' ? 'bg-[#02241d] text-[#45D153] border border-[#064e3f]' : 'text-gray-400 hover:text-white'}`}
          >
            Found Bin
          </button>
          <button 
            onClick={() => setAction('damaged')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${action === 'damaged' ? 'bg-[#02241d] text-[#45D153] border border-[#064e3f]' : 'text-gray-400 hover:text-white'}`}
          >
            Damaged Bin
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-[#02241d] rounded-2xl border border-[#064e3f] shadow-2xl p-8 sm:p-10 text-white">
        {success ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-[#45D153]/10 text-[#45D153] border border-[#45D153]/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Report Submitted!</h2>
              <p className="text-sm text-emerald-100/70 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you! The owner has been notified via secure dashboard, email, and mobile alerts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setView('home')}
                className="w-full h-[52px] rounded-xl bg-[#011a14] text-white border border-[#064e3f] font-bold hover:bg-[#02241d] transition-all flex items-center justify-center text-xs uppercase tracking-wider cursor-pointer"
              >
                Back to Home
              </button>
              <button 
                onClick={resetForm}
                className="w-full h-[52px] rounded-xl bg-[#45D153] text-white font-black hover:bg-[#5ce06a] border border-[#45D153]/20 transition-all flex items-center justify-center text-xs uppercase tracking-wider cursor-pointer"
              >
                Submit New Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-6 border-b border-[#064e3f] pb-4">
              <div className="p-2 bg-[#011a14] rounded-xl border border-[#064e3f]">
                {getHeaderIcon()}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide leading-tight">
                  {action === 'found' && 'Report a Found Wheelie Bin'}
                  {action === 'damaged' && 'Report a Damaged Bin'}
                </h2>
                <p className="text-[11px] text-emerald-100/60 mt-0.5 font-sans">Your privacy is respected. Owner details are fully locked.</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Serial Number Field */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono">Smart Bin Tag Serial Number</label>
              <input 
                type="text" 
                value={serialNumber}
                onChange={handleSerialChange}
                onBlur={handleSerialBlur}
                placeholder="e.g. SBT-00000000"
                className="px-4 w-full h-[52px] bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white focus:border-[#45D153] outline-none font-mono tracking-wider font-bold uppercase transition-all"
                required
              />
              <p className="text-[10px] text-emerald-100/40 leading-normal">
                Printed directly on the label. Valid serials: SBT-00000000 to SBT-50000000.
              </p>
              
              {isValidated && targetBinInfo && (
                <div className="p-3 bg-[#45D153]/10 border border-[#45D153]/35 rounded-lg text-xs text-[#45D153] flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <Check className="h-4 w-4 text-[#45D153]" />
                    Valid Smart Tag: {serialNumber}
                  </span>
                  {targetBinInfo.registered && (
                    <span className="bg-[#45D153] text-[#04352b] font-black px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider">
                      {targetBinInfo.binType} Bin
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action-Specific Fields */}
            {action === 'found' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Where is the bin currently located?</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Blown down corner of High St & Elm Rd"
                    className="px-3.5 w-full h-[48px] bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white outline-none focus:border-[#45D153] transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Nearest Postcode</label>
                    <input 
                      type="text" 
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="e.g. LN5 8HE"
                      className="px-3.5 w-full h-[48px] bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white outline-none focus:border-[#45D153] transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Nearest House Number</label>
                    <input 
                      type="text" 
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="e.g. 78"
                      className="px-3.5 w-full h-[48px] bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white outline-none focus:border-[#45D153] transition-all font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">GPS Coordinates (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={gpsCoordinates}
                      onChange={(e) => setGpsCoordinates(e.target.value)}
                      placeholder="e.g. 53.2294° N, -0.5386° W"
                      className="px-3.5 flex-1 h-[48px] bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white outline-none focus:border-[#45D153] transition-all font-mono"
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsMapModalOpen(true)}
                      className="px-4 bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-[#45D153]/20 shadow-md uppercase tracking-wider"
                    >
                      <MapPin className="h-4 w-4" />
                      Select on Map
                    </button>
                  </div>
                </div>
              </div>
            )}

            {action === 'damaged' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Describe Bin Damage Details</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Side handle is completely sheared off / Split lid from garbage truck."
                    rows={3}
                    className="px-3.5 py-2 w-full bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white outline-none focus:border-[#45D153] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Photo Upload Section */}
            {(action === 'found' || action === 'damaged') && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Upload Photo (Recommended)</label>
                <div className="border-2 border-dashed border-[#064e3f] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 bg-[#011a14]/60 hover:border-[#45D153]/40 transition-colors relative">
                  {isUploadingPhoto ? (
                    <p className="text-xs text-[#45D153] font-semibold animate-pulse">Processing image...</p>
                  ) : photoUrl ? (
                    <div className="relative">
                      <img src={photoUrl} alt="Upload Preview" className="h-32 w-auto rounded-lg shadow-md object-cover border border-[#064e3f]" referrerPolicy="no-referrer" />
                      <button 
                        type="button" 
                        onClick={() => setPhotoUrl(null)} 
                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-emerald-500/60" />
                      <p className="text-xs text-emerald-100/70 font-semibold">Drag & drop or <span className="text-[#45D153] underline cursor-pointer">browse files</span></p>
                      <p className="text-[10px] text-emerald-100/40">PNG, JPG up to 5MB</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            )}

            {/* Contact Details Section */}
            <div className="border-t border-[#064e3f] pt-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                Finder Details (Optional)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Your Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                    <input 
                      type="text" 
                      value={finderName}
                      onChange={(e) => setFinderName(e.target.value)}
                      placeholder="John Smith"
                      className="pl-9 pr-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-white outline-none focus:border-[#45D153] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                    <input 
                      type="email" 
                      value={finderEmail}
                      onChange={(e) => setFinderEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="pl-9 pr-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-white outline-none focus:border-[#45D153] transition-all"
                    />
                  </div>
                </div>
              </div>

              {action === 'found' && (
                <div>
                  <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                    <input 
                      type="tel" 
                      value={finderPhone}
                      onChange={(e) => setFinderPhone(e.target.value)}
                      placeholder="+44 7700 900000"
                      className="pl-9 pr-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-white outline-none focus:border-[#45D153] transition-all font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-emerald-300 uppercase tracking-wider font-mono mb-1.5">
                  Additional Notes
                </label>
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="e.g. Moved it off the road to avoid traffic."
                  rows={4}
                  className="px-3.5 py-2 w-full bg-[#011a14] border border-[#064e3f] rounded-xl text-sm text-white outline-none focus:border-[#45D153] transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-[56px] rounded-xl bg-[#45D153] text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:bg-[#5ce06a] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer mt-4"
            >
              <Send className="h-4.5 w-4.5 text-white" />
              {action === 'found' && 'Submit Found Report'}
              {action === 'damaged' && 'Submit Damage Report'}
            </button>
          </form>
        )}
      </div>

      {/* Map Selection Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#02241d] border border-[#064e3f] rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-white">
            <button 
              onClick={() => setIsMapModalOpen(false)}
              className="absolute top-4 right-4 text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            <div>
              <h3 className="text-base font-extrabold uppercase text-[#45D153] tracking-wider font-mono flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Select Location on Map
              </h3>
              <p className="text-xs text-emerald-100/60 mt-1 leading-normal">
                Click the map to pin exactly where the bin is. We will auto-fill coordinates and an approximate address.
              </p>
            </div>
            <div id="click-map" className="w-full h-80 rounded-2xl overflow-hidden border border-[#064e3f] bg-black"></div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="flex-1 h-[48px] rounded-xl bg-[#011a14] border border-[#064e3f] text-gray-300 hover:text-white font-bold transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMapLocation}
                disabled={!selectedCoords}
                className={`flex-1 h-[48px] rounded-xl font-black transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedCoords 
                    ? 'bg-[#45D153] text-white hover:bg-[#5ce06a]' 
                    : 'bg-[#064e3f]/40 text-emerald-300/40 border border-[#064e3f] cursor-not-allowed'
                }`}
              >
                <Check className="h-4 w-4" />
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}