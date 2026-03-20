package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/Gurkunwar/asyncflow/internal/api"
	"github.com/Gurkunwar/asyncflow/internal/bot"
	"github.com/Gurkunwar/asyncflow/internal/bot/standup"
	"github.com/Gurkunwar/asyncflow/internal/database"
	"github.com/Gurkunwar/asyncflow/internal/services"
	"github.com/Gurkunwar/asyncflow/internal/store"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("❌ Failed to connect to Database: %v", err)
	}

	rdb, err := store.InitRedis()
	if err != nil {
		log.Fatalf("❌ Failed to connect to Redis: %v", err)
	}

	dg, err := bot.NewSession()
	if err != nil {
		log.Fatalf("❌ Failed to create Discord session: %v", err)
	}

	standupSvc := &services.StandupService{
		DB:      db,
		Session: dg,
	}
	userSvc := &services.UserService{DB: db}
	pollSvc := services.NewPollService(db, dg)

	apiServer := api.NewServer(db, dg, standupSvc, pollSvc)
	handler := bot.NewBotHandler(dg, rdb, db, standupSvc, pollSvc, userSvc, api.NewHub().Broadcast)

	standupSvc.TriggerFunc = handler.Standups.InitiateStandup

	dg.AddHandler(handler.OnInteraction)
	dg.AddHandler(handler.Polls.OnVoteAdd)
    dg.AddHandler(handler.Polls.OnVoteRemove)
	dg.AddHandler(handler.HandleGuildCreate)

	standupSvc.StartTimezoneWorker()
	standup.InitCronScheduler(standupSvc)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	go apiServer.Start(":" + port)

	if err := dg.Open(); err != nil {
		log.Fatal(err)
	}

	bot.RegisterCommands(dg)

	log.Println("AsyncFlow is live!")
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-stop
}
