package standup

import (
	"fmt"
	"time"

	"github.com/Gurkunwar/asyncflow/internal/services"
	"github.com/bwmarrin/discordgo"
	"github.com/robfig/cron/v3"
)

func InitCronScheduler(standupService *services.StandupService) {
	c := cron.New()

	_, err := c.AddFunc("0 0 1 * *", func() {
		fmt.Println("Triggering monthly standup summaries...")
		GenerateAndSendMonthlySummaries(standupService)
	})

	if err != nil {
		fmt.Println("Error scheduling monthly summary: ", err)
		return
	}

	c.Start()
	fmt.Println("Monthly cron scheduler started successfully.")
}

type UserStats struct {
	Attended int
	Skipped  int
}

func GenerateAndSendMonthlySummaries(service *services.StandupService) {
	now := time.Now()
	firstDayOfCurrentMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	lastDayOfPrevMonth := firstDayOfCurrentMonth.Add(-time.Nanosecond)
	firstDayOfPrevMonth := time.Date(lastDayOfPrevMonth.Year(),
		lastDayOfPrevMonth.Month(), 1, 0, 0, 0, 0, lastDayOfPrevMonth.Location())

	monthName := firstDayOfPrevMonth.Month().String()

	standups, err := service.GetAllStandupsWithParticipants()
	if err != nil {
		fmt.Println("Failed to fetch standups for cron:", err)
		return
	}

	for _, standup := range standups {
		if standup.ReportChannelID == "" {
			continue
		}

		totalDays, _ := service.GetTotalStandupDays(standup.ID, firstDayOfPrevMonth, lastDayOfPrevMonth)
		if totalDays == 0 {
			continue
		}

		histories, _ := service.GetHistoryForDateRange(standup.ID, firstDayOfPrevMonth, lastDayOfPrevMonth)

		stats := make(map[string]*UserStats)
		for _, p := range standup.Participants {
			stats[p.UserID] = &UserStats{Attended: 0, Skipped: 0}
		}

		for _, h := range histories {
			if stat, exists := stats[h.UserID]; exists {
				isSkipped := h.IsSkipped
				if len(h.Answers) > 0 && h.Answers[0] == "Skipped / OOO" {
					isSkipped = true
				}

				if isSkipped {
					stat.Skipped++
				} else {
					stat.Attended++
				}
			}
		}
		sendSummaryEmbed(service.Session, standup.Name, standup.ReportChannelID, stats, int(totalDays), monthName)
	}
}

func sendSummaryEmbed(session *discordgo.Session, standupName, channelID string,
	stats map[string]*UserStats, totalDays int, monthName string) {

	embed := &discordgo.MessageEmbed{
		Title: fmt.Sprintf("📊 %s Summary for %s", standupName, monthName),
		Description: fmt.Sprintf("The standup ran **%d times** this month. Here is the team's participation breakdown:",
			totalDays),
		Color:     0x5865F2,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	for userID, stat := range stats {
		ignored := totalDays - (stat.Attended + stat.Skipped)
		if ignored < 0 {
			ignored = 0
		}

		statString := fmt.Sprintf("✅ **Attended:** %d\n🌴 **Skipped:** %d\n👻 **Ignored:** %d",
			stat.Attended, stat.Skipped, ignored)

		discordUser, err := session.User(userID)
		displayName := "Unknown User"

		if err == nil {
			if discordUser.GlobalName != "" {
				displayName = discordUser.GlobalName
			} else {
				displayName = discordUser.Username
			}
		} else {
			displayName = fmt.Sprintf("User %s", userID[len(userID)-4:]) 
		}

		embed.Fields = append(embed.Fields, &discordgo.MessageEmbedField{
			Name:   fmt.Sprintf("👤 %s", displayName),
			Value:  statString,
			Inline: true,
		})
	}

	_, err := session.ChannelMessageSendEmbed(channelID, embed)
	if err != nil {
		fmt.Println("Error sending monthly summary embed:", err)
	}
}