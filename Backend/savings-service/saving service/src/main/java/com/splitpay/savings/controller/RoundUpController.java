package com.splitpay.savings.controller;

import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.dto.RoundUpResponse;
import com.splitpay.savings.dto.error.ErrorResponse;
import com.splitpay.savings.entity.RoundUpStatus;
import com.splitpay.savings.security.CurrentUserProvider;
import com.splitpay.savings.service.RoundUpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Historique des arrondis (lecture seule : les arrondis sont crees par le traitement d'evenement).
 */
@RestController
@RequestMapping("/api/savings/me/roundups")
@Validated
@RequiredArgsConstructor
@Tag(name = "Arrondis", description = "Historique des arrondis d'epargne (lecture seule)")
@SecurityRequirement(name = "bearerAuth")
public class RoundUpController {

    private final RoundUpService roundUpService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    @Operation(summary = "Historique des arrondis (pagine)",
            description = "Champs de tri autorises : createdAt, savedAmount, originalAmount, status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste paginee"),
            @ApiResponse(responseCode = "400", description = "Parametres invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PageResponse<RoundUpResponse>> listRoundUps(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Filtre de statut") @RequestParam(required = false) RoundUpStatus status,
            @Parameter(description = "Numero de page (0..n)") @RequestParam(defaultValue = "0") @Min(value = 0, message = "Le numero de page doit etre superieur ou egal a 0.") int page,
            @Parameter(description = "Taille de page (1..100)") @RequestParam(defaultValue = "20") @Min(value = 1, message = "La taille de page doit etre superieure ou egale a 1.") @Max(value = 100, message = "La taille de page ne peut pas depasser 100.") int size,
            @Parameter(description = "Champ de tri") @RequestParam(required = false) String sort,
            @Parameter(description = "Direction de tri (asc/desc)") @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(roundUpService.listRoundUps(currentUserProvider.userId(jwt), status, page, size, sort, direction));
    }
}
