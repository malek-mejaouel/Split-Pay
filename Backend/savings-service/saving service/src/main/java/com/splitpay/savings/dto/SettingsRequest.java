package com.splitpay.savings.dto;

import com.splitpay.savings.validation.AllowedStep;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Schema(name = "SettingsRequest", description = "Activation de l'arrondi et choix du pas")
public record SettingsRequest(

        @Schema(description = "Activer ou desactiver l'epargne par arrondi", example = "true")
        @NotNull(message = "Le champ roundUpEnabled est obligatoire.")
        Boolean roundUpEnabled,

        @Schema(description = "Pas d'arrondi autorise : 0.50, 1.00, 2.00 ou 5.00", example = "1.00")
        @NotNull(message = "Le pas d'arrondi est obligatoire.")
        @Digits(integer = 2, fraction = 2, message = "Le pas d'arrondi doit comporter au maximum 2 chiffres et 2 decimales.")
        @AllowedStep
        BigDecimal roundUpStep
) {
}
