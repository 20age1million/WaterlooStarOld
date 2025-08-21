package storage

import (
	"WaterlooStar/backend/models"
	"sync"
)

type SectionPosts struct {
	Posts  []models.Post
	NextID int
}

var (
	Sections = map[string]*SectionPosts{
		"general": {Posts: []models.Post{}, NextID: 1},
		"tech":    {Posts: []models.Post{}, NextID: 1},
		"news":    {Posts: []models.Post{}, NextID: 1},
	}
	Mu sync.Mutex
)
