import { useState } from "react";
import type { Order, OrderStatus } from "../order.types";
import { ORDER_STATUS_CONFIG } from "../order.types";
import Modal from "../../../components/common/Modal";

interface UpdateStatusModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
}

export default function UpdateStatusModal({ order, isOpen, onClose, onSubmit }: UpdateStatusModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order?.status || "pending_payment");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(order.id, status, note);
      onClose();
      setNote("");
    } catch (err: any) {
      setError(err?.message || "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: OrderStatus[] = [
    "pending_payment",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];

  const insetInputStyle = {
    background: "#eff1f5",
    border: "none",
    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
  };

  const insetPanelStyle = {
    background: "#f8f9fb",
    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Order Status" size="sm">
      <p className="text-xs text-gray-500 -mt-2 mb-4">Order ID: {order.id}</p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Current Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Status</label>
            <div className="rounded-xl p-3" style={insetPanelStyle}>
              <span
                className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full border
                  ${ORDER_STATUS_CONFIG[order.status].color}
                  ${ORDER_STATUS_CONFIG[order.status].bgColor}
                  ${ORDER_STATUS_CONFIG[order.status].borderColor}`}
              >
                {ORDER_STATUS_CONFIG[order.status].label}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1.5">
              New Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              style={insetInputStyle}
              required
            >
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {ORDER_STATUS_CONFIG[statusOption].label}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-xs font-medium text-gray-700 mb-1.5">
              Note <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this status change..."
              className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              style={insetInputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-xl text-sm text-red-600"
              style={{ background: "rgba(255, 112, 112, 0.08)", border: "1px solid rgba(255, 112, 112, 0.2)" }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 pt-5 mt-5"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="clay-btn disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "13px", padding: "6px 18px" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#1f2937",
              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
            }}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
