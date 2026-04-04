package models

import (
	"time"

	"gorm.io/gorm"
)

type UserProfile struct {
	gorm.Model     `json:"-"`
	UserID         string     `gorm:"uniqueIndex" json:"user_id"`
	Username       string     `json:"username"`
	Avatar         string     `json:"avatar"`
	Timezone       string     `default:"UTC" json:"timezone"`
	DiscordToken   string     `json:"-"`
	Standups       []Standup  `gorm:"many2many:standup_participants;" json:"standups"`
	CurrentStreak  int        `gorm:"default:0" json:"current_streak"`
	LongestStreak  int        `gorm:"default:0" json:"longest_streak"`
	LastActiveDate *time.Time `json:"last_active_date"`
}
