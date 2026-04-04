package services

import (
	"github.com/Gurkunwar/asyncflow/internal/models"
	"gorm.io/gorm"
	"time"
)

type UserService struct {
	DB *gorm.DB
}

func (s *UserService) GetOrCreateProfile(userID string) (*models.UserProfile, error) {
	var profile models.UserProfile
	err := s.DB.Unscoped().Where("user_id = ?", userID).
		FirstOrCreate(&profile, models.UserProfile{UserID: userID}).Error
	if err != nil {
		return nil, err
	}

	if profile.DeletedAt.Valid {
		s.DB.Model(&profile).Unscoped().Update("deleted_at", nil)
	}
	return &profile, nil
}

func (s *UserService) RecordActivity(userID string) (*models.UserProfile, error) {
	profile, err := s.GetOrCreateProfile(userID)
	if err != nil {
		return nil, err
	}

	// 1. Load the user's specific timezone (fallback to UTC if invalid)
	loc, err := time.LoadLocation(profile.Timezone)
	if err != nil {
		loc = time.UTC
	}

	// 2. Get "Now" and normalize it to exactly midnight in their timezone
	now := time.Now().In(loc)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)

	if profile.LastActiveDate == nil {
		// First time ever using the bot!
		profile.CurrentStreak = 1
		profile.LongestStreak = 1
	} else {
		// Normalize their last active time to midnight in their timezone
		lastActive := profile.LastActiveDate.In(loc)
		lastActiveDay := time.Date(lastActive.Year(), lastActive.Month(), lastActive.Day(), 0, 0, 0, 0, loc)

		// Calculate the exact difference in days
		daysDiff := int(today.Sub(lastActiveDay).Hours() / 24)

		if daysDiff == 1 {
			// Perfect! They posted yesterday. Increment streak.
			profile.CurrentStreak++
			if profile.CurrentStreak > profile.LongestStreak {
				profile.LongestStreak = profile.CurrentStreak
			}
		} else if daysDiff > 1 {
			// They missed a day. Streak is broken.
			profile.CurrentStreak = 1
		}
		// If daysDiff == 0, they already posted today. Do nothing to the streak count.
	}

	// 3. Always update their last active timestamp to right now
	profile.LastActiveDate = &now

	// 4. Save to database
	if err := s.DB.Save(profile).Error; err != nil {
		return nil, err
	}

	return profile, nil
}
