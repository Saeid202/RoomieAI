
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function MarketAnalysisPage() {
  // Sample data for demonstration
  const priceData = [
    { neighborhood: 'Downtown', avgPrice: 550000 },
    { neighborhood: 'Midtown', avgPrice: 425000 },
    { neighborhood: 'Westside', avgPrice: 620000 },
    { neighborhood: 'Eastside', avgPrice: 380000 },
    { neighborhood: 'Northside', avgPrice: 490000 },
    { neighborhood: 'Southside', avgPrice: 350000 },
  ];

  const propertyTypeData = [
    { name: 'Single Family', value: 45 },
    { name: 'Townhouse', value: 25 },
    { name: 'Condo', value: 20 },
    { name: 'Multi-Family', value: 10 },
  ];

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Market Analysis</h1>
        <p className="text-muted-foreground mt-1">Data and insights on the local real estate market</p>
      </div>

      <Tabs defaultValue="price">
        <TabsList className="mb-4">
          <TabsTrigger value="price">Price Analysis</TabsTrigger>
          <TabsTrigger value="property">Property Types</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="price">
          <Card>
            <CardHeader>
              <CardTitle>Average Home Prices by Neighborhood</CardTitle>
              <CardDescription>Data from the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priceData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="neighborhood" angle={-45} textAnchor="end" />
                    <YAxis 
                      tickFormatter={(value) => `$${value / 1000}k`} 
                      label={{ value: 'Price', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="avgPrice" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="property">
          <Card>
            <CardHeader>
              <CardTitle>Property Type Distribution</CardTitle>
              <CardDescription>Current market share by property type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends Analysis</CardTitle>
              <CardDescription>Key insights and forecasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Emerging Neighborhoods</h3>
                <p>The Westside and Midtown areas are showing the strongest growth in property values, with a 12% and 8% increase respectively over the past year.</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Buyer Demographics</h3>
                <p>Millennials now represent 38% of buyers, with a strong preference for walkable neighborhoods and smart home features.</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Sustainability Trends</h3>
                <p>Energy-efficient homes are selling 24% faster than comparable properties without green features, commanding a 6% premium in sale price.</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Market Forecast</h3>
                <p>Analysts predict a steady 5-7% growth in property values over the next 12 months, with particular strength in the townhouse and single-family segments.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
