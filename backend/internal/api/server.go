package api

import (
	"log"
	"net/http"

	"github.com/Gurkunwar/asyncflow/internal/services"
	"github.com/bwmarrin/discordgo"
	"gorm.io/gorm"
)

type Server struct {
	DB             *gorm.DB
	Session        *discordgo.Session
	StandupService *services.StandupService
	PollService    *services.PollService
}

func NewServer(db *gorm.DB,
	session *discordgo.Session,
	standupService *services.StandupService,
	pollService *services.PollService) *Server {
		
	return &Server{DB: db, Session: session, StandupService: standupService, PollService: pollService}
}

func registerProtected(path string, handler http.HandlerFunc) {
	http.HandleFunc(path, RateLimitMiddleware(AuthMiddleware(handler)))
}

func (s *Server) Routes() {
	http.HandleFunc("/", RateLimitMiddleware(s.handleRoot))
	http.HandleFunc("/api/auth/discord", RateLimitMiddleware(HandleDiscordLogin(s.DB)))

	registerProtected("/api/dashboard/stats", s.HandleGetDashboardStats)
	registerProtected("/api/dashboard/poll-stats", s.HandleGetPollStats)
	
	registerProtected("/api/user-guilds", s.HandleGetUserGuilds)
	registerProtected("/api/guild-channels", s.HandleGetGuildChannels)
	registerProtected("/api/guild-members", s.HandleGetGuildMembers)
	registerProtected("/api/guilds/roles", s.HandleGetGuildRoles)
	
	registerProtected("/api/managed-standups", s.HandleGetManagedStandups(s.Session))
	registerProtected("/api/standups/create", s.HandleCreateStandup)
	registerProtected("/api/standups/update", s.HandleUpdateStandup)
	registerProtected("/api/standups/delete", s.HandleDeleteStandup)
	registerProtected("/api/standups/add-member", s.HandleAddStandupMember)
	registerProtected("/api/standups/remove-member", s.HandleRemoveStandupMember)
	registerProtected("/api/standups/get", s.HandleGetStandup)
	registerProtected("/api/standups/history", s.HandleGetStandupHistory)
	registerProtected("/api/standups/test", s.HandleTestRunStandup)

	registerProtected("/api/managed-polls", s.HandleGetManagedPolls)
	registerProtected("/api/polls/get", s.HandleGetPoll)
	registerProtected("/api/polls/create", s.HandleCreateWebPoll)
	registerProtected("/api/polls/delete", s.HandleDeleteWebPoll)
	registerProtected("/api/polls/end", s.HandleEndWebPoll)
	registerProtected("/api/polls/export", s.HandleExportWebPoll)
	registerProtected("/api/polls/history", s.HandleGetPollHistory)

	registerProtected("/api/user/settings/get", s.HandleGetUserSettings)
	registerProtected("/api/user/settings/update", s.HandleUpdateUserSettings)
}

func (s *Server) Start(port string) {
	s.Routes()
	log.Printf("🌐 API Server running on http://localhost%s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("HTTP server crashed: %v", err)
	}
}

func (s *Server) GetDiscordMetadata(guildID, channelID string) (string, string) {
	gName := "Unknown Server"
	if guild, err := s.Session.State.Guild(guildID); err == nil {
		gName = guild.Name
	}

	cName := "unknown-channel"
	if channel, err := s.Session.State.Channel(channelID); err == nil {
		cName = channel.Name
	}
	return gName, cName
}

func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "online", "message": "DailyBot API is running gracefully"}`))
}
