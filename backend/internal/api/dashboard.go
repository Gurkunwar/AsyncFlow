package api

import (
	"encoding/json"
	"net/http"
	"strings"
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
	now := time.Now()
	sevenDaysAgo := now.AddDate(0, 0, -7).Format("2006-01-02")

	type result struct {
		Date  string
		Count int64
	}
	var dailyResults []result

	s.DB.Table("standup_histories").
		Select("date, count(*) as count").
		Joins("JOIN standups ON standups.id = standup_histories.standup_id").
		Where("standups.manager_id = ? AND standup_histories.date > ?", managerID, sevenDaysAgo).
		Group("date").
		Scan(&dailyResults)

	busiestCount := int64(-1)
	stats.BusiestDay = "N/A"
	dateMap := make(map[string]int64)
	for _, res := range dailyResults {
		dateMap[res.Date] = res.Count
	}

	daysOfWeek := []string{"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}
	for i := 6; i >= 0; i-- {
		d := now.AddDate(0, 0, -i)
		dateStr := d.Format("2006-01-02")
		count := dateMap[dateStr]

		index := 6 - i
		stats.WeeklyData[index] = count
		stats.RecentReports += count

		if count > busiestCount {
			busiestCount = count
			stats.BusiestDay = daysOfWeek[d.Weekday()]
		}
	}

	s.DB.Table("standup_histories").
		Select("standups.name as team_name, count(standup_histories.id) as count").
		Joins("JOIN standups ON standups.id = standup_histories.standup_id").
		Where("standups.manager_id = ?", managerID).
		Group("standups.name").
		Scan(&stats.BreakdownData)

	var recentHistories []models.StandupHistory
	s.DB.Preload("Standup").
		Joins("JOIN standups ON standups.id = standup_histories.standup_id").
		Where("standups.manager_id = ?", managerID).
		Order("standup_histories.created_at desc").
		Limit(100).
		Find(&recentHistories)

	keywords := []string{"blocked", "stuck", "issue", "help", "failing", "error", "bug", "can't", "waiting"}

	for _, h := range recentHistories {
		if len(stats.Blockers) >= 15 {
			break
		}

		if len(h.Answers) > 0 && h.Answers[0] == "Skipped / OOO" {
			continue
		}

		isBlocker := false
		blockerText := ""

		for _, ans := range h.Answers {
			lowerAns := strings.ToLower(ans)
			for _, kw := range keywords {
				if strings.Contains(lowerAns, kw) {
					isBlocker = true
					blockerText = ans
					break
				}
			}
			if isBlocker {
				break
			}
		}

		if isBlocker {
			userName := "User " + h.UserID[len(h.UserID)-4:]
			avatar := "0"

			var profile models.UserProfile
			if err := s.DB.Where("user_id = ?", h.UserID).First(&profile).Error; err == nil {
				userName = profile.Username
				avatar = profile.Avatar
			} else {
				member, err := s.Session.State.Member(h.Standup.GuildID, h.UserID)
				if err != nil {
					member, _ = s.Session.GuildMember(h.Standup.GuildID, h.UserID)
				}
				if member != nil && member.User != nil {
					userName = member.User.Username
					if member.User.Avatar != "" {
						avatar = member.User.Avatar
					}
					s.DB.Where(models.UserProfile{UserID: h.UserID}).
						Assign(models.UserProfile{Username: userName, Avatar: avatar}).
						FirstOrCreate(&models.UserProfile{})
				}
			}

			if len(blockerText) > 80 {
				blockerText = blockerText[:77] + "..."
			}

			stats.Blockers = append(stats.Blockers, dtos.BlockerDTO{
				ID:        h.ID,
				UserID:    h.UserID,
				User:      userName,
				Avatar:    avatar,
				Team:      h.Standup.Name,
				Task:      blockerText,
				CreatedAt: h.CreatedAt,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (s *Server) HandleGetPollStats(w http.ResponseWriter, r *http.Request) {
	managerID := r.Context().Value(UserIDKey).(string)
	var stats dtos.PollDashboardStatsDTO

	s.DB.Model(&models.Poll{}).Where("creator_id = ?", managerID).Count(&stats.TotalPolls)
	s.DB.Model(&models.Poll{}).
		Where("creator_id = ? AND is_active = ?", managerID, true).Count(&stats.ActivePolls)

	s.DB.Table("poll_votes").
		Joins("JOIN polls ON polls.id = poll_votes.poll_id").
		Where("polls.creator_id = ?", managerID).
		Count(&stats.TotalVotes)

	stats.WeeklyData = make([]int64, 7)
	now := time.Now()
	sevenDaysAgo := now.AddDate(0, 0, -7).Format("2006-01-02")

	type result struct {
		Date  string
		Count int64
	}
	var dailyResults []result

	s.DB.Table("polls").
		Select("DATE(created_at) as date, count(*) as count").
		Where("creator_id = ? and created_at > ?", managerID, sevenDaysAgo).
		Group("DATE(created_at)").
		Scan(&dailyResults)

	busiestCount := int64(-1)
	stats.BusiestDay = "N/A"
	dateMap := make(map[string]int64)
	for _, res := range dailyResults {
		dateKey := res.Date
		if len(dateKey) > 10 {
			dateKey = dateKey[:10]
		}
		dateMap[dateKey] = res.Count
	}

	daysOfWeek := []string{"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}
	for i := 6; i >= 0; i-- {
		d := now.AddDate(0, 0, -i)
		dateStr := d.Format("2006-01-02")
		count := dateMap[dateStr]

		index := 6 - i
		stats.WeeklyData[index] = count
		stats.RecentReports += count

		if count > busiestCount {
			busiestCount = count
			stats.BusiestDay = daysOfWeek[d.Weekday()]
		}
	}

	s.DB.Table("poll_votes").
		Select("polls.question as poll_question, count(poll_votes.id) as count").
		Joins("JOIN polls ON polls.id = poll_votes.poll_id").
		Where("polls.creator_id = ?", managerID).
		Group("polls.id, polls.question").
		Order("count DESC").
		Limit(6).
		Scan(&stats.TopPolls)

	var recentPolls []models.Poll
	s.DB.Where("creator_id = ? AND is_active = ?", managerID, true).Order("created_at desc").Limit(15).Find(&recentPolls)

	for _, p := range recentPolls {
		stats.RecentPolls = append(stats.RecentPolls, dtos.RecentPollDTO{
			ID:        p.ID,
			Question:  p.Question,
			IsActive:  p.IsActive,
			CreatedAt: p.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
