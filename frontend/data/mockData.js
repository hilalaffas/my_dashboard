export const monthlyData = [
  { month: 'Jan', value: 5.3 },
  { month: 'Feb', value: 5.9 },
  { month: 'Mar', value: 6.2 },
  { month: 'Apr', value: 6.81 },
  { month: 'May', value: 6.8 },
  { month: 'Jun', value: 6.75 },
]
export const categoryData = [
  { name: 'Lifestyle', amount: 'Rp 2.82 jt', value: 42, color: '#8fbf80' },
  { name: 'Saving', amount: 'Rp 2.95 jt', value: 44, color: '#c8ddbd' },
  { name: 'Transport', amount: 'Rp 375 rb', value: 6, color: '#e6c98d' },
  { name: 'Giving & others', amount: 'Rp 603 rb', value: 8, color: '#df9f83' },
]
export const transactions = [
  {
    detail: 'Basic monthly needs',
    type: 'Income allocation',
    category: 'Income',
    value: 'Rp 5,949,055',
    date: 'Jun 30, 2026',
    positive: true,
  },
  {
    detail: 'Saving',
    type: 'Account transfer',
    category: 'Saving',
    value: 'Rp 2,500,000',
    date: 'Jun 02, 2026',
    positive: false,
  },
  {
    detail: 'Prnts',
    type: 'Monthly commitment',
    category: 'Sadaqah',
    value: 'Rp 1,000,000',
    date: 'Jun 01, 2026',
    positive: false,
  },
  {
    detail: 'E-card',
    type: 'Transport',
    category: 'Transport',
    value: 'Rp 155,000',
    date: 'Jun 07, 2026',
    positive: false,
  },
  {
    detail: 'Body Care',
    type: 'Personal',
    category: 'Lifestyle',
    value: 'Rp 176,000',
    date: 'Jun 12, 2026',
    positive: false,
  },
]
export const defaultEstimateRows = [
  ['Sadaqah', 'Prnts', 1000000, 0],
  ['Internet', 'Wifi', 150000, 0],
  ['Internet', 'Balance', 150000, 0],
  ['Transport', 'gasoline', 200000, 0],
  ['Transport', 'E-card', 310000, 0],
  ['Transport', 'angkot', 240000, 0],
  ['Venchile', 'Service', 120000, 0],
  ['me', 'Personal', 450000, 0],
  ['me', 'Allowance', 270000, 0],
  ['account BSI', 'Saving', 2500000, 0],
  ['account Blue', 'Saving_2', 450000, 0],
  ['account others', 'saavenet', 0, 0],
  ['Others', 'donate+2.5%', 169467, 0],
  ['Others', 'loan', 1360000, 0],
  ['Others', 'Shp', 0, 0],
  ['me', 'Body Care', 118000, 0],
  ['in', 'basic', 0, 5978680],
  ['in', 'basic2', 0, 800000],
].map(([type, detail, debit, credit], i) => ({ id: `seed-${i}`, type, detail, debit, credit }))
export const defaultAccounts = [
  {
    id: 'cat-1',
    name: 'Pengeluaran',
    subs: [
      {
        id: 'sub-1',
        name: 'Transport',
        items: [
          { id: 'i-1', name: 'Bensin', amount: 200000 },
          { id: 'i-2', name: 'E-card', amount: 310000 },
          { id: 'i-3', name: 'Angkot', amount: 240000 },
        ],
      },
      {
        id: 'sub-2',
        name: 'Internet',
        items: [
          { id: 'i-4', name: 'Wifi', amount: 150000 },
          { id: 'i-5', name: 'Pulsa', amount: 150000 },
        ],
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Tabungan',
    subs: [
      {
        id: 'sub-3',
        name: 'Rekening',
        items: [
          { id: 'i-6', name: 'BSI', amount: 2500000 },
          { id: 'i-7', name: 'Blue', amount: 450000 },
        ],
      },
    ],
  },
]
