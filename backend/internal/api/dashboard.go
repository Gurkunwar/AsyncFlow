package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Gurkunwar/asyncflow/internal/api/dtos"
	"github.com/Gurkunwar/asyncflow/internal/models"
)

func (s *Server) HandleGetDashboardStats(w http.ResponseWriter, r *http.Request) {
	managerID := r.Context().Value(UserIDKey).(string)
	var stats dtos.DashboardStatsDTO

	s.DB.Model(&models.Standup{}).Where("manager_id = ?", managerID).Count(&stats.TotalTeams)

	s.DB.Table("standup_participants").
		Joins("JOIN standups ON standups.id = standup_participants.standup_id").
		Where("standups.manager_id = ?", managerID).
		Distinct("user_profile_id").
		Count(&stats.TotalMembers)

	stats.WeeklyData = make([]int64, 7)
	daysOfWeek := []string{"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}

	now := time.Now()
	busiestCount := int64(-1)
	stats.BusiestDay = "N/A"

	for i := 6; i >= 0; i-- {
		targetDate := now.AddDate(0, 0, -i).Format("2006-01-02")
		var dailyCount int64

		s.DB.Model(&models.StandupHistory{}).
			Joins("JOIN standups ON standups.id = standup_histories.standup_id").
			Where("standups.manager_id = ? AND standup_histories.date = ?", managerID, targetDate).
			Count(&dailyCount)

		arrayIndex := 6 - i
		stats.WeeklyData[arrayIndex] = dailyCount
		stats.RecentReports += dailyCount

		if dailyCount > busiestCount {
			busiestCount = dailyCount
			stats.BusiestDay = daysOfWeek[now.AddDate(0, 0, -i).Weekday()]
		}
	}

	var standups []models.Standup
	s.DB.Where("manager_id = ?", managerID).Find(&standups)
	for _, st := range standups {
		var teamCount int64
		s.DB.Model(&models.StandupHistory{}).Where("standup_id = ?", st.ID).Count(&teamCount)
		
		stats.BreakdownData = append(stats.BreakdownData, dtos.TeamBreakdown{
			TeamName: st.Name,
			Count:    teamCount,
		})
	}

	var recentHistories []models.StandupHistory
	s.DB.Preload("Standup").
		Joins("JOIN standups ON standups.id = standup_histories.standup_id").
		Where("standups.manager_id = ?", managerID).
		Order("standup_histories.created_at desc").
		Limit(15).
		Find(&recentHistories)

	for _, h := range recentHistories {
		avatar := "0" 
		member, err := s.Session.GuildMember(h.Standup.GuildID, h.UserID)
		if err == nil && member.User != nil {
			if member.User.Avatar != "" {
				avatar = member.User.ID + "/" + member.User.Avatar
			}
		}

		taskText := "Submitted daily report"
		if len(h.Answers) > 0 && h.Answers[0] != "" {
			taskText = h.Answers[0]
		}

		userName := h.UserID
		if member != nil && member.User != nil {
			userName = member.User.Username
		}

		stats.Blockers = append(stats.Blockers, dtos.BlockerDTO{
			ID:     h.ID,
			User:   userName,
			Avatar: avatar,
			Team:   h.Standup.Name,
			Task:   taskText,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}