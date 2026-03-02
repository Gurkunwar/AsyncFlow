package poll

import "github.com/bwmarrin/discordgo"

func (h *PollHandler) PollRouter(session *discordgo.Session, intr *discordgo.InteractionCreate) bool {
	switch intr.Type {
	case discordgo.InteractionApplicationCommand:
		if intr.ApplicationCommandData().Name == "poll" {

			return true
		}
	case discordgo.InteractionMessageComponent:
		return false
	}

	return false
}