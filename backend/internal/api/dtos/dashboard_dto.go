package dtos

type BlockerDTO struct {
	ID     uint   `json:"id"`
	User   string `json:"user"`
	Avatar string `json:"avatar"`
	Team   string `json:"team"`
	Task   string `json:"task"`
}

type TeamBreakdown struct {
	TeamName string `json:"team_name"`
	Count    int64  `json:"count"`
}

type DashboardStatsDTO struct {
	TotalTeams    int64           `json:"total_teams"`
	TotalMembers  int64           `json:"total_members"`
	RecentReports int64           `json:"recent_reports"`
	WeeklyData    []int64         `json:"weekly_data"`
	BusiestDay    string          `json:"busiest_day"`
	BreakdownData []TeamBreakdown `json:"breakdown_data"`
	Blockers      []BlockerDTO    `json:"blockers"`
}