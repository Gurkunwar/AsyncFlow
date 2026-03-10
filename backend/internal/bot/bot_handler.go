package bot

import (
	"log"
	"os"

	"github.com/Gurkunwar/asyncflow/internal/bot/poll"
	"github.com/Gurkunwar/asyncflow/internal/bot/standup"
	"github.com/Gurkunwar/asyncflow/internal/models"
	"github.com/Gurkunwar/asyncflow/internal/services"
	"github.com/bwmarrin/discordgo"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type BotHanlder struct {
	Session        *discordgo.Session
	Redis          *redis.Client
	DB             *gorm.DB
	StandupService *services.StandupService
	UserService    *services.UserService
	Standups       *standup.StandupHandler
	Polls          *poll.PollHandler
}

func NewBotHandler(session *discordgo.Session,
	redis *redis.Client,
	db *gorm.DB,
	standupService *services.StandupService,
	pollService *services.PollService,
	userService *services.UserService,
	wsBroadcast chan []byte) *BotHanlder {

	standupHandler := standup.NewStandupHandler(db, redis, standupService)
	pollhandler := poll.NewPollHandler(db, redis, pollService)

	return &BotHanlder{
		Session:        session,
		Redis:          redis,
		DB:             db,
		StandupService: standupService,
		UserService:    userService,
		Standups:       standupHandler,
		Polls:          pollhandler,
	}
}

func (h *BotHanlder) OnInteraction(session *discordgo.Session, intr *discordgo.InteractionCreate) {
	if h.Standups.StandupRouter(session, intr) {
		return
	}

	if h.Polls.PollRouter(session, intr) {
		return
	}

	switch intr.Type {
	case discordgo.InteractionApplicationCommand:
		switch intr.ApplicationCommandData().Name {
		case "help":
			h.handleHelp(session, intr)
		case "timezone":
			h.sendTimezoneMenu(session, intr, 0)
		case "delete-my-data":
			h.handleDeleteMyData(session, intr)
		}
	case discordgo.InteractionMessageComponent:
		if intr.MessageComponentData().CustomID == "select_tz" {
			h.handleTimezoneSelection(session, intr)
		}
	}
}

func NewSession() (*discordgo.Session, error) {
	dg, err := discordgo.New("Bot " + os.Getenv("DISCORD_BOT_TOKEN"))

	if err != nil {
		return nil, err
	}

	dg.Identify.Intents = discordgo.IntentsGuilds |
		discordgo.IntentsGuildMessages |
		discordgo.IntentDirectMessages |
		discordgo.IntentGuildMessagePolls
	return dg, nil
}

func RegisterCommands(dg *discordgo.Session) {
	log.Println("Registering bot commands...")
	for _, command := range Commands {
		_, err := dg.ApplicationCommandCreate(dg.State.User.ID, "", command)
		if err != nil {
			log.Printf("Cannot create '%v' command: %v", command.Name, err)
		}
	}
}

func (h *BotHanlder) HandleGuildCreate(session *discordgo.Session, guildCreate *discordgo.GuildCreate) {
	if guildCreate.Guild.Unavailable {
		return
	}

	var count int64
	h.DB.Model(&models.Guild{}).Where("guild_id = ?", guildCreate.Guild.ID).Count(&count)

	if count > 0 {
		return
	}

	h.DB.Create(&models.Guild{GuildID: guildCreate.Guild.ID})

	var targetChannelID string
	if guildCreate.Guild.SystemChannelID != "" {
		targetChannelID = guildCreate.Guild.SystemChannelID
	} else {
		for _, channel := range guildCreate.Guild.Channels {
			if channel.Type == discordgo.ChannelTypeGuildText {
				targetChannelID = channel.ID
				break
			}
		}
	}

	if targetChannelID == "" {
		return
	}

	embed := &discordgo.MessageEmbed{
		Title: "👋 Hey there! I'm AsyncFlow",
		Description: "Thanks for inviting me! I'm here to make your daily standups, weekly retros, " +
			"and team syncs completely effortless.\n\nTo get started, the server owner or an admin just needs " +
			"to head over to the web dashboard or '/' bot commands. From there, you can set up your first team, " +
			"pick a schedule, and customize your questions.",
		Color: 0x5865F2,
		Thumbnail: &discordgo.MessageEmbedThumbnail{
			URL: session.State.User.AvatarURL(""),
		},
	}

	frontendURL := "http://localhost:5173/dashboard"
	if envURL := os.Getenv("FRONTEND_URL"); envURL != "" {
		frontendURL = envURL
	}

	components := []discordgo.MessageComponent{
		discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.Button{
					Label: "🚀 Go to Dashboard",
					Style: discordgo.LinkButton,
					URL:   frontendURL,
				},
			},
		},
	}

	_, err := session.ChannelMessageSendComplex(targetChannelID, &discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: components,
	})

	if err != nil {
		log.Printf("Warning: Failed to send welcome message to guild %s: %v", guildCreate.Guild.Name, err)
	} else {
		log.Printf("🎉 Welcomed new server: %s", guildCreate.Guild.Name)
	}
}
