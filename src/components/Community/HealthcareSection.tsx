import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Building2,
  Users,
  ChevronRight,
  Filter,
  Eye,
  Video,
  X,
  Bell,
  MessageSquare,
  Mail,
  BellOff
} from 'lucide-react';
import type { HealthcareFacility, HealthcareEvent, RSVPContact, RSVPReminderMethod } from '../../types';
import { 
  WESTERN_CAPE_PILOT_CLINICS, 
  UPCOMING_HEALTH_EVENTS 
} from '../../data/communityData';
import { useTheme } from '../../theme/ThemeContext';
import { BottomSheet, SheetPrimaryButton, SheetSecondaryButton } from '../BottomSheet';

const RSVP_CONTACTS_KEY = 'khona_clinic_event_rsvp_contacts_v1';

export const HealthcareSection: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<HealthcareEvent | null>(null);

  // The event RSVP'ing for right now — opens the "who are you / how do
  // you want to be reminded" sheet before the RSVP is actually recorded.
  const [rsvpTarget, setRsvpTarget] = useState<HealthcareEvent | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpMethod, setRsvpMethod] = useState<RSVPReminderMethod>('none');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpFormError, setRsvpFormError] = useState<string | null>(null);

  // Events state with LocalStorage persistence for RSVPs
  const [events, setEvents] = useState<HealthcareEvent[]>(() => {
    try {
      const saved = localStorage.getItem('khona_clinic_events_rsvp_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return UPCOMING_HEALTH_EVENTS;
  });

  const persistEvents = (next: HealthcareEvent[]) => {
    try {
      localStorage.setItem('khona_clinic_events_rsvp_v3', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const saveRsvpContact = (eventId: string, contact: RSVPContact) => {
    try {
      const raw = localStorage.getItem(RSVP_CONTACTS_KEY);
      const all: Record<string, RSVPContact> = raw ? JSON.parse(raw) : {};
      all[eventId] = contact;
      localStorage.setItem(RSVP_CONTACTS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  };

  const clearRsvpContact = (eventId: string) => {
    try {
      const raw = localStorage.getItem(RSVP_CONTACTS_KEY);
      if (!raw) return;
      const all: Record<string, RSVPContact> = JSON.parse(raw);
      delete all[eventId];
      localStorage.setItem(RSVP_CONTACTS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  };

  const applyRsvp = (eventId: string, register: boolean) => {
    setEvents((prev) => {
      const next = prev.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            isRegistered: register,
            rsvpCount: register ? evt.rsvpCount + 1 : Math.max(0, evt.rsvpCount - 1),
          };
        }
        return evt;
      });
      persistEvents(next);
      return next;
    });
    setSelectedEvent((prev) => prev && prev.id === eventId ? {
      ...prev,
      isRegistered: register,
      rsvpCount: register ? prev.rsvpCount + 1 : Math.max(0, prev.rsvpCount - 1),
    } : prev);
  };

  // Tapping RSVP on an event that isn't registered yet opens the contact
  // sheet first — RSVPing to attend doesn't tell us who's attending
  // otherwise, and there's no way to send a reminder without asking.
  const handleRsvpTap = (event: HealthcareEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (event.isRegistered) {
      applyRsvp(event.id, false);
      clearRsvpContact(event.id);
      return;
    }
    setRsvpName('');
    setRsvpMethod('none');
    setRsvpPhone('');
    setRsvpEmail('');
    setRsvpFormError(null);
    setRsvpTarget(event);
  };

  const handleConfirmRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpTarget) return;

    if (rsvpMethod === 'sms' && !rsvpPhone.trim()) {
      setRsvpFormError('Add a phone number so we know where to send the reminder.');
      return;
    }
    if (rsvpMethod === 'email' && !rsvpEmail.trim()) {
      setRsvpFormError('Add an email address so we know where to send the reminder.');
      return;
    }

    const contact: RSVPContact = {
      name: rsvpName.trim() || undefined,
      reminderMethod: rsvpMethod,
      phone: rsvpMethod === 'sms' ? rsvpPhone.trim() : undefined,
      email: rsvpMethod === 'email' ? rsvpEmail.trim() : undefined,
    };

    saveRsvpContact(rsvpTarget.id, contact);
    applyRsvp(rsvpTarget.id, true);
    setRsvpTarget(null);
  };

  const filteredEvents = selectedClinicId === 'all'
    ? events
    : events.filter((evt) => evt.facilityId === selectedClinicId);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Clinic Health
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            What's happening at participating healthcare centres
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClinicId}
            onChange={(e) => setSelectedClinicId(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors w-full sm:w-auto ${
              isDark 
                ? 'bg-[#101722] border-zinc-800 text-zinc-200 focus:border-cyan-500' 
                : 'bg-white border-zinc-200 text-zinc-800 focus:border-cyan-500 shadow-2xs'
            }`}
          >
            <option value="all">All Healthcare Centres</option>
            {WESTERN_CAPE_PILOT_CLINICS.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Event Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              isDark 
                ? 'bg-[#101722] hover:bg-[#141d2b] border-zinc-800 hover:border-zinc-700' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-2xs'
            }`}
          >
            {/* Image Container */}
            <div className="relative aspect-16/9 w-full bg-zinc-900 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Origin Facility Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/15">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{event.facilityName}</span>
              </div>

              {/* Date & Time Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-cyan-300 drop-shadow">
                  <Clock className="w-3.5 h-3.5" />
                  {event.date}
                </span>
                <span className="text-[11px] text-zinc-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                  {event.rsvpCount} Attending
                </span>
              </div>
            </div>

            {/* Event Metadata & Actions */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold group-hover:text-cyan-400 transition-colors">
                  {event.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {event.description}
                </p>
              </div>

              {/* Accessibility Tag & Quick RSVP */}
              <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between gap-2">
                <span className={`text-[11px] font-medium px-2 py-1 rounded-md ${
                  isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {event.saslSupport}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleRsvpTap(event, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    event.isRegistered
                      ? 'bg-cyan-500 text-black'
                      : isDark
                      ? 'bg-zinc-900 text-cyan-400 hover:bg-zinc-800 border border-zinc-800'
                      : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200'
                  }`}
                >
                  {event.isRegistered ? 'Attending ✓' : 'RSVP'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Bottom Sheet / Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-2xl overflow-hidden border ${
            isDark ? 'bg-[#0e141f] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="relative aspect-16/9 w-full bg-zinc-900">
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{selectedEvent.facilityName}</span>
                  <span>•</span>
                  <span>{selectedEvent.city}</span>
                </div>
                <h3 className="text-xl font-bold">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-zinc-800/60">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{selectedEvent.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Event Overview
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}>
                <span className="font-bold text-cyan-400 block">Accessibility & SASL Services:</span>
                <p>{selectedEvent.accessibilityInfo}</p>
                <p className="font-semibold text-zinc-400">{selectedEvent.saslSupport}</p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-500">
                  {selectedEvent.rsvpCount} signers attending
                </span>

                <button
                  type="button"
                  onClick={() => handleRsvpTap(selectedEvent)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  {selectedEvent.isRegistered ? 'Attending ✓' : 'RSVP to Attend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RSVP contact sheet — the Community section otherwise never
          knows who's using it. This is the one moment we actually ask,
          and only what's needed to send a reminder if they want one. */}
      {rsvpTarget && (
        <BottomSheet
          isOpen={Boolean(rsvpTarget)}
          onClose={() => setRsvpTarget(null)}
          title="Confirm your RSVP"
          subtitle={rsvpTarget.title}
          icon={<Bell className="w-5 h-5" />}
          footer={
            <>
              <SheetPrimaryButton form="rsvp-contact-form" type="submit">
                Confirm RSVP
              </SheetPrimaryButton>
              <SheetSecondaryButton onClick={() => setRsvpTarget(null)}>
                Cancel
              </SheetSecondaryButton>
            </>
          }
        >
          <form id="rsvp-contact-form" onSubmit={handleConfirmRsvp} className="space-y-4 pb-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                Your name (optional)
              </label>
              <input
                type="text"
                placeholder="You can leave this blank to stay anonymous"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                className={`w-full px-3.5 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-cyan-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-cyan-500'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                How should we remind you?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'sms' as const, label: 'SMS', icon: MessageSquare },
                  { id: 'email' as const, label: 'Email', icon: Mail },
                  { id: 'none' as const, label: "Don't remind me", icon: BellOff },
                ]).map((opt) => {
                  const Icon = opt.icon;
                  const active = rsvpMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setRsvpMethod(opt.id);
                        setRsvpFormError(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-colors cursor-pointer ${
                        active
                          ? isDark
                            ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                            : 'bg-cyan-50 border-cyan-600 text-cyan-950'
                          : isDark
                          ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {rsvpMethod === 'sms' && (
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  autoFocus
                  placeholder="e.g. 072 458 9120"
                  value={rsvpPhone}
                  onChange={(e) => {
                    setRsvpPhone(e.target.value);
                    if (rsvpFormError) setRsvpFormError(null);
                  }}
                  className={`w-full px-3.5 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-cyan-500'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-cyan-500'
                  }`}
                />
              </div>
            )}

            {rsvpMethod === 'email' && (
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  autoFocus
                  placeholder="e.g. name@example.com"
                  value={rsvpEmail}
                  onChange={(e) => {
                    setRsvpEmail(e.target.value);
                    if (rsvpFormError) setRsvpFormError(null);
                  }}
                  className={`w-full px-3.5 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-cyan-500'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-cyan-500'
                  }`}
                />
              </div>
            )}

            {rsvpFormError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {rsvpFormError}
              </div>
            )}

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              We'll only use this to remind you about this event — it isn't linked to any patient file, and you can RSVP without giving either.
            </p>
          </form>
        </BottomSheet>
      )}
    </div>
  );
};
