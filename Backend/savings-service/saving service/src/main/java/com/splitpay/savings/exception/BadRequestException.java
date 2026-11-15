package com.splitpay.savings.exception;

import org.springframework.http.HttpStatus;

/**
 * Requete invalide (400).
 */
public class BadRequestException extends ApiException {

    public BadRequestException(ErrorCode code, String message) {
        super(code, HttpStatus.BAD_REQUEST, message);
    }

    public static BadRequestException invalidAmount(String message) {
        return new BadRequestException(ErrorCode.INVALID_AMOUNT, message);
    }

    public static BadRequestException invalidSortField(String message) {
        return new BadRequestException(ErrorCode.INVALID_SORT_FIELD, message);
    }
}
