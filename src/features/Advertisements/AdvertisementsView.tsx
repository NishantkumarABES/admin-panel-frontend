import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import type { GeneralAdvertisement } from "./advertisement.types";
import { mockGeneralAds } from "./advertisement.types";
import { advertisementService } from "../../services/advertisement.service";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddGeneralAdForm from "./components/AddGeneralAdForm";
import EditGeneralAdForm from "./components/EditGeneralAdForm";

export default function AdvertisementsView() {
  const [generalAds, setGeneralAds] = useState<GeneralAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<GeneralAdvertisement | null>(null);

  const getStatusBadge = (status: string) => {
    const styles = {
      enabled: "bg-emerald-100 text-emerald-700 border-emerald-200",
      disabled: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const fetchGeneralAds = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      };

      try {
        const response = await advertisementService.getGeneralAds(filters);
        setGeneralAds(Array.isArray(response.data) ? response.data : [...mockGeneralAds]);
      } catch (error) {
        console.log("Using mock data - API not available");
        let filteredData = [...mockGeneralAds];

        // Apply status filter
        if (statusFilter !== "all") {
          filteredData = filteredData.filter(ad => ad.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            ad =>
              ad.title.toLowerCase().includes(search) ||
              ad.url.toLowerCase().includes(search)
          );
        }

        setGeneralAds(filteredData);
      }
    } catch (error) {
      console.error("Failed to fetch general advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGeneralAds();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    fetchGeneralAds();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedAd(null);
    fetchGeneralAds();
  };

  const handleEdit = (ad: GeneralAdvertisement) => {
    setSelectedAd(ad);
    setIsEditModalOpen(true);
  };

  const handleDelete = (ad: GeneralAdvertisement) => {
    setSelectedAd(ad);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;

    try {
      await advertisementService.deleteGeneralAd(selectedAd.id);
      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
      fetchGeneralAds();
    } catch (error) {
      console.error("Failed to delete advertisement:", error);
      // For demo purposes with mock data
      setGeneralAds(prev => prev.filter(ad => ad.id !== selectedAd.id));
      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
    }
  };

  const stats = {
    total: generalAds.length,
    enabled: generalAds.filter(ad => ad.status === "enabled").length,
    disabled: generalAds.filter(ad => ad.status === "disabled").length,
  };

  return (
    <div className="space-y-6">

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Enabled</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.enabled}</p>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Disabled</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.disabled}</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search advertisements by title or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Advertisement
                </button>
              </div>
            </div>

            {/* Advertisements Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-600">Loading advertisements...</div>
              ) : generalAds.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No advertisements found. Try adjusting your filters or add a new advertisement.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          URL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {generalAds.map((ad) => (
                        <tr
                          key={ad.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {ad.title}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {ad.url}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={ad.image}
                              alt={ad.title}
                              className="h-12 w-20 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/80x48?text=Ad";
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(ad.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(ad)}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                title="Edit Advertisement"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(ad)}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Delete Advertisement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Modals */}
      <AddGeneralAdForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {selectedAd && (
        <>
          <EditGeneralAdForm
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAd(null);
            }}
            advertisement={selectedAd}
            onSuccess={handleEditSuccess}
          />

          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedAd(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Delete Advertisement"
            message={`Are you sure you want to delete "${selectedAd.title}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}
