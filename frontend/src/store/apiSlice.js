import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const asyncFlowApi = createApi({
  reducerPath: "dailyBotApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Standup",
    "Members",
    "History",
    "Managed Standups",
    "ManagedPolls",
    "Poll",
  ],
  endpoints: (builder) => ({
    getStandupById: builder.query({
      query: (id) => `standups/get?id=${id}`,
      providesTags: (result, error, id) => [{ type: "Standup", id }],
    }),
    getGuildMembers: builder.query({
      query: (guildId) => `guild-members?guild_id=${guildId}`,
      providesTags: ["Members"],
    }),
    getGuildChannels: builder.query({
      query: (guildId) => `guild-channels?guild_id=${guildId}`,
    }),
    getGuildRoles: builder.query({
      query: (guildId) => `/guilds/roles?guild_id=${guildId}`,
    }),
    getHistory: builder.query({
      query: ({ id, page = 1, limit = 20, search = "", status = "all" }) =>
        `/standups/history?standup_id=${id}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`,
      providesTags: ["History"],
    }),
    getManagedStandups: builder.query({
      query: ({ filter, page, limit = 12, search = "", guild_id = "" }) =>
        `managed-standups?filter=${filter}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&guild_id=${guild_id}`,
      providesTags: ["ManagedStandups"],
    }),
    getUserGuilds: builder.query({
      query: () => "user-guilds",
    }),
    getDashboardStats: builder.query({
      query: () => "dashboard/stats",
    }),
    getPollDashboardStats: builder.query({
      query: () => "dashboard/poll-stats",
    }),
    toggleMember: builder.mutation({
      query: ({ standupId, userId, isCurrentlyMember }) => ({
        url: `standups/${isCurrentlyMember ? "remove-member" : "add-member"}`,
        method: "POST",
        body: { standup_id: parseInt(standupId), user_id: userId },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Standup", id: arg.standupId },
      ],
    }),
    createStandup: builder.mutation({
      query: (payload) => ({
        url: `standups/create`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Managed Standups"],
    }),
    updateStandup: builder.mutation({
      query: (payload) => ({
        url: `standups/update`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Standup", id: arg.id },
      ],
    }),
    deleteStandup: builder.mutation({
      query: (id) => ({
        url: `standups/delete?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ManagedStandups"],
    }),
    testStandup: builder.mutation({
      query: (id) => ({
        url: `standups/test`,
        method: "POST",
        body: { standup_id: parseInt(id) },
      }),
    }),
    getStandupStats: builder.query({
      query: ({ id, days }) => `/standups/stats?id=${id}&days=${days}`,
      providesTags: ["Standups"],
    }),

    getManagedPolls: builder.query({
      query: ({ filter, page, limit = 12, search = "", guild_id = "" }) =>
        `managed-polls?filter=${filter}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&guild_id=${guild_id}`, // 👈 Append it to the URL here
      providesTags: ["ManagedPolls"],
    }),
    getPollById: builder.query({
      query: (id) => `polls/get?id=${id}`,
      providesTags: (result, error, id) => [{ type: "Poll", id }],
    }),
    createPoll: builder.mutation({
      query: (payload) => ({
        url: `polls/create`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ManagedPolls"],
    }),
    deletePoll: builder.mutation({
      query: (id) => ({
        url: `polls/delete?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ManagedPolls"],
    }),
    endPoll: builder.mutation({
      query: (pollId) => ({
        url: `polls/end`,
        method: "POST",
        body: { poll_id: parseInt(pollId) },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Poll", id: arg },
        "ManagedPolls",
      ],
    }),
    getPollHistory: builder.query({
      query: ({ id, page = 1, limit = 20, search = "" }) =>
        `/polls/history?poll_id=${id}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ["History"],
    }),
    getUserSettings: builder.query({
      query: () => `user/settings/get`,
      providesTags: ["UserSettings"],
    }),
    updateUserSettings: builder.mutation({
      query: (payload) => ({
        url: `user/settings/update`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["UserSettings"],
    }),
  }),
});

export const {
  useGetStandupByIdQuery,
  useGetUserGuildsQuery,
  useGetGuildMembersQuery,
  useGetGuildRolesQuery,
  useGetGuildChannelsQuery,

  useGetHistoryQuery,
  useGetDashboardStatsQuery,
  useGetPollDashboardStatsQuery,
  useCreateStandupMutation,
  useToggleMemberMutation,
  useUpdateStandupMutation,
  useDeleteStandupMutation,
  useGetManagedStandupsQuery,
  useTestStandupMutation,
  useGetStandupStatsQuery,

  useGetManagedPollsQuery,
  useGetPollByIdQuery,
  useCreatePollMutation,
  useDeletePollMutation,
  useEndPollMutation,
  useGetPollHistoryQuery,

  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
} = asyncFlowApi;
