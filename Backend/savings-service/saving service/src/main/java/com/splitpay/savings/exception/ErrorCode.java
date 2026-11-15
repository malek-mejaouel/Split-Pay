package com.splitpay.savings.exception;

import org.springframework.http.HttpStatus;

/**
 * Codes d'erreur exposes par l'API (champ `code` du format d'erreur unique).
 */
public enum ErrorCode {

    VALIDATION_ERROR,
    INVALID_ARGUMENT,
    INVALID_SORT_FIELD,
    MALFORMED_REQUEST,
    UNAUTHORIZED,
    RESOURCE_NOT_FOUND,
    GOAL_NOT_EDITABLE,
    GOAL_NAME_DUPLICATE,
    GOAL_LIMIT_REACHED,
    TARGET_BELOW_CURRENT,
    INVALID_AMOUNT,
    DATA_CONFLICT,
    INTERNAL_ERROR;

    public HttpStatus defaultStatus() {
        return switch (this) {
            case RESOURCE_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
            case GOAL_NOT_EDITABLE, GOAL_NAME_DUPLICATE, GOAL_LIMIT_REACHED, DATA_CONFLICT -> HttpStatus.CONFLICT;
            case INTERNAL_ERROR -> HttpStatus.INTERNAL_SERVER_ERROR;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}
