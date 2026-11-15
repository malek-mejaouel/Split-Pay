package com.splitpay.savings.controller;

import com.splitpay.savings.dto.SavingsAccountResponse;
import com.splitpay.savings.dto.SettingsRequest;
import com.splitpay.savings.dto.error.ErrorResponse;
import com.splitpay.savings.security.CurrentUserProvider;
import com.splitpay.savings.service.SavingsAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Compte d'epargne de l'utilisateur connecte.
 */
@RestController
@RequestMapping("/api/savings")
@Validated
@RequiredArgsConstructor
@Tag(name = "Compte d'epargne", description = "Consultation du compte et reglages de l'arrondi")
@SecurityRequirement(name = "bearerAuth")
public class SavingsAccountController {

    private final SavingsAccountService accountService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/me")
    @Operation(summary = "Mon compte d'epargne",
            description = "Retourne le compte d'epargne de l'utilisateur connecte. Le compte est cree a la demande "
                    + "(roundUpEnabled=false, roundUpStep=1.00, balance=0.00) au premier appel.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Compte retourne",
                    content = @Content(schema = @Schema(implementation = SavingsAccountResponse.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<SavingsAccountResponse> getMyAccount(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(accountService.getOrCreateAccount(currentUserProvider.userId(jwt)));
    }

    @PutMapping("/me/settings")
    @Operation(summary = "Activer l'arrondi et choisir le pas",
            description = "Pas d'arrondi autorise : 0.50, 1.00, 2.00 ou 5.00.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reglages mis a jour",
                    content = @Content(schema = @Schema(implementation = SavingsAccountResponse.class))),
            @ApiResponse(responseCode = "400", description = "Donnees invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<SavingsAccountResponse> updateSettings(@AuthenticationPrincipal Jwt jwt,
                                                                 @Valid @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(accountService.updateSettings(currentUserProvider.userId(jwt), request));
    }
}
