package poll

import (
	"log"

	"github.com/Gurkunwar/asyncflow/internal/services"
	"github.com/bwmarrin/discordgo"
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

func (h *PollHandler) OnVoteAdd(s *discordgo.Session, e *discordgo.MessagePollVoteAdd) {
	err := h.Service.HandleVoteAdd(e.ChannelID, e.MessageID, e.UserID, e.AnswerID)
	if err != nil {
		log.Printf("Failed to sync poll vote add: %v", err)
	}

	if h.Service.WSBroadcast != nil {
        log.Println("⚡ Emitting live poll update to Web Dashboard...")
        select {
        case h.Service.WSBroadcast <- []byte(`{"type": "NEW_POLL_VOTE"}`):
        default:
            log.Println("⚠️ WS Broadcast channel blocked/full, skipping live update.")
        }
    }
}

func (h *PollHandler) OnVoteRemove(s *discordgo.Session, e *discordgo.MessagePollVoteRemove) {
	err := h.Service.HandleVoteRemove(e.ChannelID, e.MessageID, e.UserID, e.AnswerID)
	if err != nil {
		log.Printf("Failed to sync poll vote remove: %v", err)
	}

	if h.Service.WSBroadcast != nil {
        log.Println("⚡ Emitting live poll update to Web Dashboard...")
        select {
        case h.Service.WSBroadcast <- []byte(`{"type": "NEW_POLL_VOTE"}`):
        default:
            log.Println("⚠️ WS Broadcast channel blocked/full, skipping live update.")
        }
    }
}