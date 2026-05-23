FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /server ./cmd

FROM alpine:3.20
COPY --from=builder /server /server
EXPOSE ${PORT:-8082}
CMD ["/server"]