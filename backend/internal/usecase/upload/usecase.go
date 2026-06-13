package upload

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"

	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type S3Client interface {
	PutObject(ctx context.Context, bucketName string, objectName string, reader interface{}, objectSize int64, opts minio.PutObjectOptions) (minio.UploadInfo, error)
}

type UseCase struct {
	s3     *minio.Client
	bucket string
}

func NewUseCase(s3 *minio.Client, bucket string) *UseCase {
	return &UseCase{
		s3:     s3,
		bucket: bucket,
	}
}

func (uc *UseCase) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader) (string, error) {
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !isAllowedExt(ext) {
		return "", apperrors.NewAppError(400, "File type not allowed. Allowed: jpg, jpeg, png, gif, webp, mp4, mov")
	}

	if header.Size > 50*1024*1024 {
		return "", apperrors.NewAppError(400, "File too large. Max 50MB")
	}

	objectName := fmt.Sprintf("%s/%s%s", time.Now().Format("2006/01/02"), uuid.New().String(), ext)
	contentType := getContentType(ext)

	_, err := uc.s3.PutObject(ctx, uc.bucket, objectName, file, header.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", apperrors.Wrap(err, "Failed to upload file")
	}

	url := fmt.Sprintf("/media/%s", objectName)
	return url, nil
}

func isAllowedExt(ext string) bool {
	allowed := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
		".webp": true, ".mp4": true, ".mov": true,
	}
	return allowed[ext]
}

func getContentType(ext string) string {
	types := map[string]string{
		".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
		".gif": "image/gif", ".webp": "image/webp",
		".mp4": "video/mp4", ".mov": "video/quicktime",
	}
	if ct, ok := types[ext]; ok {
		return ct
	}
	return "application/octet-stream"
}