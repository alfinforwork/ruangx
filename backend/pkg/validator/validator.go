package validator

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
	validate.RegisterValidation("uuid", validateUUID)
}

func validateUUID(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	if value == "" {
		return true
	}
	// Basic UUID validation: 8-4-4-4-12 pattern
	if len(value) != 36 {
		return false
	}
	parts := strings.Split(value, "-")
	if len(parts) != 5 {
		return false
	}
	for _, p := range parts {
		if len(p) == 0 {
			return false
		}
		for _, c := range p {
			if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
				return false
			}
		}
	}
	return true
}

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func Validate(i interface{}) []ValidationError {
	var errs []ValidationError

	err := validate.Struct(i)
	if err == nil {
		return nil
	}

	for _, verr := range err.(validator.ValidationErrors) {
		field := toSnakeCase(verr.Field())
		message := getErrorMessage(verr)
		errs = append(errs, ValidationError{
			Field:   field,
			Message: message,
		})
	}

	return errs
}

func toSnakeCase(s string) string {
	var result strings.Builder
	for i, c := range s {
		if c >= 'A' && c <= 'Z' {
			if i > 0 {
				result.WriteRune('_')
			}
			result.WriteRune(c + 32) // to lowercase
		} else {
			result.WriteRune(c)
		}
	}
	return result.String()
}

func getErrorMessage(fe validator.FieldError) string {
	fieldName := toSnakeCase(fe.Field())

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s wajib diisi", fieldName)
	case "email":
		return fmt.Sprintf("%s harus berupa email yang valid", fieldName)
	case "min":
		return fmt.Sprintf("%s minimal %s karakter", fieldName, fe.Param())
	case "max":
		return fmt.Sprintf("%s maksimal %s karakter", fieldName, fe.Param())
	case "len":
		return fmt.Sprintf("%s harus %s karakter", fieldName, fe.Param())
	case "uuid":
		return fmt.Sprintf("%s harus berupa UUID yang valid", fieldName)
	case "alphanum":
		return fmt.Sprintf("%s hanya boleh berisi huruf dan angka", fieldName)
	case "oneof":
		return fmt.Sprintf("%s harus salah satu dari: %s", fieldName, fe.Param())
	case "gte":
		return fmt.Sprintf("%s harus lebih besar atau sama dengan %s", fieldName, fe.Param())
	case "lte":
		return fmt.Sprintf("%s harus lebih kecil atau sama dengan %s", fieldName, fe.Param())
	default:
		return fmt.Sprintf("%s tidak valid", fieldName)
	}
}