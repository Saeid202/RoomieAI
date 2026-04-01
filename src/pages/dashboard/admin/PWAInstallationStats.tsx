import { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, Tablet } from 'lucide-react';
import { getTotalPWAInstallations, getPWAInstallationStats } from '@/services/pwaTrackingService';

interface Installation {
  id: string;
  user_id: string;
  installed_at: string;
  device_type: string;
  browser: string;
  platform: string;
}

export default function PWAInstallationStats() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [stats, total] = await Promise.all([
        getPWAInstallationStats(),
        getTotalPWAInstallations(),
      ]);

      if (stats) {
        setInstallations(stats);
      }
      setTotalCount(total);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={18} className="text-blue-600" />;
      case 'tablet':
        return <Tablet size={18} className="text-purple-600" />;
      default:
        return <Monitor size={18} className="text-gray-600" />;
    }
  };

  const platformStats = installations.reduce((acc, inst) => {
    const platform = inst.platform || 'Unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceStats = installations.reduce((acc, inst) => {
    const device = inst.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserStats = installations.reduce((acc, inst) => {
    const browser = inst.browser || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Download size={28} className="text-purple-600" />
        <h1 className="text-3xl font-bold">PWA Installation Stats</h1>
      </div>

      {/* Total Count */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg p-6 text-white">
        <p className="text-sm opacity-90">Total Installations</p>
        <p className="text-4xl font-bold">{totalCount}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Platform Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By Platform</h2>
          <div className="space-y-3">
            {Object.entries(platformStats).map(([platform, count]) => (
              <div key={platform} className="flex justify-between items-center">
                <span className="text-gray-700">{platform}</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By Device</h2>
          <div className="space-y-3">
            {Object.entries(deviceStats).map(([device, count]) => (
              <div key={device} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(device)}
                  <span className="text-gray-700 capitalize">{device}</span>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By Browser</h2>
          <div className="space-y-3">
            {Object.entries(browserStats).map(([browser, count]) => (
              <div key={browser} className="flex justify-between items-center">
                <span className="text-gray-700">{browser}</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Installations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Installations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Device</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Browser</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Platform</th>
              </tr>
            </thead>
            <tbody>
              {installations.slice(0, 10).map((inst) => (
                <tr key={inst.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {new Date(inst.installed_at).toLocaleDateString()} {new Date(inst.installed_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(inst.device_type)}
                      <span className="capitalize">{inst.device_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{inst.browser}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{inst.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
