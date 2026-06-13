package errors

import "net/http"

type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Err     error  `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *AppError) Unwrap() error { return e.Err }

// Predefined application errors
var (
	ErrNotFound        = &AppError{Code: http.StatusNotFound, Message: "Resource not found"}
	ErrUnauthorized    = &AppError{Code: http.StatusUnauthorized, Message: "Unauthorized"}
	ErrForbidden       = &AppError{Code: http.StatusForbidden, Message: "Forbidden"}
	ErrConflict        = &AppError{Code: http.StatusConflict, Message: "Conflict"}
	ErrValidation      = &AppError{Code: http.StatusUnprocessableEntity, Message: "Validation failed"}
	ErrInternal        = &AppError{Code: http.StatusInternalServerError, Message: "Internal server error"}
	ErrBadRequest      = &AppError{Code: http.StatusBadRequest, Message: "Bad request"}
	ErrTooManyRequests = &AppError{Code: http.StatusTooManyRequests, Message: "Too many requests"}
	ErrDuplicate       = &AppError{Code: http.StatusConflict, Message: "Duplicate entry"}
)

func NewAppError(code int, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

func Wrap(err error, message string) *AppError {
	if appErr, ok := err.(*AppError); ok {
		return &AppError{Code: appErr.Code, Message: message, Err: appErr}
	}
	return &AppError{Code: http.StatusInternalServerError, Message: message, Err: err}
}

func IsAppError(err error) bool {
	_, ok := err.(*AppError)
	return ok
}

func GetCode(err error) int {
	if appErr, ok := err.(*AppError); ok {
		return appErr.Code
	}
	return http.StatusInternalServerError
}