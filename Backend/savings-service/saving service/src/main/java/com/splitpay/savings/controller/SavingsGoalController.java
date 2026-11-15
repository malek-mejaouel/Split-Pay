package com.splitpay.savings.controller;

import com.splitpay.savings.dto.GoalCreateRequest;
import com.splitpay.savings.dto.GoalResponse;
import com.splitpay.savings.dto.GoalUpdateRequest;
import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.dto.error.ErrorResponse;
import com.splitpay.savings.entity.GoalStatus;
import com.splitpay.savings.security.CurrentUserProvider;
import com.splitpay.savings.service.SavingsGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Objectifs d'epargne (CRUD).
 */
@RestController
@RequestMapping("/api/savings/goals")
@Validated
@RequiredArgsConstructor
@Tag(name = "Objectifs d'epargne", description = "Gestion des objectifs de l'utilisateur connecte")
@SecurityRequirement(name = "bearerAuth")
public class SavingsGoalController {

    private final SavingsGoalService goalService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    @Operation(summary = "Creer un objectif",
            description = "currentAmount=0.00 et status=IN_PROGRESS. Maximum 10 objectifs en cours par compte, "
                    + "nom unique (casse ignoree) par compte.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Objectif cree",
                    content = @Content(schema = @Schema(implementation = GoalResponse.class))),
            @ApiResponse(responseCode = "400", description = "Donnees invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflit metier (nom duplique, limite atteinte)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<GoalResponse> createGoal(@AuthenticationPrincipal Jwt jwt,
                                                   @Valid @RequestBody GoalCreateRequest request) {
        GoalResponse created = goalService.createGoal(currentUserProvider.userId(jwt), request);
        return ResponseEntity.created(URI.create("/api/savings/goals/" + created.id())).body(created);
    }

    @GetMapping
    @Operation(summary = "Lister mes objectifs (pagine)",
            description = "Sans filtre de statut, les objectifs CANCELLED sont exclus. "
                    + "Champs de tri autorises : deadline, targetAmount, status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste paginee"),
            @ApiResponse(responseCode = "400", description = "Parametres invalides",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PageResponse<GoalResponse>> listGoals(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Filtre de statut") @RequestParam(required = false) GoalStatus status,
            @Parameter(description = "Numero de page (0..n)") @RequestParam(defaultValue = "0") @Min(value = 0, message = "Le numero de page doit etre superieur ou egal a 0.") int page,
            @Parameter(description = "Taille de page (1..100)") @RequestParam(defaultValue = "20") @Min(value = 1, message = "La taille de page doit etre superieure ou egale a 1.") @Max(value = 100, message = "La taille de page ne peut pas depasser 100.") int size,
            @Parameter(description = "Champ de tri") @RequestParam(required = false) String sort,
            @Parameter(description = "Direction de tri (asc/desc)") @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(goalService.listGoals(currentUserProvider.userId(jwt), status, page, size, sort, direction));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail d'un objectif")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Objectif retourne",
                    content = @Content(schema = @Schema(implementation = GoalResponse.class))),
            @ApiResponse(responseCode = "400", description = "Identifiant invalide",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Objectif inexistant ou appartenant a un autre utilisateur",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<GoalResponse> getGoal(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return ResponseEntity.ok(goalService.getGoal(currentUserProvider.userId(jwt), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un objectif",
            description = "Objectif modifiable uniquement au statut IN_PROGRESS et targetAmount >= currentAmount.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Objectif mis a jour",
                    content = @Content(schema = @Schema(implementation = GoalResponse.class))),
            @ApiResponse(responseCode = "400", description = "Donnees invalides (TARGET_BELOW_CURRENT)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Objectif introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Objectif non modifiable ou nom duplique",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<GoalResponse> updateGoal(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                                   @Valid @RequestBody GoalUpdateRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(currentUserProvider.userId(jwt), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un objectif",
            description = "Suppression logique : le statut de l'objectif passe a CANCELLED.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Objectif annule"),
            @ApiResponse(responseCode = "400", description = "Identifiant invalide",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Objectif introuvable",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteGoal(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        goalService.deleteGoal(currentUserProvider.userId(jwt), id);
        return ResponseEntity.noContent().build();
    }
}
