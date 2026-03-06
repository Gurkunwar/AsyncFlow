package services

import (
	"errors"
	_ "time/tzdata"

	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/bwmarrin/discordgo"
	"gorm.io/gorm"
)

type StandupService struct {
	DB          *gorm.DB
	Session     *discordgo.Session
	TriggerFunc func(s *discordgo.Session, userID, guildID, channelID string, standupID uint)
}

func (s *StandupService) CreateStandup(input models.Standup) error {
	if input.Name == "" {
		return errors.New("standup name cannot be empty")
	}
	if len(input.Questions) == 0 {
		return errors.New("at least one question is required")
	}

	return s.DB.Create(&input).Error
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

	return s.DB.Model(&user).Association("Standups").Append(&standup)
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

	return s.DB.Model(&user).Association("Standups").Delete(&standup)
}
