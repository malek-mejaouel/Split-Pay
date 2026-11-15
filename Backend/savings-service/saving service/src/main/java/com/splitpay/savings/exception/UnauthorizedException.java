package com.splitpay.savings.exception;

import org.springframework.http.HttpStatus;

/**
 * Jeton absent ou inexploitable (401).
 */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, message);
    }
}
