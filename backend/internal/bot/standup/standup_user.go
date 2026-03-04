package standup

import (
	"fmt"
	// "log"
	"time"

	"github.com/Gurkunwar/asyncflow/internal/bot/utils"
	"github.com/Gurkunwar/asyncflow/internal/models"

	// "github.com/Gurkunwar/asyncflow/internal/store"
	"github.com/bwmarrin/discordgo"
)

func (h *StandupHandler) handleHistory(session *discordgo.Session, intr *discordgo.InteractionCreate) {
	options := intr.ApplicationCommandData().Options
	targetUser := options[0].UserValue(session)
	standupName := options[1].StringValue()
	days := 5

	if len(options) > 2 {
		days = int(options[2].IntValue())
		if days > 10 {
			days = 10
		}
	}

	callerID := utils.ExtractUserID(intr)

	var standup models.Standup
	if err := h.DB.
		Where("guild_id = ? and name = ?", intr.GuildID, standupName).
		First(&standup).
		Error; err != nil {
		session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("❌ Standup named **%s** not found.", standupName),
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}

	if standup.ManagerID != callerID && targetUser.ID != callerID {
		session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "⛔ You can only view your own history, or history for teams you manage.",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}

	cutoffDate := time.Now().AddDate(0, 0, -days).Format("2006-01-02")
	var histories []models.StandupHistory

	h.DB.Where("user_id = ? AND standup_id = ? AND date >= ?", targetUser.ID, standup.ID, cutoffDate).
		Order("date desc").
		Limit(10).
		Find(&histories)

	if len(histories) == 0 {
		session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("📭 No standup history found for <@%s> in **%s** over the last %d days.",
					targetUser.ID, standup.Name, days),
				Flags: discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}

	var embeds []*discordgo.MessageEmbed
	for _, hist := range histories {
		var fields []*discordgo.MessageEmbedField

		for i, answer := range hist.Answers {
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

		embeds = append(embeds, &discordgo.MessageEmbed{
			Title:  fmt.Sprintf("📅 Report from %s", hist.Date),
			Color:  0x5865F2,
			Fields: fields,
		})
	}

	session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: fmt.Sprintf("📜 **Standup History for <@%s> in %s**", targetUser.ID, standup.Name),
			Embeds:  embeds,
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}
