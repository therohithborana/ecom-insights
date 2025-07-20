// In-memory mock database to avoid native dependency issues.

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

// Mock data representing the database tables.
const mockData = {
  ad_sales: [
    { product_id: 'P001', date: '2024-07-13', ad_spend: 100, ad_sales: 1500, clicks: 300, impressions: 10000 },
    { product_id: 'P002', date: '2024-07-13', ad_spend: 150, ad_sales: 2500, clicks: 450, impressions: 15000 },
    { product_id: 'P001', date: '2024-07-14', ad_spend: 120, ad_sales: 1800, clicks: 350, impressions: 12000 },
    { product_id: 'P003', date: '2024-07-14', ad_spend: 80, ad_sales: 1200, clicks: 250, impressions: 8000 },
    { product_id: 'P002', date: '2024-07-15', ad_spend: 200, ad_sales: 3000, clicks: 500, impressions: 20000 },
    { product_id: 'P001', date: '2024-07-16', ad_spend: 110, ad_sales: 1650, clicks: 320, impressions: 11000 },
    { product_id: 'P003', date: '2024-07-17', ad_spend: 90, ad_sales: 1350, clicks: 280, impressions: 9000 },
    { product_id: 'P002', date: '2024-07-18', ad_spend: 220, ad_sales: 3300, clicks: 550, impressions: 22000 },
    { product_id: 'P001', date: '2024-07-19', ad_spend: 130, ad_sales: 1950, clicks: 380, impressions: 13000 },
    { product_id: 'P003', date: '2024-07-20', ad_spend: 100, ad_sales: 1500, clicks: 300, impressions: 10000 },
  ],
  total_sales: [
    { product_id: 'P001', date: '2024-07-13', total_sales_units: 50, total_sales_revenue: 5000 },
    { product_id: 'P002', date: '2024-07-13', total_sales_units: 70, total_sales_revenue: 8400 },
    { product_id: 'P001', date: '2024-07-14', total_sales_units: 60, total_sales_revenue: 6000 },
    { product_id: 'P003', date: '2024-07-14', total_sales_units: 40, total_sales_revenue: 4800 },
    { product_id: 'P002', date: '2024-07-15', total_sales_units: 80, total_sales_revenue: 9600 },
    { product_id: 'P001', date: '2024-07-16', total_sales_units: 55, total_sales_revenue: 5500 },
    { product_id: 'P003', date: '2024-07-17', total_sales_units: 45, total_sales_revenue: 5400 },
    { product_id: 'P002', date: '2024-07-18', total_sales_units: 85, total_sales_revenue: 10200 },
    { product_id: 'P001', date: '2024-07-19', total_sales_units: 65, total_sales_revenue: 6500 },
    { product_id: 'P003', date: '2024-07-20', total_sales_units: 50, total_sales_revenue: 6000 },
  ],
  eligibility: [
      { product_id: 'P001', product_name: 'SuperWidget', is_eligible: true },
      { product_id: 'P002', product_name: 'MegaGadget', is_eligible: true },
      { product_id: 'P003', product_name: 'HyperGrommet', is_eligible: false },
  ]
};

// A very simple mock query engine. This is not a real SQL parser.
// It only handles specific queries required by the application's preset questions.
async function executeMockQuery(sql: string): Promise<QueryResult> {
    const lowerSql = sql.toLowerCase();

    if (lowerSql.includes('sum(total_sales_revenue)')) {
        // Corresponds to "What are my sales in the last 7 days?"
        const totalRevenue = mockData.total_sales
            .filter(s => new Date(s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .reduce((acc, s) => acc + s.total_sales_revenue, 0);
        return {
            columns: ['total_revenue'],
            rows: [{ total_revenue: totalRevenue }]
        };
    }

    if (lowerSql.includes('sum(ad_sales)') && lowerSql.includes('sum(ad_spend)')) {
        // Corresponds to "Calculate the RoAS (Return on Ad Spend)."
        const totalAdSales = mockData.ad_sales.reduce((acc, s) => acc + s.ad_sales, 0);
        const totalAdSpend = mockData.ad_sales.reduce((acc, s) => acc + s.ad_spend, 0);
        const roas = totalAdSpend > 0 ? totalAdSales / totalAdSpend : 0;
        return {
            columns: ['roas'],
            rows: [{ roas: roas }]
        };
    }
    
    if (lowerSql.includes('ad_spend / clicks')) {
        // Corresponds to "Which product had the highest CPC (Cost Per Click)?"
        const cpcData = mockData.ad_sales.map(s => ({
            product_id: s.product_id,
            cpc: s.clicks > 0 ? s.ad_spend / s.clicks : 0
        }));
        const highestCpc = cpcData.reduce((max, cur) => cur.cpc > max.cpc ? cur : max, cpcData[0]);
        const product = mockData.eligibility.find(p => p.product_id === highestCpc.product_id);
        return {
            columns: ['product_name', 'cpc'],
            rows: [{ product_name: product?.product_name || 'Unknown', cpc: highestCpc.cpc }]
        };
    }
    
    // Fallback for other queries: return some data from the first table found.
    const fromMatch = lowerSql.match(/from\s+(\w+)/);
    if (fromMatch) {
      const tableName = fromMatch[1] as keyof typeof mockData;
      if (mockData[tableName]) {
        const rows = mockData[tableName].slice(0, 5); // return first 5 rows
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return { columns, rows };
      }
    }


    // Default empty response if no mock logic matches
    return { columns: [], rows: [] };
}


export async function query(sql: string): Promise<QueryResult> {
    console.log(`Executing MOCK query: ${sql}`);
    try {
        // Basic validation
        if (sql.split(';').length > 2 && !sql.trim().endsWith(';')) {
            throw new Error("Only single SQL statements are allowed.");
        }
        
        const result = await executeMockQuery(sql);
        return result;

    } catch (error) {
        console.error(`Error executing mock query: ${sql}`, error);
        const message = error instanceof Error ? error.message : "An unknown database error occurred";
        throw new Error(`Mock database query failed: ${message}`);
    }
}
