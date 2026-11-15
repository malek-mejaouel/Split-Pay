package com.splitpay.savings.exception;

import org.springframework.http.HttpStatus;

/**
 * Ressource inexistante ou n'appartenant pas a l'utilisateur connecte (404, jamais 403).
 */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }
}
