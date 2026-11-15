package com.splitpay.savings.security;

import com.splitpay.savings.exception.UnauthorizedException;
import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Extraction de l'identifiant utilisateur depuis le JWT : le userId vient TOUJOURS du claim `sub`.
 */
@Component
public class CurrentUserProvider {

    public UUID userId(Jwt jwt) {
        if (jwt == null) {
            throw new UnauthorizedException("Authentification requise : jeton JWT absent.");
        }
        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new UnauthorizedException("Le jeton JWT ne contient pas de claim 'sub'.");
        }
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("Le claim 'sub' du jeton n'est pas un UUID valide.");
        }
    }
}
