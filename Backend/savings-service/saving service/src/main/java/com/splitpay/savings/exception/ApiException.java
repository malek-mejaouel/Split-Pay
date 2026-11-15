package com.splitpay.savings.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Exception de base de l'API : porte un code metier et un statut HTTP.
 */
@Getter
public class ApiException extends RuntimeException {

    private final ErrorCode code;
    private final HttpStatus status;

    public ApiException(ErrorCode code, String message) {
        this(code, code.defaultStatus(), message);
    }

    public ApiException(ErrorCode code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }
}
