package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/Gurkunwar/asyncflow/internal/api/dtos"
	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/bwmarrin/discordgo"
)

func (s *Server) HandleGetManagedPolls(w http.ResponseWriter, r *http.Request) {
    managerID := r.Context().Value(UserIDKey).(string)
    onlyMe := r.URL.Query().Get("filter") == "me"

    var allPolls []models.Poll
    if err := s.DB.Order("id desc").Find(&allPolls).Error; err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }

    var response []dtos.PollDTO
    for _, p := range allPolls {
        isCreator := p.CreatorID == managerID
        
        if onlyMe && !isCreator {
            continue
        }

        isAdmin := false
        if !isCreator {
            member, err := s.Session.State.Member(p.GuildID, managerID)
            if err != nil {
                member, _ = s.Session.GuildMember(p.GuildID, managerID)
            }

            if member != nil {
                guild, _ := s.Session.State.Guild(p.GuildID)
                if guild == nil {
                    guild, _ = s.Session.Guild(p.GuildID)
                }
                
                if guild != nil && guild.OwnerID == managerID {
                    isAdmin = true
                } else {
                    permissions, _ := s.Session.UserChannelPermissions(managerID, p.ChannelID)
                    if permissions&discordgo.PermissionAdministrator != 0 || permissions&discordgo.PermissionManageServer != 0 {
                        isAdmin = true
                    }
                }
            }
        }

        if isCreator || isAdmin {
            gName, cName := s.GetDiscordMetadata(p.GuildID, p.ChannelID)
            response = append(response, dtos.PollDTO{
                ID:          p.ID,
                Question:    p.Question,
                GuildName:   gName,
                ChannelName: cName,
                IsActive:    p.IsActive,
            })
        }
    }

    if response == nil {
        response = []dtos.PollDTO{}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func (s *Server) HandleGetPoll(w http.ResponseWriter, r *http.Request) {
	pollID := r.URL.Query().Get("id")
	if pollID == "" {
		http.Error(w, "Missing poll id", http.StatusBadRequest)
		return
	}

	var poll models.Poll
	if err := s.DB.Preload("Options").First(&poll, pollID).Error; err != nil {
		http.Error(w, "Poll not found", http.StatusNotFound)
		return
	}

	msg, err := s.Session.ChannelMessage(poll.ChannelID, poll.MessageID)
	if err == nil && msg.Poll != nil {
		optMap := make(map[string]uint)
		for _, o := range poll.Options {
			optMap[o.Label] = o.ID
		}

		var liveVotes []models.PollVote
		for _, answer := range msg.Poll.Answers {
			optID, exists := optMap[answer.Media.Text]
			if !exists {
				continue
			}

			voters, _ := s.Session.PollAnswerVoters(poll.ChannelID, poll.MessageID, answer.AnswerID)
			for _, voter := range voters {
				liveVotes = append(liveVotes, models.PollVote{
					PollID:   poll.ID,
					OptionID: optID,
					UserID:   voter.ID,
				})
			}
		}
		
		poll.Votes = liveVotes
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(poll)
}

func (s *Server) HandleCreateWebPoll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		GuildID   string   `json:"guild_id"`
		ChannelID string   `json:"channel_id"`
		Question  string   `json:"question"`
		Duration  int      `json:"duration"`
		Options   []string `json:"options"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	managerID := r.Context().Value(UserIDKey).(string)

	var pollAnswers []discordgo.PollAnswer
	for _, optText := range payload.Options {
		pollAnswers = append(pollAnswers, discordgo.PollAnswer{
			Media: &discordgo.PollMedia{
				Text: optText,
			},
		})
	}

	nativePoll := &discordgo.Poll{
		Question: discordgo.PollMedia{
			Text: payload.Question,
		},
		Answers:          pollAnswers,
		AllowMultiselect: false,
		Duration:         payload.Duration,
	}

	msg, err := s.Session.ChannelMessageSendComplex(payload.ChannelID, &discordgo.MessageSend{
		Poll: nativePoll,
	})
	if err != nil {
		http.Error(w, "Failed to publish poll to Discord", http.StatusInternalServerError)
		return
	}

	pollModel := models.Poll{
		GuildID:   payload.GuildID,
		ChannelID: payload.ChannelID,
		CreatorID: managerID,
		Question:  payload.Question,
		MessageID: msg.ID,
		IsActive:  true,
	}
	s.DB.Create(&pollModel)

	for _, answerText := range payload.Options {
		s.DB.Create(&models.PollOption{
			PollID: pollModel.ID,
			Label:  answerText,
		})
	}

	receiptMessage := fmt.Sprintf("✅ Poll published! (Poll ID: `%d`)", pollModel.ID)
	s.Session.ChannelMessageSend(payload.ChannelID, receiptMessage)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Poll published successfully!"})
}

func (s *Server) HandleEndWebPoll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		PollID uint `json:"poll_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	managerID := r.Context().Value(UserIDKey).(string)

	var poll models.Poll
	if err := s.DB.Where("id = ? AND creator_id = ?", req.PollID, managerID).First(&poll).Error; err != nil {
		http.Error(w, "Poll not found or unauthorized", http.StatusUnauthorized)
		return
	}

	endpoint := discordgo.EndpointChannel(poll.ChannelID) + "/polls/" + poll.MessageID + "/expire"
	_, err := s.Session.RequestWithBucketID("POST", endpoint, map[string]interface{}{},
		discordgo.EndpointChannelMessage(poll.ChannelID, ""))
	if err != nil {
		log.Printf("Failed to end poll on Discord: %v", err)
	}

	poll.IsActive = false
	s.DB.Save(&poll)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Poll ended successfully"})
}

func (s *Server) HandleExportWebPoll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pollID := r.URL.Query().Get("id")
	if pollID == "" {
		http.Error(w, "Missing poll id", http.StatusBadRequest)
		return
	}

	managerID := r.Context().Value(UserIDKey).(string)

	var poll models.Poll
	if err := s.DB.Where("id = ? AND creator_id = ?", pollID, managerID).First(&poll).Error; err != nil {
		http.Error(w, "Poll not found or unauthorized", http.StatusUnauthorized)
		return
	}

	msg, err := s.Session.ChannelMessage(poll.ChannelID, poll.MessageID)
	if err != nil || msg.Poll == nil {
		http.Error(w, "Could not fetch live poll from Discord", http.StatusInternalServerError)
		return
	}

	var csvBuilder strings.Builder
	csvBuilder.WriteString("Option,User ID,Username\n")

	for _, answer := range msg.Poll.Answers {
		optionText := strings.ReplaceAll(answer.Media.Text, ",", ";")

		voters, _ := s.Session.PollAnswerVoters(poll.ChannelID, poll.MessageID, answer.AnswerID)

		if len(voters) == 0 {
			csvBuilder.WriteString(fmt.Sprintf("%s,NONE,No votes\n", optionText))
		} else {
			for _, voter := range voters {
				csvBuilder.WriteString(fmt.Sprintf("%s,%s,%s\n", optionText, voter.ID, voter.Username))
			}
		}
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=poll_%s_results.csv", pollID))
	
	w.Write([]byte(csvBuilder.String()))
}