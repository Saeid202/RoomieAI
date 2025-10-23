import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Database, User, Upload } from 'lucide-react';

export const DatabaseTestComponent = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [user, setUser] = useState<any>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);

      // Test 1: Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      
      setUser(session?.user || null);
      console.log('Auth Status:', session?.user ? 'Authenticated' : 'Not authenticated');

      // Test 2: Check if properties table exists
      const { data: tables, error: tableError } = await supabase
        .from('properties')
        .select('count(*)')
        .limit(1);

      if (tableError && tableError.code === '42P01') {
        setTableExists(false);
        setError('Properties table does not exist');
      } else if (tableError) {
        throw tableError;
      } else {
        setTableExists(true);
      }

      // Test 3: Try to fetch properties
      const { data: properties, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .limit(5);

      if (fetchError) throw fetchError;

      setTestResult({
        propertiesCount: properties?.length || 0,
        properties: properties || []
      });

      setConnectionStatus('connected');
    } catch (err: any) {
      console.error('Database test error:', err);
      setError(err.message || 'Unknown error');
      setConnectionStatus('error');
    }
  };

  const testPropertyInsert = async () => {
    try {
      setError(null);
      
      if (!user) {
        setError('Please authenticate first');
        return;
      }

      const testProperty = {
        user_id: user.id, // Add the required user_id
        listing_title: 'Test Property from App',
        property_type: 'Apartment',
        description: 'This is a test property created from the app',
        address: '123 Test Street',
        city: 'Toronto',
        state: 'Ontario',
        zip_code: 'M5V 3A8',
        monthly_rent: 2000,
        security_deposit: 2000,
        lease_terms: '1 year',
        available_date: '2024-12-01',
        furnished: false,
        bedrooms: 2,
        bathrooms: 1.5,
        amenities: ['WiFi', 'Laundry', 'Parking'],
        parking: 'Underground',
        pet_policy: 'No Pets',
        utilities_included: ['Water', 'Heat']
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(testProperty)
        .select()
        .single();

      if (error) throw error;

      setTestResult(prev => ({
        ...prev,
        insertedProperty: data
      }));

      alert('Test property inserted successfully!');
      await testDatabaseConnection(); // Refresh data
    } catch (err: any) {
      console.error('Insert test error:', err);
      setError(`Insert failed: ${err.message}`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Test your Supabase connection and property table setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {connectionStatus === 'testing' && <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />}
            {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="font-medium">
              Connection: {connectionStatus === 'testing' ? 'Testing...' : connectionStatus === 'connected' ? 'Connected' : 'Error'}
            </span>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Authentication: {user ? `Authenticated (${user.email})` : 'Not authenticated'}</span>
          {user && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>

        {/* Table Status */}
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Properties Table: {tableExists === null ? 'Checking...' : tableExists ? 'Exists' : 'Missing'}</span>
          {tableExists === true && <CheckCircle className="h-4 w-4 text-green-500" />}
          {tableExists === false && <XCircle className="h-4 w-4 text-red-500" />}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Test Results:</h4>
            <p className="text-sm text-green-700">Properties found: {testResult.propertiesCount}</p>
            {testResult.insertedProperty && (
              <p className="text-sm text-green-700 mt-1">✅ Test property inserted successfully</p>
            )}
            <details className="mt-2">
              <summary className="text-sm cursor-pointer text-green-600">View Raw Data</summary>
              <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testDatabaseConnection} variant="outline">
            Retest Connection
          </Button>
          {user && tableExists && (
            <Button onClick={testPropertyInsert} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Test Property Insert
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>If table is missing, run the SQL script in your Supabase SQL Editor</li>
            <li>If not authenticated, sign in to the app first</li>
            <li>If connection fails, check your environment variables</li>
            <li>Test property insert to verify everything works</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};