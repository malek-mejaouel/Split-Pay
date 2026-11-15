package com.splitpay.savings.util;

import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ErrorCode;
import java.util.Set;
import org.springframework.data.domain.Sort;

/**
 * Resolution securisee des parametres de tri : liste blanche de champs autorises.
 */
public final class SortSupport {

    private SortSupport() {
    }

    public static Sort resolve(String sort, String direction, Set<String> allowedFields) {
        if (sort == null || sort.isBlank()) {
            return Sort.unsorted();
        }
        if (!allowedFields.contains(sort)) {
            throw BadRequestException.invalidSortField(
                    "Champ de tri '" + sort + "' non autorise. Champs autorises : " + String.join(", ", allowedFields) + ".");
        }
        return Sort.by(resolveDirection(direction), sort);
    }

    private static Sort.Direction resolveDirection(String direction) {
        if (direction == null || direction.isBlank()) {
            return Sort.Direction.ASC;
        }
        try {
            return Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(ErrorCode.INVALID_ARGUMENT,
                    "Direction de tri invalide : utilisez 'asc' ou 'desc'.");
        }
    }
}
