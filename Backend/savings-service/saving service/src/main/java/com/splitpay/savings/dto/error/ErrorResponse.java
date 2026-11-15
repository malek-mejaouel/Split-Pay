package com.splitpay.savings.dto.error;

import com.splitpay.savings.exception.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;

/**
 * Format d'erreur unique de l'API :
 * { timestamp, status, error, code, message, path, errors[] }.
 */
@Schema(name = "ErrorResponse", description = "Format d'erreur unique de l'API")
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        ErrorCode code,
        String message,
        String path,
        List<FieldValidationError> errors
) {

    public static ErrorResponse of(HttpStatus status, ErrorCode code, String message, String path,
                                   List<FieldValidationError> errors) {
        return new ErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                path,
                errors == null ? List.of() : errors);
    }
}
