import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Search,
  Wallet,
  Calculator,
  Home,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  LayoutDashboard,
  List,
  Plus,
  X,
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

// --- INITIALE DATEN (werden beim ersten Start in die DB geladen) ---
const initialData = [
  // KOSTEN PAPA
  {
    item: 'Entsorgung Bauschutt (7m³)',
    payer: 'Papa',
    amount: 407.99,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Entsorgung Bauschutt (7m³)',
    payer: 'Papa',
    amount: 309.0,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Elektrik (1. Zahlung)',
    payer: 'Papa',
    amount: 3500.0,
    category: 'Elektrik',
  },
  {
    item: 'Regenrohr',
    payer: 'Papa',
    amount: 651.95,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Arthur (1. Zahlung)',
    payer: 'Papa',
    amount: 3000.0,
    category: 'Handwerker',
  },
  { item: 'Decken Spots', payer: 'Papa', amount: 372.06, category: 'Elektrik' },
  { item: 'Reuter (Bad)', payer: 'Papa', amount: 847.56, category: 'Sanitär' },
  { item: 'Mega Bad', payer: 'Papa', amount: 403.47, category: 'Sanitär' },
  {
    item: 'Durchlauferhitzer',
    payer: 'Papa',
    amount: 427.15,
    category: 'Sanitär',
  },
  {
    item: 'Banemo Waschtisch',
    payer: 'Papa',
    amount: 756.42,
    category: 'Sanitär',
  },
  {
    item: 'Elektrik (2. Zahlung)',
    payer: 'Papa',
    amount: 2000.0,
    category: 'Elektrik',
  },
  { item: 'Heizung Bad', payer: 'Papa', amount: 380.9, category: 'Heizung' },
  { item: 'Mega Bad', payer: 'Papa', amount: 218.41, category: 'Sanitär' },
  {
    item: 'Spiegel Lomazoo',
    payer: 'Papa',
    amount: 159.0,
    category: 'Möbel & Einrichtung',
  },
  { item: 'Brausehalter', payer: 'Papa', amount: 66.0, category: 'Sanitär' },
  {
    item: 'Duschkabine (Montage)',
    payer: 'Papa',
    amount: 420.07,
    category: 'Sanitär',
  },
  {
    item: 'Duschkabine (Material)',
    payer: 'Papa',
    amount: 1098.13,
    category: 'Sanitär',
  },
  // KOSTEN ROBIN
  {
    item: 'Nachbelastung Bauschutt',
    payer: 'Robin',
    amount: 625.19,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Geberit Spülkasten',
    payer: 'Robin',
    amount: 182.95,
    category: 'Sanitär',
  },
  {
    item: 'Schwert (RE-2960 1. Rech)',
    payer: 'Robin',
    amount: 6716.12,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Entsorgung Bauschutt',
    payer: 'Robin',
    amount: 407.57,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Hansgrohe ibox 2',
    payer: 'Robin',
    amount: 76.23,
    category: 'Sanitär',
  },
  {
    item: 'Grunwald Heizung',
    payer: 'Robin',
    amount: 432.89,
    category: 'Heizung',
  },
  {
    item: 'Statik Mollenhauer',
    payer: 'Robin',
    amount: 1566.04,
    category: 'Planung & Statik',
  },
  {
    item: 'Schwert bar',
    payer: 'Robin',
    amount: 15000.0,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Schwert (2. Rechnung)',
    payer: 'Robin',
    amount: 11719.18,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Schwert (3. Rechnung)',
    payer: 'Robin',
    amount: 2213.4,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Küche (1. Zahlung)',
    payer: 'Robin',
    amount: 9450.0,
    category: 'Küche',
  },
  {
    item: 'Klimaanlage (1. Zahlung)',
    payer: 'Robin',
    amount: 790.0,
    category: 'Haustechnik',
  },
  {
    item: 'Grunwald (20-90597)',
    payer: 'Robin',
    amount: 4374.68,
    category: 'Heizung',
  },
  {
    item: 'Staubsauger',
    payer: 'Robin',
    amount: 149.95,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Farbe Brillux Weiß 30L',
    payer: 'Robin',
    amount: 225.76,
    category: 'Maler',
  },
  {
    item: 'Farbe Brillux Weiß 30L',
    payer: 'Robin',
    amount: 225.76,
    category: 'Maler',
  },
  {
    item: 'Thermostate AliExpress',
    payer: 'Robin',
    amount: 119.22,
    category: 'Haustechnik',
  },
  {
    item: 'Stellantriebe',
    payer: 'Robin',
    amount: 108.9,
    category: 'Haustechnik',
  },
  {
    item: 'Schwert (bar 09.10.25)',
    payer: 'Robin',
    amount: 10000.0,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Küche (2. Zahlung)',
    payer: 'Robin',
    amount: 7680.0,
    category: 'Küche',
  },
  { item: 'Backofen', payer: 'Robin', amount: 1202.0, category: 'Küche' },
  {
    item: 'Schwert bar',
    payer: 'Robin',
    amount: 9000.0,
    category: 'Bau & Sanierung',
  },
  {
    item: 'Dusche Aufmaß',
    payer: 'Robin',
    amount: 123.76,
    category: 'Sanitär',
  },
  {
    item: 'Govee Wandleuchten',
    payer: 'Robin',
    amount: 154.99,
    category: 'Elektrik',
  },
  {
    item: 'Wandleuchten Küche',
    payer: 'Robin',
    amount: 23.59,
    category: 'Elektrik',
  },
  {
    item: 'Flutlichter Garten',
    payer: 'Robin',
    amount: 25.59,
    category: 'Garten',
  },
  {
    item: 'LED Streifen Küche',
    payer: 'Robin',
    amount: 18.69,
    category: 'Elektrik',
  },
  // KOSTEN ANNA + ROBIN
  {
    item: 'Kameras Eufy',
    payer: 'Anna & Robin',
    amount: 365.98,
    category: 'Sicherheit',
  },
  {
    item: 'Sofa Anna (Anzahlung)',
    payer: 'Anna & Robin',
    amount: 650.0,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Sofa Robin (Anzahlung)',
    payer: 'Anna & Robin',
    amount: 650.0,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Sofa Anna (Rest)',
    payer: 'Anna & Robin',
    amount: 650.0,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Sofa Robin (Rest)',
    payer: 'Anna & Robin',
    amount: 650.0,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Kommode 1',
    payer: 'Anna & Robin',
    amount: 260.0,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Kommode 2',
    payer: 'Anna & Robin',
    amount: 260.0,
    category: 'Möbel & Einrichtung',
  },
  {
    item: 'Govee Strahler Garten',
    payer: 'Anna & Robin',
    amount: 89.99,
    category: 'Garten',
  },
  {
    item: 'Luftfilter',
    payer: 'Anna & Robin',
    amount: 32.48,
    category: 'Möbel & Einrichtung',
  },
];

// --- KONFIGURATION (HIER DEINE DATEN EINFÜGEN) ---
const firebaseConfig = {
  apiKey: 'AIzaSyA2iru1p7x0ZTcwa7XReCGuNCZ6PUmmkW8',
  authDomain: 'renovierung-eitelstrasse.firebaseapp.com',
  projectId: 'renovierung-eitelstrasse',
  storageBucket: 'renovierung-eitelstrasse.firebasestorage.app',
  messagingSenderId: '911015098106',
  appId: '1:911015098106:web:c0543b7466ae6f7d973b43',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'renovierung-eitelstrasse';

// Farben
const PIE_COLORS = [
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#4b5563',
];
const CATEGORIES = [
  'Bau & Sanierung',
  'Sanitär',
  'Elektrik',
  'Heizung',
  'Küche',
  'Möbel & Einrichtung',
  'Garten',
  'Haustechnik',
  'Maler',
  'Sicherheit',
  'Handwerker',
  'Planung & Statik',
  'Sonstiges',
];
const PAYERS = ['Papa', 'Robin', 'Anna & Robin'];

export default function RenovationDashboard() {
  const [user, setUser] = useState<any>(null);
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayer, setFilterPayer] = useState('Alle');
  const [filterCategory, setFilterCategory] = useState('Alle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    item: '',
    amount: '',
    payer: 'Robin',
    category: 'Sonstiges',
  });

  useEffect(() => {
    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'artifacts', appId, 'users', user.uid, 'costs')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (
          snapshot.empty &&
          !isSeeding &&
          !snapshot.metadata.hasPendingWrites
        ) {
          setIsSeeding(true);
          const batchPromises = initialData.map((data) =>
            addDoc(
              collection(db, 'artifacts', appId, 'users', user.uid, 'costs'),
              {
                ...data,
                createdAt: new Date(),
              }
            )
          );
          await Promise.all(batchPromises);
          setIsSeeding(false);
          return;
        }

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        items.sort(
          (a: any, b: any) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setCosts(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleAddItem = async (e: any) => {
    e.preventDefault();
    if (!user || !newItem.item || !newItem.amount) return;
    try {
      await addDoc(
        collection(db, 'artifacts', appId, 'users', user.uid, 'costs'),
        {
          item: newItem.item,
          amount: parseFloat(newItem.amount.replace(',', '.')),
          payer: newItem.payer,
          category: newItem.category,
          createdAt: new Date(),
        }
      );
      setShowAddModal(false);
      setNewItem({
        item: '',
        amount: '',
        payer: 'Robin',
        category: 'Sonstiges',
      });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const confirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'costs', itemToDelete)
      );
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const stats = useMemo(() => {
    const total = costs.reduce((sum, item) => sum + item.amount, 0);
    const byPayer = costs.reduce((acc, item) => {
      acc[item.payer] = (acc[item.payer] || 0) + item.amount;
      return acc;
    }, {});

    const byCategory = costs.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const sortedCategories = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);

    const schwertSum = costs
      .filter((i) => i.item.toLowerCase().includes('schwert'))
      .reduce((s, i) => s + i.amount, 0);

    return { total, byPayer, sortedCategories, schwertSum };
  }, [costs]);

  const filteredData = costs.filter((item) => {
    const matchesSearch =
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayer = filterPayer === 'Alle' || item.payer === filterPayer;
    const matchesCategory =
      filterCategory === 'Alle' || item.category === filterCategory;
    return matchesSearch && matchesPayer && matchesCategory;
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(val || 0);

  const bgMain = darkMode
    ? 'bg-slate-950 text-slate-100'
    : 'bg-slate-50 text-slate-900';
  const cardBg = darkMode
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-100';
  const headerBg = darkMode ? 'bg-slate-900' : 'bg-slate-900';
  const inputBg = darkMode
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
    : 'bg-white border-slate-200 text-slate-900';
  const tableHeadBg = darkMode
    ? 'bg-slate-900 text-slate-300'
    : 'bg-slate-50 text-slate-700';
  const tableRowHover = darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bgMain}`}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin" size={32} />
          <p>Lade Finanzdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans pb-24 transition-colors duration-200 ${bgMain}`}
    >
      <header
        className={`${headerBg} text-white p-6 shadow-lg sticky top-0 z-10 transition-colors duration-200`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-row justify-between items-start md:items-center mb-4 md:mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                Renovierung Eitelstraße
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                title={
                  darkMode
                    ? 'Zum hellen Modus wechseln'
                    : 'Zum dunklen Modus wechseln'
                }
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <div className="text-right bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 mt-2 md:mt-0">
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                Gesamt
              </p>
              <p className="text-xl md:text-3xl font-bold text-emerald-400">
                {formatCurrency(stats.total)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Übersicht</span>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <List size={16} />
                <span className="hidden md:inline">Liste</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="hidden md:flex bg-emerald-500 hover:bg-emerald-600 text-white p-2 md:px-4 md:py-2 rounded-lg items-center gap-2 shadow-lg transition-colors"
            >
              <Plus size={20} />
              <span className="font-medium">Neuer Eintrag</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAYERS.map((payer) => (
                <div
                  key={payer}
                  className={`${cardBg} p-5 rounded-xl shadow-sm relative overflow-hidden transition-colors`}
                >
                  <h3
                    className={`${textMuted} text-xs font-bold uppercase tracking-wide mb-1`}
                  >
                    Bezahlt von {payer}
                  </h3>
                  <p className={`text-2xl font-bold ${textPrimary}`}>
                    {formatCurrency(stats.byPayer[payer])}
                  </p>
                  <div
                    className={`mt-2 w-full ${
                      darkMode ? 'bg-slate-800' : 'bg-slate-100'
                    } rounded-full h-1.5`}
                  >
                    <div
                      className={`h-1.5 rounded-full ${
                        payer === 'Papa'
                          ? 'bg-blue-600'
                          : payer === 'Robin'
                          ? 'bg-emerald-600'
                          : 'bg-purple-600'
                      }`}
                      style={{
                        width: `${(stats.byPayer[payer] / stats.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div
                className={`${cardBg} p-6 rounded-xl shadow-sm transition-colors`}
              >
                <h3
                  className={`text-lg font-semibold mb-6 flex items-center ${textPrimary}`}
                >
                  <LayoutDashboard className={`w-5 h-5 mr-2 ${textMuted}`} />
                  Kosten nach Kategorie
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.sortedCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke={darkMode ? '#0f172a' : '#fff'}
                        onClick={(data) => {
                          setFilterCategory(data.name);
                          setActiveTab('list');
                        }}
                      >
                        {stats.sortedCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            cursor="pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                        contentStyle={{
                          backgroundColor: darkMode ? '#1e293b' : '#fff',
                          borderColor: darkMode ? '#334155' : '#e2e8f0',
                          color: darkMode ? '#fff' : '#000',
                        }}
                        itemStyle={{ color: darkMode ? '#cbd5e1' : '#1e293b' }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span
                            style={{ color: darkMode ? '#94a3b8' : '#334155' }}
                          >
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className={`text-xs text-center mt-2 ${textMuted}`}>
                  Klicke auf eine Farbe, um Details zu sehen.
                </p>
              </div>

              {/* Special Analysis */}
              <div className="space-y-6">
                <div
                  className={`${cardBg} p-6 rounded-xl shadow-sm transition-colors`}
                >
                  <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
                    Top Kostentreiber
                  </h3>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-medium ${textPrimary}`}>
                          Firma Schwert (Gesamt)
                        </span>
                        <span className={`text-xs ${textMuted}`}>
                          Bau & Sanierung
                        </span>
                      </div>
                      <span className={`font-bold ${textPrimary}`}>
                        {formatCurrency(stats.schwertSum)}
                      </span>
                    </div>
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-medium ${textPrimary}`}>
                          Größter Einzelposten
                        </span>
                        <span className={`text-xs ${textMuted} truncate w-40`}>
                          {costs.length > 0
                            ? costs.reduce((max, i) =>
                                max.amount > i.amount ? max : i
                              ).item
                            : '-'}
                        </span>
                      </div>
                      <span className={`font-bold ${textPrimary}`}>
                        {costs.length > 0
                          ? formatCurrency(
                              costs.reduce((max, i) =>
                                max.amount > i.amount ? max : i
                              ).amount
                            )
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div
            className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}
          >
            {/* Filter Toolbar */}
            <div
              className={`p-4 border-b ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/50'
                  : 'border-slate-100 bg-slate-50'
              } flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center transition-colors`}
            >
              <div className="relative w-full lg:w-1/3">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`}
                />
                <input
                  type="text"
                  placeholder="Suchen..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base ${inputBg}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                {/* Category Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className={`w-4 h-4 ${textMuted} hidden sm:block`} />
                  <select
                    className={`border rounded-lg py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 ${inputBg}`}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="Alle">Alle Kategorien</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payer Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Wallet className={`w-4 h-4 ${textMuted} hidden sm:block`} />
                  <select
                    className={`border rounded-lg py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-40 ${inputBg}`}
                    value={filterPayer}
                    onChange={(e) => setFilterPayer(e.target.value)}
                  >
                    <option value="Alle">Alle Zahler</option>
                    {PAYERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className={`w-full text-left text-sm ${textMuted}`}>
                <thead
                  className={`${tableHeadBg} font-semibold uppercase text-xs tracking-wider border-b ${
                    darkMode ? 'border-slate-800' : 'border-slate-100'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3 md:px-6 md:py-4">Position</th>
                    <th className="px-4 py-3 md:px-6 md:py-4 hidden sm:table-cell">
                      Kategorie
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4">Zahler</th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-right">
                      Betrag
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode ? 'divide-slate-800' : 'divide-slate-100'
                  }`}
                >
                  {filteredData.map((row) => (
                    <tr
                      key={row.id}
                      className={`${tableRowHover} transition-colors group`}
                    >
                      <td
                        className={`px-4 py-3 md:px-6 md:py-4 font-medium ${textPrimary}`}
                      >
                        {row.item}
                        <div className={`sm:hidden text-xs mt-1 ${textMuted}`}>
                          {row.category}
                        </div>
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            darkMode
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {row.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            row.payer === 'Papa'
                              ? 'text-blue-500'
                              : row.payer === 'Robin'
                              ? 'text-emerald-500'
                              : 'text-purple-500'
                          }`}
                        >
                          {row.payer === 'Papa' ? (
                            <ArrowDownLeft size={14} />
                          ) : (
                            <ArrowUpRight size={14} />
                          )}
                          <span className="hidden sm:inline">{row.payer}</span>
                          <span className="sm:hidden">
                            {row.payer.charAt(0)}
                          </span>
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 md:px-6 md:py-4 text-right font-mono font-medium ${textPrimary}`}
                      >
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                        <button
                          onClick={() => setItemToDelete(row.id)}
                          className={`hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ${textMuted}`}
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        Keine Einträge für diese Filterung gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-xl shadow-emerald-600/30 z-40 transition-transform hover:scale-105 active:scale-95"
        aria-label="Neuer Eintrag"
      >
        <Plus size={24} />
      </button>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div
            className={`${
              darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
            } rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200`}
          >
            <div
              className={`${
                darkMode ? 'bg-slate-800' : 'bg-slate-900'
              } p-4 flex justify-between items-center text-white`}
            >
              <h3 className="font-bold text-lg">Neuen Kostenpunkt erfassen</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${textMuted}`}
                >
                  Beschreibung
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-base ${inputBg}`}
                  placeholder="z.B. Baumarkt Rechnung"
                  value={newItem.item}
                  onChange={(e) =>
                    setNewItem({ ...newItem, item: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${textMuted}`}
                  >
                    Betrag (€)
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-base ${inputBg}`}
                      placeholder="0.00"
                      value={newItem.amount}
                      onChange={(e) =>
                        setNewItem({ ...newItem, amount: e.target.value })
                      }
                    />
                    <span
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`}
                    >
                      €
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${textMuted}`}
                  >
                    Bezahlt von
                  </label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-base ${inputBg}`}
                    value={newItem.payer}
                    onChange={(e) =>
                      setNewItem({ ...newItem, payer: e.target.value })
                    }
                  >
                    {PAYERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${textMuted}`}
                >
                  Kategorie
                </label>
                <select
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-base ${inputBg}`}
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  } font-medium`}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200/20 flex justify-center items-center gap-2"
                >
                  <Save size={18} />
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div
            className={`${
              darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
            } rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200`}
          >
            <div className="p-6 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  darkMode
                    ? 'bg-red-900/30 text-red-500'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>
                Eintrag löschen?
              </h3>
              <p className={`text-sm mb-6 ${textMuted}`}>
                Bist du sicher, dass du diesen Eintrag entfernen möchtest? Dies
                kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  } font-medium`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold shadow-md shadow-red-200/20"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
