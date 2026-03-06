package poll

import (
	"github.com/Gurkunwar/asyncflow/internal/services"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type PollHandler struct {
	DB      *gorm.DB
	Redis   *redis.Client
	Service *services.PollService
}

func NewPollHandler(db *gorm.DB, redis *redis.Client, service *services.PollService) *PollHandler {
	return &PollHandler{DB: db, Redis: redis, Service: service}
}
