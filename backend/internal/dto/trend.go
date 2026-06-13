package dto

type TrendResponse struct {
	ID        string  `json:"id"`
	TrendType string  `json:"trend_type"`
	Name      string  `json:"name"`
	PostCount int     `json:"post_count"`
	Score     float64 `json:"score"`
	Category  string  `json:"category"`
	Region    string  `json:"region"`
}