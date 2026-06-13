package s3

import (
	"context"
	"fmt"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/rs/zerolog/log"
)

type S3Client struct {
	Client *minio.Client
	Bucket string
}

func New(endpoint, accessKey, secretKey, bucket, region string, useSSL bool) (*S3Client, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
		Region: region,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	log.Info().Str("endpoint", endpoint).Str("bucket", bucket).Msg("S3/MinIO client initialized")

	return &S3Client{
		Client: client,
		Bucket: bucket,
	}, nil
}

func (s *S3Client) EnsureBucket(ctx context.Context) error {
	exists, err := s.Client.BucketExists(ctx, s.Bucket)
	if err != nil {
		return fmt.Errorf("failed to check bucket: %w", err)
	}

	if !exists {
		err = s.Client.MakeBucket(ctx, s.Bucket, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}
		log.Info().Str("bucket", s.Bucket).Msg("S3 bucket created")
	}

	return nil
}