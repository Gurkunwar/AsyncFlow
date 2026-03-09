package standup

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/Gurkunwar/asyncflow/internal/bot/utils"
	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/Gurkunwar/asyncflow/internal/store"
	"github.com/bwmarrin/discordgo"
	"github.com/redis/go-redis/v9"
)

func (h *StandupHandler) syncDiscordProfile(session *discordgo.Session,
	userID string) (models.UserProfile, string, string) {

	var userProfile models.UserProfile
	h.DB.Where("user_id = ?", userID).First(&userProfile)

	discordUser, err := session.User(userID)
	userName := userID
	avatarURL := ""

	if err == nil {
		userName = discordUser.Username
		avatarURL = discordUser.AvatarURL("")

		needsUpdate := false
		if userProfile.Username != userName {
			userProfile.Username = userName
			needsUpdate = true
		}
		if userProfile.Avatar != avatarURL {
			userProfile.Avatar = avatarURL
			needsUpdate = true
		}
		if needsUpdate {
			h.DB.Save(&userProfile)
		}
	}

	return userProfile, userName, avatarURL
}

func (h *StandupHandler) InitiateStandup(s *discordgo.Session, userID string,
	guildID, channelID string, standupID uint) error {

	var profile models.UserProfile
	h.DB.Unscoped().Preload("Standups").Where("user_id = ?", userID).First(&profile)

	if profile.ID != 0 && profile.DeletedAt.Valid {
		h.DB.Model(&profile).Unscoped().Update("deleted_at", nil)
	}

	targetChannelID := channelID
	dm, err := s.UserChannelCreate(userID)
	if err == nil {
		targetChannelID = dm.ID
	} else {
		return fmt.Errorf("I cannot DM you. Please enable DMs from server members.")
	}

	if profile.ID == 0 || len(profile.Standups) == 0 {
		return fmt.Errorf("You are not part of any standups yet. Please ask your manager to add you.")
	}

	var relevantStandups []models.Standup
	for _, st := range profile.Standups {
		if guildID == "" || st.GuildID == guildID {
			relevantStandups = append(relevantStandups, st)
		}
	}

	if len(relevantStandups) == 0 {
		return fmt.Errorf("You are not part of any standups in this specific server.")
	}

	var targetStandup models.Standup

	if standupID != 0 {
		isMember := false
		for _, st := range relevantStandups {
			if st.ID == standupID {
				targetStandup = st
				isMember = true
				break
			}
		}
		if !isMember {
			return fmt.Errorf("You are not a member of this specific standup.")
		}
	} else {
		if len(relevantStandups) == 1 {
			targetStandup = relevantStandups[0]
		} else {
			h.sendStandupSelectionMenu(s, userID, guildID, channelID, relevantStandups)
			return nil
		}
	}

	if targetStandup.ReportChannelID == "" {
		return fmt.Errorf("This standup has no report channel set.")
	}

	if profile.Timezone == "" {
		newTimezone := "UTC"

		if targetStandup.ManagerID != "" {
			var manager models.UserProfile
			if err := h.DB.Where("user_id = ?", targetStandup.ManagerID).First(&manager).Error; err == nil {
				if manager.Timezone != "" {
					newTimezone = manager.Timezone
				}
			}
		}

		profile.Timezone = newTimezone
		h.DB.Save(&profile)
	}

	showTZWarning := profile.Timezone == "UTC"

	h.startQuestionFlow(s, targetChannelID, userID, targetStandup, showTZWarning)
	return nil
}

func (h *StandupHandler) startQuestionFlow(session *discordgo.Session,
	channelID, userID string, standup models.Standup, showTZWarning bool) {

	state := models.StandupState{
		UserID:    userID,
		GuildID:   standup.GuildID,
		StandupID: standup.ID,
		Answers:   []string{},
	}

	redisKey := fmt.Sprintf("%s_%d", userID, standup.ID)
	store.SaveState(h.Redis, redisKey, state)

	msgContent := "Ready to submit your daily standup?"
	if showTZWarning {
		msgContent += "\n\nℹ️ *Note: Daily reminders are scheduled in UTC. Use `/timezone` to change.*"
	}

	session.ChannelMessageSendComplex(channelID, &discordgo.MessageSend{
		Content: msgContent,
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "Fill Standup",
						Style:    discordgo.PrimaryButton,
						CustomID: fmt.Sprintf("open_standup_modal_%d", standup.ID),
					},
					discordgo.Button{
						Label:    "⏭️ Skip Today",
						Style:    discordgo.SecondaryButton,
						CustomID: fmt.Sprintf("skip_standup_%d", standup.ID),
					},
				},
			},
		},
	})
}

func (h *StandupHandler) openSingleAnswerModal(session *discordgo.Session,
	intr *discordgo.InteractionCreate, standupIDStr string, qIndex int) {
	var standupID uint
	fmt.Sscanf(standupIDStr, "%d", &standupID)

	var standup models.Standup
	if err := h.DB.First(&standup, standupID).Error; err != nil {
		log.Println("Error fetching standup for modal:", err)
		return
	}

	if qIndex >= len(standup.Questions) {
		log.Printf("Question index %d out of bounds for standup %d", qIndex, standup.ID)
		return
	}

	if qIndex == 0 {
		state := models.StandupState{
			UserID:    intr.User.ID,
			GuildID:   standup.GuildID,
			StandupID: standup.ID,
			Answers:   []string{},
		}
		redisKey := fmt.Sprintf("%s_%d", intr.User.ID, standup.ID)
		store.SaveState(h.Redis, redisKey, state)
	}

	questionText := standup.Questions[qIndex]

	label := questionText
	if len(label) > 45 {
		label = label[:42] + "..."
	}

	placeholder := questionText
	if len(placeholder) > 100 {
		placeholder = placeholder[:97] + "..."
	}

	err := session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: fmt.Sprintf("standup_answer_modal_%d_%d", standup.ID, qIndex),
			Title:    fmt.Sprintf("%s (%d/%d)", standup.Name, qIndex+1, len(standup.Questions)),
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:    "answer_text",
							Label:       label,
							Style:       discordgo.TextInputParagraph,
							Required:    true,
							Placeholder: placeholder,
						},
					},
				},
			},
		},
	})

	if err != nil {
		log.Println("Error opening answer modal:", err)
	}
}

func (h *StandupHandler) handleSingleAnswerSubmit(session *discordgo.Session,
	intr *discordgo.InteractionCreate, standupID uint, qIndex int) {
	answer := intr.ModalSubmitData().
		Components[0].(*discordgo.ActionsRow).
		Components[0].(*discordgo.TextInput).Value

	redisKey := fmt.Sprintf("%s_%d", intr.User.ID, standupID)
	state, err := store.GetState(h.Redis, redisKey)
	if err != nil {
		session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content:    "❌ Session expired. Please run `/start` to try again.",
				Components: []discordgo.MessageComponent{},
			},
		})
		return
	}

	state.Answers = append(state.Answers, strings.TrimSpace(answer))
	store.SaveState(h.Redis, redisKey, *state)

	var standup models.Standup
	h.DB.First(&standup, standupID)

	nextQIndex := qIndex + 1

	if nextQIndex < len(standup.Questions) {
		session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseUpdateMessage,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("✅ **Question %d answered!**\n\nReady for question %d?",
					qIndex+1, nextQIndex+1),
				Components: []discordgo.MessageComponent{
					discordgo.ActionsRow{
						Components: []discordgo.MessageComponent{
							discordgo.Button{
								Label:    fmt.Sprintf("Next: Question %d", nextQIndex+1),
								Style:    discordgo.PrimaryButton,
								CustomID: fmt.Sprintf("continue_standup_%d_%d", standup.ID, nextQIndex),
							},
						},
					},
				},
			},
		})
		return
	}

	session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseUpdateMessage,
		Data: &discordgo.InteractionResponseData{
			Content:    "✅ **Standup complete!** Your team has been notified.",
			Components: []discordgo.MessageComponent{},
		},
	})

	h.finalizeStandup(session, state)
	h.Redis.Del(context.Background(), "state:"+redisKey)
}

func (h *StandupHandler) sendThreadedReport(session *discordgo.Session, standupID uint, channelID,
	standupName, userID string, embed *discordgo.MessageEmbed) {

	ctx := context.Background()
	today := time.Now().UTC().Format("2006-01-02")
	redisKey := fmt.Sprintf("standup_thread:%d:%s", standupID, today)

	var threadID string

	cachedThread, err := h.Redis.Get(ctx, redisKey).Result()
	switch err {
	case redis.Nil:
		headerText := fmt.Sprintf("📅 **%s** Standup Reports - %s", standupName,
			time.Now().UTC().Format("Monday, Jan 2"))

		headerMsg, err := session.ChannelMessageSend(channelID, headerText)
		if err == nil {
			safeName := standupName
			if len(safeName) > 50 {
				safeName = safeName[:47] + "..."
			}
			threadName := fmt.Sprintf("%s - %s", safeName, time.Now().UTC().Format("Jan 2"))

			thread, err := session.MessageThreadStart(channelID, headerMsg.ID, threadName, 1440)
			if err == nil {
				threadID = thread.ID
				h.Redis.Set(ctx, redisKey, threadID, 24*time.Hour)
			} else {
				log.Printf("Failed to create thread: %v", err)
			}
		}
	case nil:
		threadID = cachedThread
	}

	msgSend := &discordgo.MessageSend{
		Content: fmt.Sprintf("<@%s>", userID),
		Embeds:  []*discordgo.MessageEmbed{embed},
	}

	if threadID != "" {
		_, err = session.ChannelMessageSendComplex(threadID, msgSend)
		if err != nil {
			session.ChannelMessageSendComplex(channelID, msgSend)
		}
	} else {
		session.ChannelMessageSendComplex(channelID, msgSend)
	}
}

func (h *StandupHandler) handleSkipStandup(session *discordgo.Session,
	intr *discordgo.InteractionCreate, standupID uint) {
	userID := utils.ExtractUserID(intr)

	var standup models.Standup
	if err := h.DB.First(&standup, standupID).Error; err != nil {
		utils.UpdateMessage(session, intr, "❌ Standup not found. It may have been deleted.", nil)
		return
	}

	userProfile, userName, avatarURL := h.syncDiscordProfile(session, userID)

	localToday := utils.GetUserLocalTime(userProfile.Timezone).Format("2006-01-02")

	history := models.StandupHistory{
		UserID:    userID,
		StandupID: standupID,
		Date:      localToday,
		Answers:   []string{"Skipped / OOO"},
	}
	h.DB.Create(&history)

	embed := &discordgo.MessageEmbed{
		Author: &discordgo.MessageEmbedAuthor{
			Name:    fmt.Sprintf("%s's Standup", userName),
			IconURL: avatarURL,
		},
		Title:       fmt.Sprintf("⏭️ %s Update (Skipped)", standup.Name),
		Description: fmt.Sprintf("<@%s> skipped their standup today.", userID),
		Color:       0x808080,
		Timestamp:   time.Now().Format(time.RFC3339),
	}

	h.sendThreadedReport(session, standup.ID, standup.ReportChannelID, standup.Name, userID, embed)

	utils.UpdateMessage(session, intr,
		"✅ You have successfully skipped today's standup. Your team has been notified!", nil)
}

func (h *StandupHandler) finalizeStandup(s *discordgo.Session, state *models.StandupState) {
	var standup models.Standup
	result := h.DB.First(&standup, state.StandupID)

	if result.Error != nil || standup.ReportChannelID == "" {
		log.Printf("Could not find standup config for ID %d", state.StandupID)
		return
	}

	userProfile, userName, avatarURL := h.syncDiscordProfile(s, state.UserID)

	localToday := utils.GetUserLocalTime(userProfile.Timezone).Format("2006-01-02")

	history := models.StandupHistory{
		UserID:    state.UserID,
		StandupID: state.StandupID,
		Date:      localToday,
		Answers:   state.Answers,
	}

	if err := h.DB.Create(&history).Error; err != nil {
		log.Println("❌ Error saving standup history to database:", err)
	}

	var fields []*discordgo.MessageEmbedField
	for i, answer := range state.Answers {
		questionText := "Update"
		if i < len(standup.Questions) {
			questionText = standup.Questions[i]
		}
		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   questionText,
			Value:  "👉 " + answer,
			Inline: false,
		})
	}

	embed := &discordgo.MessageEmbed{
		Author: &discordgo.MessageEmbedAuthor{
			Name:    fmt.Sprintf("%s's Standup", userName),
			IconURL: avatarURL,
		},
		Title:       fmt.Sprintf("🚀 %s Update", standup.Name),
		Description: fmt.Sprintf("Progress report from **%s**", userName),
		Color:       0x5865F2,
		Fields:      fields,
		Timestamp:   time.Now().Format(time.RFC3339),
	}

	h.sendThreadedReport(s, standup.ID, standup.ReportChannelID, standup.Name, state.UserID, embed)
}

func (h *StandupHandler) sendStandupSelectionMenu(s *discordgo.Session,
	userID, guildID, channelID string, standups []models.Standup) {

	targetChannelID := channelID
	dm, err := s.UserChannelCreate(userID)
	if err == nil {
		targetChannelID = dm.ID
	} else {
		if channelID != "" {
			s.ChannelMessageSend(channelID,
				fmt.Sprintf("⚠️ <@%s>, I cannot DM you. Please enable DMs to use AsyncFlow.", userID))
		}
		return
	}

	var options []discordgo.SelectMenuOption
	for _, st := range standups {
		if guildID != "" && st.GuildID != guildID {
			continue
		}

		options = append(options, discordgo.SelectMenuOption{
			Label:       st.Name,
			Value:       fmt.Sprintf("%d", st.ID),
			Description: fmt.Sprintf("ID: %d", st.ID),
		})
	}

	if len(options) == 0 {
		s.ChannelMessageSend(targetChannelID, "⛔ You are not part of any standups in this specific server.")
		return
	}

	s.ChannelMessageSendComplex(targetChannelID, &discordgo.MessageSend{
		Content: "Found multiple standups. Please select one:",
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.SelectMenu{
						CustomID:    "select_standup_join",
						Placeholder: "Choose a standup to join...",
						Options:     options,
					},
				},
			},
		},
	})
}

func (h *StandupHandler) handleStandupSelection(session *discordgo.Session,
	intr *discordgo.InteractionCreate) {

	userID := utils.ExtractUserID(intr)

	if len(intr.MessageComponentData().Values) == 0 {
		return
	}
	selectedID := intr.MessageComponentData().Values[0]

	var standup models.Standup
	h.DB.First(&standup, selectedID)

	var user models.UserProfile
	if err := h.DB.Preload("Standups").Where("user_id = ?", userID).First(&user).Error; err != nil {
		log.Println("Error finding user:", err)
		return
	}

	h.DB.Model(&user).Association("Standups").Append(&standup)

	utils.UpdateMessage(session, intr,
		fmt.Sprintf("✅ You joined **%s**!",
			standup.Name), nil)

	h.InitiateStandup(session, userID, standup.GuildID, intr.ChannelID, standup.ID)
}
