package com.splitpay.savings.exception;

import org.springframework.http.HttpStatus;

/**
 * Conflit metier (409).
 */
public class ConflictException extends ApiException {

    public ConflictException(ErrorCode code, String message) {
        super(code, HttpStatus.CONFLICT, message);
    }
}
