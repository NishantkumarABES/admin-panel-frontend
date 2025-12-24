import { api } from "./api";
import type {
  Topic,
  CreateTopicDTO,
  UpdateTopicDTO,
} from "../features/topics/topic.types";

export const getTopics = async (filters?: {
  authorType?: string;
  category?: string;
  status?: string;
  search?: string;
}) => {
  return api.get<Topic[]>("/topics", { params: filters });
};

export const getTopicById = async (id: string) => {
  return api.get<Topic>(`/topics/${id}`);
};

export const createTopic = async (data: CreateTopicDTO) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  return api.post<Topic>("/topics", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateTopic = async (data: UpdateTopicDTO) => {
  const { id, ...updateData } = data;
  const formData = new FormData();

  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  return api.put<Topic>(`/topics/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteTopic = async (id: string) => {
  return api.delete(`/topics/${id}`);
};

export const publishTopic = async (id: string) => {
  return api.post(`/topics/${id}/publish`);
};

export const unpublishTopic = async (id: string) => {
  return api.post(`/topics/${id}/unpublish`);
};
