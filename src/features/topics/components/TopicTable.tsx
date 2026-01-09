import { Eye, Pencil, CircleCheckBig, CircleX} from "lucide-react"; // Trash2
import type { Topic } from "../topic.types";
import StatusBadge from "../../../components/common/StatusBadge";

interface TopicTableProps {
  topics: Topic[];
  onView: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onPublish: (topic: Topic) => void;
}

export default function TopicTable({
  topics, onView, onEdit, onPublish, // onDelete is currently unused
}: TopicTableProps) {
  if (topics.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No topics found</p>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {topics.map((topic, index) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-3">
                    {topic.image && (
                      <img
                        src={topic.image}
                        alt={topic.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{topic.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {topic.description.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div>
                    <div className="text-gray-900">{topic.author_name || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {topic.author_email || ""}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={topic.publish_status ? "published" : "unpublished"}
                    size="sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(topic.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(topic)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(topic)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPublish(topic)}
                      className={`p-2 rounded transition-colors ${
                        topic.publish_status
                          ? "text-orange-600 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={topic.publish_status ? "Unpublish" : "Publish"}
                    >
                      {topic.publish_status ? (
                        <CircleX className="w-4 h-4" />
                      ) : (
                        <CircleCheckBig className="w-4 h-4" />
                      )}
                    </button>
                    {/* <button
                      onClick={() => onDelete(topic)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
