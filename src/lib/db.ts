export interface QueryResult {
    columns: string[];
    rows: Record<string, any>[];
}

export async function query(sql: string): Promise<QueryResult> {
    console.log("Executing mock query:", sql);
    // Add a delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const lowerSql = sql.toLowerCase();

    // A simple router for mock data based on keywords in the SQL
    if (lowerSql.includes("sales") && (lowerSql.includes("7 day") || lowerSql.includes("last 7"))) {
        return {
            columns: ["total_sales"],
            rows: [{ "total_sales": 15432.78 }],
        };
    }
    if (lowerSql.includes("roas")) {
        return {
            columns: ["RoAS"],
            rows: [{ "RoAS": 4.5 }],
        };
    }
    if (lowerSql.includes("cpc")) {
        return {
            columns: ["product_name", "CPC"],
            rows: [{ "product_name": "Pro Widget", "CPC": 1.25 }],
        };
    }
    if (lowerSql.includes("eligibility")) {
        return {
            columns: ["product_name", "is_eligible"],
            rows: [
                { "product_name": "Pro Widget", "is_eligible": 1 },
                { "product_name": "Super Widget", "is_eligible": 1 },
                { "product_name": "Basic Widget", "is_eligible": 0 },
            ],
        };
    }

    // Default mock response
    return {
        columns: ["product_name", "total_sales_revenue"],
        rows: [
            { "product_name": "Pro Widget", "total_sales_revenue": 5200.50 },
            { "product_name": "Super Widget", "total_sales_revenue": 8345.20 },
            { "product_name": "Basic Widget", "total_sales_revenue": 1250.00 },
        ],
    };
}
