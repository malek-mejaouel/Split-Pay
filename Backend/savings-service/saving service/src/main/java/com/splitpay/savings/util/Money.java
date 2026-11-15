package com.splitpay.savings.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Constantes et controles communs aux montants (jamais de double, toujours BigDecimal).
 */
public final class Money {

    public static final int SCALE = 2;
    public static final BigDecimal ZERO = new BigDecimal("0.00");
    public static final BigDecimal DEFAULT_ROUND_UP_STEP = new BigDecimal("1.00");

    private Money() {
    }

    /** Ramene un montant a 2 decimales (arrondi commercial). */
    public static BigDecimal normalize(BigDecimal value) {
        return value == null ? null : value.setScale(SCALE, RoundingMode.HALF_UP);
    }

    /** Montant utilisable cote metier : non nul, strictement positif, 2 decimales maximum. */
    public static boolean isValidAmount(BigDecimal value) {
        return value != null && value.signum() > 0 && value.scale() <= SCALE;
    }
}
