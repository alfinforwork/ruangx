FROM golang:latest AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go mod tidy && CGO_ENABLED=0 go build -o /server ./cmd

FROM alpine:3.20
COPY --from=builder /server /server
EXPOSE ${PORT:-8080}
CMD ["/server"]
