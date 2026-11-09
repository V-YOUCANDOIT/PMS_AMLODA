import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { AMLODA_IMAGES, AMLODA_VILLAGE_INFO } from '../../assets/amlodaAssets.ts';
import {
  MapPin,
  Building2,
  Users,
  Compass,
  CheckCircle,
  Flag,
  Layers,
  BarChart3,
  Globe,
  Droplet,
  Sun,
  Home,
  Navigation
} from 'lucide-react';

interface SectorGeo {
  id: string;
  name: string;
  coordinates: [number, number];
  unitsCount: number;
  volunteersCount: number;
  activeCampaigns: number;
  districts: {
    name: string;
    center: [number, number];
    units: number;
    volunteers: number;
  }[];
}

interface GeoData {
  villageName: string;
  gramPanchayat: string;
  totalHouseholds: number;
  totalPopulation: number;
  totalWards: number;
  states: SectorGeo[];
  totalUnits: number;
  totalDistricts: number;
  coverageScore: string;
}

export const GeographyView: React.FC = () => {
  const { showToast } = useToast();
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorGeo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGeo() {
      try {
        setLoading(true);
        const data = await apiRequest<GeoData>('/api/geography');
        setGeoData(data);
        if (data.states && data.states.length > 0) {
          setSelectedSector(data.states[1]); // Default to Central (Panchayat Bhavan & Chaupal)
        }
      } catch (e: any) {
        showToast(e.message || 'Failed to load geographical data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadGeo();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded font-mono">
              VILLAGE MAP
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Amloda Village (अमलोदा) 12-Ward Territorial Jurisdiction
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gram Panchayat layout: North (School & Health), Central (Chaupal, Market & RO Plant), South (Canal & Farmlands).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold font-mono">
            Village Tap Water Coverage: 96.8%
          </span>
        </div>
      </div>

      {/* Main Grid: Left Interactive SVG Ward Map, Right Sector Details & Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Vector Ward Map */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Amloda Village Ward Map (Offline Vector Projection)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Click any ward sector to inspect</span>
          </div>

          {/* Interactive SVG Geographic Ward Canvas */}
          <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 relative overflow-hidden">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-auto max-h-[380px] select-none"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="village_grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800/60" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#village_grid)" />

              {/* Canal Stream Line Running Across South */}
              <path
                d="M 20 340 Q 250 310, 420 330 T 580 320"
                fill="none"
                stroke="#0284c7"
                strokeWidth="12"
                strokeLinecap="round"
                className="opacity-40"
              />
              <path
                d="M 20 340 Q 250 310, 420 330 T 580 320"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <text x="320" y="345" className="fill-sky-700 dark:fill-sky-400 text-[10px] font-bold font-mono">
                ≈ Amloda Irrigation Canal (नहर) ≈
              </text>

              {/* Village Main Road Cross */}
              <path
                d="M 290 30 L 305 380"
                fill="none"
                stroke="#cbd5e1"
                className="dark:stroke-slate-700"
                strokeWidth="8"
              />
              <path
                d="M 40 185 L 560 195"
                fill="none"
                stroke="#cbd5e1"
                className="dark:stroke-slate-700"
                strokeWidth="8"
              />

              {/* Sector 1: North (Wards 1–4) */}
              <g
                onClick={() => geoData?.states[0] && setSelectedSector(geoData.states[0])}
                className="cursor-pointer group"
              >
                <path
                  d="M 60 50 L 540 45 L 520 170 L 70 170 Z"
                  className={`transition-colors ${
                    selectedSector?.id === 'sector-north'
                      ? 'fill-blue-500/20 stroke-blue-600 stroke-2'
                      : 'fill-slate-100/80 dark:fill-slate-800/40 stroke-slate-300 dark:stroke-slate-700 hover:fill-blue-500/10 hover:stroke-blue-400'
                  }`}
                />
                <circle cx="160" cy="95" r="7" className="fill-blue-500" />
                <text x="160" y="80" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[11px] font-bold">
                  Govt Senior Secondary School
                </text>
                <text x="160" y="115" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono">
                  Ward 1–2 (Digital Lab & Sports Ground)
                </text>

                <circle cx="420" cy="105" r="7" className="fill-indigo-500" />
                <text x="420" y="90" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[11px] font-bold">
                  Health Sub-Center (स्वास्थ्य केंद्र)
                </text>
                <text x="420" y="125" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono">
                  Ward 3–4 (Clinic & Mother Child Care)
                </text>
              </g>

              {/* Sector 2: Central (Wards 5–8) */}
              <g
                onClick={() => geoData?.states[1] && setSelectedSector(geoData.states[1])}
                className="cursor-pointer group"
              >
                <path
                  d="M 70 190 L 520 190 L 510 300 L 70 300 Z"
                  className={`transition-colors ${
                    selectedSector?.id === 'sector-central'
                      ? 'fill-emerald-500/20 stroke-emerald-600 stroke-2'
                      : 'fill-slate-100/80 dark:fill-slate-800/40 stroke-slate-300 dark:stroke-slate-700 hover:fill-emerald-500/10 hover:stroke-emerald-400'
                  }`}
                />
                <circle cx="210" cy="245" r="8" className="fill-amber-500" />
                <text x="210" y="230" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[12px] font-bold">
                  Panchayat Bhavan & Chaupal
                </text>
                <text x="210" y="265" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono">
                  Ward 5–6 (Gram Sabha Square & Banyan Tree)
                </text>

                <circle cx="430" cy="245" r="8" className="fill-cyan-500" />
                <text x="430" y="230" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[12px] font-bold">
                  5000L RO Clean Water Facility
                </text>
                <text x="430" y="265" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono">
                  Ward 7–8 (Community Water Plant)
                </text>
              </g>

              {/* Sector 3: South (Wards 9–12) */}
              <g
                onClick={() => geoData?.states[2] && setSelectedSector(geoData.states[2])}
                className="cursor-pointer group"
              >
                <path
                  d="M 70 315 L 510 315 L 500 385 L 60 385 Z"
                  className={`transition-colors ${
                    selectedSector?.id === 'sector-south'
                      ? 'fill-amber-500/20 stroke-amber-600 stroke-2'
                      : 'fill-slate-100/80 dark:fill-slate-800/40 stroke-slate-300 dark:stroke-slate-700 hover:fill-amber-500/10 hover:stroke-amber-400'
                  }`}
                />
                <circle cx="170" cy="360" r="6" className="fill-sky-500" />
                <text x="170" y="352" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">
                  Canal Reservoir Sluice Gate
                </text>

                <circle cx="410" cy="360" r="6" className="fill-emerald-600" />
                <text x="410" y="352" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">
                  Kisan Mandi & Dhani Farmlands
                </text>
              </g>
            </svg>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> North (School & Health)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Central (Panchayat & RO Plant)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> South (Canal & Farms)
              </span>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-28 group">
              <img
                src={AMLODA_IMAGES.panchayatBhavan}
                alt="Panchayat Bhavan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 text-white">
                <span className="text-[11px] font-semibold">Panchayat Bhavan Courtyard (Ward 6)</span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-28 group">
              <img
                src={AMLODA_IMAGES.waterCanal}
                alt="Amloda Canal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 text-white">
                <span className="text-[11px] font-semibold">Canal Irrigation Reservoir (Ward 10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sector Details & Ward Directory */}
        <div className="lg:col-span-5 space-y-4">
          {selectedSector ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                    Sector Focus
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedSector.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-mono">Ward Status</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">Active</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Units</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">{selectedSector.unitsCount}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Gram Sevaks</span>
                  <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">{selectedSector.volunteersCount}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Live Projects</span>
                  <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{selectedSector.activeCampaigns}</p>
                </div>
              </div>

              {/* Wards within this Sector */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Constituent Wards & Centers</span>
                </h4>

                <div className="space-y-2">
                  {selectedSector.districts?.map((d) => (
                    <div key={d.name} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{d.name}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {d.units} Ward Committee Command
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md font-mono">
                        {d.volunteers} Volunteers
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Survey Priorities for this Ward Sector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ward Citizen Priorities</span>
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Clean RO Drinking Water Supply:</span>
                    <strong className="text-blue-600 dark:text-blue-400">High Demand (94%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Solar Street Lighting Coverage:</span>
                    <strong className="text-amber-600 dark:text-amber-400">Ongoing (82%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Concrete Road & Covered Drainage:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Approved (78%)</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              Select a ward sector on the map to review details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
