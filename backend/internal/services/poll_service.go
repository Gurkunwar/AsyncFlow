package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/bwmarrin/discordgo"
	"gorm.io/gorm"
)

type PollService struct {
	DB      *gorm.DB
	Session *discordgo.Session
}

func NewPollService(db *gorm.DB, session *discordgo.Session) *PollService {
	return &PollService{DB: db, Session: session}
}

func (s *PollService) CreatePoll(guildID, channelID, creatorID,
	question string, options []string, duration int) (*models.Poll, error) {

	var pollAnswers []discordgo.PollAnswer

	for _, optText := range options {
		cleanOpt := strings.TrimSpace(optText)
		if cleanOpt == "" {
			continue
		}

		pollAnswers = append(pollAnswers, discordgo.PollAnswer{
			Media: &discordgo.PollMedia{Text: cleanOpt},
		})
	}

	if len(pollAnswers) < 2 {
		return nil, errors.New("a poll must have at least 2 valid options")
	}

	nativePoll := &discordgo.Poll{
		Question: discordgo.PollMedia{Text: question},
		Answers: pollAnswers,
		AllowMultiselect: false,
		Duration: duration,
	}

	msg, err := s.Session.ChannelMessageSendComplex(channelID, &discordgo.MessageSend{
		Poll: nativePoll,
	})
	if err != nil {
        return nil, fmt.Errorf("failed to publish poll to discord: %w", err)
    }

	pollModel := models.Poll{
		GuildID:   guildID,
        ChannelID: channelID,
        CreatorID: creatorID,
        Question:  question,
        MessageID: msg.ID,
        IsActive:  true,
	}

	tx := s.DB.Begin()

	if err := tx.Create(&pollModel).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("database error creating poll: %w", err)
	}

	for _, answer := range pollAnswers {
		pollOpt := models.PollOption{
			PollID: pollModel.ID,
			Label: answer.Media.Text,
		}
		if err := tx.Create(&pollOpt).Error; err != nil {
			tx.Rollback()
            return nil, fmt.Errorf("database error creating poll option: %w", err)
		}
	}

	tx.Commit()

	return &pollModel, nil
}

func (s *PollService) EndPoll(pollID uint) error {
	var poll models.Poll
	if err := s.DB.First(&poll, pollID).Error; err != nil {
		return errors.New("poll not found in database")
	}

	endpoint := discordgo.EndpointChannel(poll.ChannelID) + "/polls/" + poll.MessageID + "/expire"
	_, err := s.Session.RequestWithBucketID("POST", endpoint, map[string]interface{}{},
		discordgo.EndpointChannelMessage(poll.ChannelID, ""))
	if err != nil {
		return fmt.Errorf("failed to end poll on discord: %v", err)
	}

	poll.IsActive = false
	return s.DB.Save(&poll).Error
}

func (s *PollService) GenerateCSVExport(pollID uint) (string, error) {
	var poll models.Poll
	if err := s.DB.First(&poll, pollID).Error; err != nil {
		return "", errors.New("poll not found")
	}

	msg, err := s.Session.ChannelMessage(poll.ChannelID, poll.MessageID)
	if err != nil || msg.Poll == nil {
		return "", errors.New("could not fetch live poll from Discord")
	}

	var csvBuilder strings.Builder
	csvBuilder.WriteString("Option, Discord User ID, Username\n")

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

	return csvBuilder.String(), nil
}
