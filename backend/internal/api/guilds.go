package api

import (
	"encoding/json"
	"net/http"
)

func (s *Server) HandleGetGuildRoles(w http.ResponseWriter, r *http.Request) {
	guildID := r.URL.Query().Get("guild_id")
	if guildID == "" {
		http.Error(w, "Missing guild_id parameter", http.StatusBadRequest)
		return
	}

	roles, err := s.Session.GuildRoles(guildID)
	if err != nil {
		http.Error(w, "Failed to fetch roles from Discord", http.StatusInternalServerError)
		return
	}

	type RoleDTO struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Color int    `json:"color"`
	}

	var res []RoleDTO
	for _, role := range roles {
		if role.ID == guildID || role.Managed {
			continue
		}

		res = append(res, RoleDTO{
			ID:    role.ID,
			Name:  role.Name,
			Color: role.Color,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}