import { client } from "@/generated/api/client.gen";

client.interceptors.response.use((response) => {
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return response;
});
