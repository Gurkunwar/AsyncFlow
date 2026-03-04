package poll

import (
	"fmt"
	"strings"

	"github.com/Gurkunwar/asyncflow/internal/bot/utils"
	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/bwmarrin/discordgo"
)

func (h *PollHandler) HandlePollEnd(session *discordgo.Session, intr *discordgo.InteractionCreate) {
	if !utils.IsServerAdmin(intr) {
		utils.RespondWithMessage(session, intr, "⛔ This command is reserved for Server Admins.", true)
		return
	}

	pollID := intr.ApplicationCommandData().Options[0].IntValue()
	var poll models.Poll
	if err := h.DB.First(&poll, pollID).Error; err != nil {
		utils.RespondWithMessage(session, intr, "❌ Poll not found in DB.", true)
		return
	}

	endpoint := discordgo.EndpointChannel(poll.ChannelID) + "/polls/" + poll.MessageID + "/expire"
	body := map[string]interface{}{}

	_, err := session.RequestWithBucketID("POST", endpoint, body, discordgo.EndpointChannelMessage(poll.ChannelID, ""))

	if err != nil {
		utils.RespondWithMessage(session, intr, fmt.Sprintf("❌ Failed to end poll. Error: %v", err), true)
		return
	}

	utils.RespondWithMessage(session, intr, "✅ **Poll has been successfully closed!**", true)
}

func (h *PollHandler) HandlePollExport(session *discordgo.Session, intr *discordgo.InteractionCreate) {
	if !utils.IsServerAdmin(intr) {
		utils.RespondWithMessage(session, intr, "⛔ Admin only.", true)
		return
	}

	pollID := intr.ApplicationCommandData().Options[0].IntValue()
	var poll models.Poll
	if err := h.DB.First(&poll, pollID).Error; err != nil {
		utils.RespondWithMessage(session, intr, "❌ Poll not found.", true)
		return
	}

	msg, err := session.ChannelMessage(poll.ChannelID, poll.MessageID)
	if err != nil || msg.Poll == nil {
		utils.RespondWithMessage(session, intr, "❌ Could not fetch poll from Discord.", true)
		return
	}

	var csvBuilder strings.Builder
	csvBuilder.WriteString("Option,User ID,Username\n")

	for _, answer := range msg.Poll.Answers {
		optionText := strings.ReplaceAll(answer.Media.Text, ",", ";")

		voters, _ := session.PollAnswerVoters(poll.ChannelID, poll.MessageID, answer.AnswerID)

		if len(voters) == 0 {
			csvBuilder.WriteString(fmt.Sprintf("%s,NONE,No votes\n", optionText))
		} else {
			for _, voter := range voters {
				csvBuilder.WriteString(fmt.Sprintf("%s,%s,%s\n", optionText, voter.ID, voter.Username))
			}
		}
	}

	file := &discordgo.File{
		Name:        fmt.Sprintf("poll_results_%d.csv", poll.ID),
		ContentType: "text/csv",
		Reader:      strings.NewReader(csvBuilder.String()),
	}

	session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "📊 **Here is your Excel/CSV Export!**",
			Files:   []*discordgo.File{file},
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}

func (h *PollHandler) handlePollList(session *discordgo.Session, intr *discordgo.InteractionCreate) {
	if !utils.IsServerAdmin(intr) {
		utils.RespondWithMessage(session, intr, "⛔ Admin only.", true)
		return
	}

	page := 1
	options := intr.ApplicationCommandData().Options
	if len(options) > 0 {
		page = int(options[0].IntValue())
		if page < 1 {
			page = 1
		}
	}

	limit := 10
	offset := (page - 1) * limit

	var recentPolls []models.Poll

	h.DB.Where("guild_id = ?", intr.GuildID).
		Order("id desc").
		Limit(limit).
		Offset(offset).
		Find(&recentPolls)

	if len(recentPolls) == 0 {
		utils.RespondWithMessage(session, intr, fmt.Sprintf("📭 No polls found on page %d.", page), true)
		return
	}

	var list strings.Builder
	list.WriteString(fmt.Sprintf("📋 **Server Polls (Page %d)**\n\n", page))

	for _, p := range recentPolls {
		qText := p.Question
		if len(qText) > 55 {
			qText = qText[:52] + "..."
		}
		list.WriteString(fmt.Sprintf("**ID: %d** | <#%s>\n> %s\n\n", p.ID, p.ChannelID, qText))
	}

	list.WriteString(fmt.Sprintf("*Use `/poll-list page: %d` to see older polls.*", page+1))

	session.InteractionRespond(intr.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: list.String(),
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}
