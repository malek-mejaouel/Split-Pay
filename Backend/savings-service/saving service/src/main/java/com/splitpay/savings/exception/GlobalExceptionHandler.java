package com.splitpay.savings.exception;

import com.splitpay.savings.dto.error.ErrorResponse;
import com.splitpay.savings.dto.error.FieldValidationError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Gestion centralisee des erreurs : un format unique pour toute l'API.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /* ===================== 400 ===================== */

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBodyValidation(MethodArgumentNotValidException ex,
                                                              HttpServletRequest request) {
        List<FieldValidationError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldValidationError(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "La requete contient des champs invalides.", request, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
                                                                   HttpServletRequest request) {
        List<FieldValidationError> errors = ex.getConstraintViolations().stream()
                .map(cv -> new FieldValidationError(lastNode(cv.getPropertyPath().toString()), cv.getMessage()))
                .toList();
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Un ou plusieurs parametres de la requete sont invalides.", request, errors);
    }

    /** Validation native des parametres de methode de controller (Spring MVC 6.1+). */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleHandlerMethodValidation(HandlerMethodValidationException ex,
                                                                      HttpServletRequest request) {
        List<FieldValidationError> errors = ex.getAllValidationResults().stream()
                .flatMap(result -> {
                    String field = result.getMethodParameter().getParameterName();
                    return result.getResolvableErrors().stream()
                            .map(error -> new FieldValidationError(field, error.getDefaultMessage()));
                })
                .toList();
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Un ou plusieurs parametres de la requete sont invalides.", request, errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex,
                                                          HttpServletRequest request) {
        log.debug("Corps de requete illisible : {}", ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST,
                "Le corps de la requete est mal forme (JSON invalide, date ou type illisible).", request, List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                            HttpServletRequest request) {
        String name = ex.getName();
        Class<?> requiredType = ex.getRequiredType();
        String message;
        if (requiredType != null && requiredType.isEnum()) {
            message = "Valeur invalide pour le parametre '" + name + "'. Valeurs acceptees : "
                    + acceptedValues(requiredType) + ".";
        } else {
            message = "Valeur invalide pour le parametre '" + name + "' (format attendu : "
                    + (requiredType == null ? "inconnu" : requiredType.getSimpleName()) + ").";
        }
        return build(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_ARGUMENT, message, request, List.of());
    }

    /* ===================== 401 / 404 / 409 ===================== */

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
        return build(ex.getStatus(), ex.getCode(), ex.getMessage(), request, List.of());
    }

    /**
     * Violation d'une contrainte d'unicite (user_id, source_event_id) : conflit metier.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex,
                                                             HttpServletRequest request) {
        log.warn("Violation de contrainte en base : {}", ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT, ErrorCode.DATA_CONFLICT,
                "La ressource entre en conflit avec une ressource existante.", request, List.of());
    }

    /* ===================== 500 ===================== */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Erreur inattendue", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR,
                "Une erreur interne est survenue.", request, List.of());
    }

    /* ===================== Helpers ===================== */

    private ResponseEntity<ErrorResponse> build(HttpStatus status, ErrorCode code, String message,
                                                HttpServletRequest request, List<FieldValidationError> errors) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(status, code, message, request.getRequestURI(), errors));
    }

    private static String lastNode(String propertyPath) {
        int index = propertyPath.lastIndexOf('.');
        return index < 0 ? propertyPath : propertyPath.substring(index + 1);
    }

    private static String acceptedValues(Class<?> enumType) {
        Object[] constants = enumType.getEnumConstants();
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < constants.length; i++) {
            if (i > 0) {
                builder.append(", ");
            }
            builder.append(constants[i]);
        }
        return builder.toString();
    }
}
