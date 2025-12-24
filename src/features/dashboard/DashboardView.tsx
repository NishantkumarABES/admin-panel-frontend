import { Users, Stethoscope, Package, Calendar, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of platform activity and key metrics
        </p>
      </div> */}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">248</div>
          <div className="text-sm text-gray-600">Total Doctors</div>
          <div className="text-xs text-emerald-600 mt-2">+12% from last month</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1,854</div>
          <div className="text-sm text-gray-600">Total Patients</div>
          <div className="text-xs text-emerald-600 mt-2">+24% from last month</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">89</div>
          <div className="text-sm text-gray-600">Products</div>
          <div className="text-xs text-emerald-600 mt-2">+5% from last month</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">34</div>
          <div className="text-sm text-gray-600">Upcoming Events</div>
          <div className="text-xs text-emerald-600 mt-2">+8% from last month</div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div>
              <div className="text-sm font-medium text-gray-900">
                12 Doctors Pending Verification
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Review and verify new doctor registrations
              </div>
            </div>
            <a
              href="/doctors"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Review
            </a>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <div className="text-sm font-medium text-gray-900">
                5 Products Awaiting Approval
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Review product submissions for marketplace
              </div>
            </div>
            <a
              href="/products"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Review
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Dr. Sarah Johnson verified
              </div>
              <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                New product "Medical Supplies Kit" added
              </div>
              <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Event "Healthcare Conference 2025" created
              </div>
              <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Dr. Michael Chen registration pending review
              </div>
              <div className="text-xs text-gray-500 mt-1">8 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}