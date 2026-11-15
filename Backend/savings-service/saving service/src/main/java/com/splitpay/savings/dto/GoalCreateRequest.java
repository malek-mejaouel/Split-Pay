package com.splitpay.savings.dto;

import com.splitpay.savings.validation.NoHtml;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(name = "GoalCreateRequest", description = "Creation d'un objectif d'epargne")
public record GoalCreateRequest(

        @Schema(description = "Nom de l'objectif", example = "Voyage a Paris")
        @NotBlank(message = "Le nom de l'objectif est obligatoire.")
        @Size(min = 3, max = 50, message = "Le nom de l'objectif doit contenir entre 3 et 50 caracteres.")
        @Pattern(regexp = "^[\\p{L}0-9 '’\\-_.]+$",
                message = "Le nom de l'objectif contient des caracteres non autorises.")
        @NoHtml
        String name,

        @Schema(description = "Montant cible", example = "1500.00")
        @NotNull(message = "Le montant cible est obligatoire.")
        @DecimalMin(value = "1.00", message = "Le montant cible doit etre superieur ou egal a 1.00.")
        @DecimalMax(value = "1000000.00", message = "Le montant cible ne peut pas depasser 1 000 000.00.")
        @Digits(integer = 7, fraction = 2, message = "Le montant cible doit comporter au maximum 7 chiffres et 2 decimales.")
        BigDecimal targetAmount,

        @Schema(description = "Date limite (future)", example = "2027-06-30")
        @NotNull(message = "La date limite est obligatoire.")
        @Future(message = "La date limite doit etre dans le futur.")
        LocalDate deadline
) {
}
