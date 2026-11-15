package com.splitpay.savings.dto.error;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FieldValidationError", description = "Detail d'une erreur de validation")
public record FieldValidationError(String field, String message) {
}
