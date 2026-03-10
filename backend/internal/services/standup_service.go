package services

import (
	"slices"
	"errors"
	"fmt"
	"log"
	"time"
	_ "time/tzdata"

	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/bwmarrin/discordgo"
	"gorm.io/gorm"
)

type StandupService struct {
	DB          *gorm.DB
	Session     *discordgo.Session
	TriggerFunc func(s *discordgo.Session, userID, guildID, channelID string, standupID uint) error
}

func (s *StandupService) CreateStandup(input models.Standup) (*models.Standup, error) {
    if input.Name == "" {
        return nil, errors.New("standup name cannot be empty")
    }
    if len(input.Questions) == 0 {
        return nil, errors.New("at least one question is required")
    }
    if input.GuildID == "" {
        return nil, errors.New("guild ID cannot be empty")
    }

    if err := s.DB.FirstOrCreate(&models.Guild{}, models.Guild{GuildID: input.GuildID}).Error; err != nil {
        return nil, fmt.Errorf("failed to register guild in database: %v", err)
    }

    if err := s.DB.Create(&input).Error; err != nil {
        return nil, err
    }
    
    return &input, nil
}

func (s *StandupService) UpdateStandup(standup models.Standup) error {
    return s.DB.Save(&standup).Error
}

func (s *StandupService) DeleteStandup(standupID uint) error {
    var standup models.Standup
    if err := s.DB.First(&standup, standupID).Error; err != nil {
        return err
    }

    if standup.ReportChannelID != "" {
        goodbyeMsg := fmt.Sprintf("🛑 **The '%s' standup has been permanently deleted by the manager.**\n" +
		"No further daily prompts will be sent for this team.", standup.Name)
        if _, err := s.Session.ChannelMessageSend(standup.ReportChannelID, goodbyeMsg); err != nil {
            log.Printf("Warning: Failed to send deletion notice to channel %s: %v", standup.ReportChannelID, err)
        }
    }

    s.DB.Model(&standup).Association("Participants").Clear()
    return s.DB.Unscoped().Delete(&standup).Error
}

func (s *StandupService) GetUserManagedStandups(managerID string) ([]models.Standup, error) {
	var standups []models.Standup
	err := s.DB.Where("manager_id = ?", managerID).Find(&standups).Error

	return standups, err
}

func (s *StandupService) AddMemberToStandup(userID string, standupID uint) error {
    var user models.UserProfile
    s.DB.Unscoped().Where("user_id = ?", userID).FirstOrCreate(&user, models.UserProfile{UserID: userID})

    if user.DeletedAt.Valid {
        s.DB.Model(&user).Unscoped().Update("deleted_at", nil)
    }

    var standup models.Standup
    if err := s.DB.First(&standup, standupID).Error; err != nil {
        return err
    }

    err := s.DB.Model(&user).Association("Standups").Append(&standup)
    if err != nil {
        return err
    }

    if dmChannel, err := s.Session.UserChannelCreate(userID); err == nil {
        welcomeMsg := fmt.Sprintf("👋 **You've been added to the '%s' Standup!**\n\n" +
		"You can now submit your daily reports for this team.\nRun `/start` here or in the server to begin.", 
		standup.Name)
        s.Session.ChannelMessageSend(dmChannel.ID, welcomeMsg)
    }

    return nil
}

func (s *StandupService) RemoveMemberFromStandup(userID string, standupID uint) error {
    var user models.UserProfile
    if err := s.DB.Unscoped().Where("user_id = ?", userID).First(&user).Error; err != nil {
        return err
    }

    var standup models.Standup
    if err := s.DB.First(&standup, standupID).Error; err != nil {
        return err
    }

    err := s.DB.Model(&user).Association("Standups").Delete(&standup)
    if err != nil {
        return err
    }

    if dmChannel, err := s.Session.UserChannelCreate(userID); err == nil {
        goodbyeMsg := fmt.Sprintf("ℹ️ You have been removed from the **%s** standup team.", standup.Name)
        s.Session.ChannelMessageSend(dmChannel.ID, goodbyeMsg)
    }

    return nil
}

func (s *StandupService) GetHistory(userID string, standupID uint, days int) ([]models.StandupHistory, error) {
    cutoffDate := time.Now().AddDate(0, 0, -days).Format("2006-01-02")
    var histories []models.StandupHistory

    err := s.DB.Where("user_id = ? AND standup_id = ? AND date >= ?", userID, standupID, cutoffDate).
        Order("date desc").
        Limit(50).
        Find(&histories).Error

    return histories, err
}

func (s *StandupService) SyncRoleMembers(standupID uint) error {
    var standup models.Standup
    if err := s.DB.Preload("Participants").First(&standup, standupID).Error; err != nil {
        return err
    }

    if standup.SyncRoleID == "" {
        return nil
    }

    var allMembers []*discordgo.Member
    var after string
    for {
        members, err := s.Session.GuildMembers(standup.GuildID, after, 1000)
        if err != nil {
            return fmt.Errorf("failed to fetch guild members: %v", err)
        }
        allMembers = append(allMembers, members...)
        if len(members) < 1000 {
            break
        }
        after = members[len(members)-1].User.ID
    }

    existingMap := make(map[string]bool)
    for _, p := range standup.Participants {
        existingMap[p.UserID] = true
    }

    addedCount := 0

    for _, m := range allMembers {
        if m.User.Bot {
            continue
        }

        hasRole := slices.Contains(m.Roles, standup.SyncRoleID)

        if hasRole && !existingMap[m.User.ID] {
            err := s.AddMemberToStandup(m.User.ID, standup.ID)
            if err != nil {
                log.Printf("❌ Failed to auto-sync user %s: %v", m.User.Username, err)
            } else {
                addedCount++
            }
        }
    }

    if addedCount > 0 {
        log.Printf("Role auto-sync complete for standup '%s'. Added %d new members.", standup.Name, addedCount)
    }
    
    return nil
}

func (s *StandupService) TestRun(standupID uint, managerID string) error {
    var standup models.Standup 
    if err := s.DB.First(&standup, standupID).Error; err != nil {
        return err
    }

    if standup.ManagerID != managerID {
		return errors.New("unauthorized")
	}

    if s.TriggerFunc != nil {
		if dmChannel, err := s.Session.UserChannelCreate(managerID); err == nil {
			s.Session.ChannelMessageSend(dmChannel.ID, 
                "🧪 **TEST RUN INITIATED** 🧪\nHere is a preview of your daily prompt:")
		}

		return s.TriggerFunc(s.Session, managerID, standup.GuildID, standup.ReportChannelID, standup.ID)
	}

	return errors.New("Trigger function not configured on server start")
}