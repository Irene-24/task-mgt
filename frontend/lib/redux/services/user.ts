import { baseApi } from "./base";
import type {
  GetMeResponse,
  GetUserByIdResponse,
  GetAllUsersResponse,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
} from "@/types/user.types";

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<GetMeResponse, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getAllUsers: build.query<GetAllUsersResponse, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getUserById: build.query<GetUserByIdResponse, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    updateUserRole: build.mutation<
      UpdateUserRoleResponse,
      { id: string; body: UpdateUserRoleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),
  }),
  overrideExisting: true,
});
export const {
  useGetMeQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
} = userApi;
export { userApi };
