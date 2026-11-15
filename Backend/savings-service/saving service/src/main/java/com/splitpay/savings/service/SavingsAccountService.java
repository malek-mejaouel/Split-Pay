package com.splitpay.savings.service;

import com.splitpay.savings.dto.SavingsAccountResponse;
import com.splitpay.savings.dto.SettingsRequest;
import com.splitpay.savings.entity.SavingsAccount;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ErrorCode;
import com.splitpay.savings.mapper.SavingsAccountMapper;
import com.splitpay.savings.repository.SavingsAccountRepository;
import com.splitpay.savings.util.Money;
import com.splitpay.savings.validation.AllowedStepValidator;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Compte d'epargne : creation a la demande et reglages de l'arrondi.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SavingsAccountService {

    private final SavingsAccountRepository accountRepository;
    private final SavingsAccountMapper accountMapper;

    /** Compte de l'utilisateur connecte, cree a la demande si absent. */
    @Transactional
    public SavingsAccountResponse getOrCreateAccount(UUID userId) {
        return accountMapper.toResponse(findOrCreateEntity(userId));
    }

    /** Entite compte de l'utilisateur, creee a la demande si absente. */
    @Transactional
    public SavingsAccount findOrCreateEntity(UUID userId) {
        return accountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Creation du compte d'epargne pour l'utilisateur {}", userId);
                    return accountRepository.save(SavingsAccount.builder()
                            .userId(userId)
                            .balance(Money.ZERO)
                            .roundUpEnabled(false)
                            .roundUpStep(Money.DEFAULT_ROUND_UP_STEP)
                            .createdAt(LocalDateTime.now())
                            .build());
                });
    }

    public Optional<SavingsAccount> findByUserId(UUID userId) {
        return accountRepository.findByUserId(userId);
    }

    /** Activation de l'arrondi et choix du pas (0.50, 1.00, 2.00, 5.00). */
    @Transactional
    public SavingsAccountResponse updateSettings(UUID userId, SettingsRequest request) {
        validateSettings(request);

        SavingsAccount account = findOrCreateEntity(userId);
        account.setRoundUpEnabled(Boolean.TRUE.equals(request.roundUpEnabled()));
        account.setRoundUpStep(Money.normalize(request.roundUpStep()));
        return accountMapper.toResponse(accountRepository.save(account));
    }

    /** Revalidation metier des reglages (en plus de la validation Bean Validation). */
    private void validateSettings(SettingsRequest request) {
        if (request.roundUpEnabled() == null) {
            throw new BadRequestException(ErrorCode.VALIDATION_ERROR, "Le champ roundUpEnabled est obligatoire.");
        }
        if (!AllowedStepValidator.isAllowed(request.roundUpStep())) {
            throw new BadRequestException(ErrorCode.INVALID_ARGUMENT,
                    "Le pas d'arrondi autorise est " + AllowedStepValidator.allowedValuesAsText() + ".");
        }
    }
}
