import { baseApi } from "./base";
import type {
  GetAllUsersResponse,
  UpdateUserRoleRequest,
  GetUserResponse,
  User,
} from "@/types/user.types";

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<User, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      transformResponse: (response: GetUserResponse) => response.user,
      providesTags: ["User"],
    }),

    getAllUsers: build.query<GetAllUsersResponse, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getUserById: build.query<User, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      transformResponse: (response: GetUserResponse) => response.user,

      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    updateUserRole: build.mutation<
      User,
      { id: string; body: UpdateUserRoleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: GetUserResponse) => response.user,

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
