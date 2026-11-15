package com.splitpay.savings.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.dto.RoundUpResponse;
import com.splitpay.savings.dto.event.WalletDebitedEvent;
import com.splitpay.savings.entity.RoundUp;
import com.splitpay.savings.entity.RoundUpStatus;
import com.splitpay.savings.entity.SavingsAccount;
import com.splitpay.savings.entity.SavingsGoal;
import com.splitpay.savings.mapper.RoundUpMapper;
import com.splitpay.savings.repository.RoundUpRepository;
import com.splitpay.savings.repository.SavingsAccountRepository;
import com.splitpay.savings.util.SortSupport;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Epargne par arrondi.
 * <p>
 * Les arrondis sont crees uniquement par le traitement d'evenement (lecture seule via l'API).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoundUpService {

    /** Champs de tri autorises pour l'historique des arrondis (liste blanche). */
    public static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "savedAmount", "originalAmount", "status");

    private final RoundUpRepository roundUpRepository;
    private final SavingsAccountRepository accountRepository;
    private final RoundUpMapper roundUpMapper;
    private final ObjectMapper objectMapper;

    /* ===================== Lecture ===================== */

    /** Historique pagine des arrondis du compte connecte. */
    public PageResponse<RoundUpResponse> listRoundUps(UUID userId, RoundUpStatus status, int page, int size,
                                                      String sort, String direction) {
        SavingsAccount account = accountRepository.findByUserId(userId).orElse(null);
        if (account == null) {
            return new PageResponse<>(List.of(), page, size, 0L, 0, true);
        }
        Pageable pageable = PageRequest.of(page, size, SortSupport.resolve(sort, direction, SORTABLE_FIELDS));
        Page<RoundUp> result = (status == null)
                ? roundUpRepository.findByAccountId(account.getId(), pageable)
                : roundUpRepository.findByAccountIdAndStatus(account.getId(), status, pageable);
        return PageResponse.of(result, roundUpMapper::toResponse);
    }

    /* =====================================================================================
     *  PARTIE A CODER PAR L'ETUDIANT (voir enonce §6) : signatures uniquement, pas de logique.
     * ===================================================================================== */

    /**
     * Calcule l'arrondi d'un montant au pas superieur.
     * <p>
     * Role attendu : retourner {@code roundedAmount - montant}, c'est-a-dire la difference
     * entre le montant arrondi au pas superieur (multiple de {@code pas}) et le montant paye.
     * Exemple : montant = 12.30, pas = 1.00 =&gt; arrondi = 0.70.
     *
     * @param montant montant du paiement (positif, 2 decimales)
     * @param pas     pas d'arrondi du compte (0.50, 1.00, 2.00 ou 5.00)
     * @return le montant a epargner (0.00 si le montant est deja un multiple du pas)
     */
    public BigDecimal calculerArrondi(BigDecimal montant, BigDecimal pas) {
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * Depose le montant arrondi sur le compte d'epargne.
     * <p>
     * Role attendu : crediter {@code account.balance} du montant arrondi et persister le compte.
     *
     * @param compte  compte d'epargne a crediter
     * @param arrondi montant a ajouter au solde d'epargne
     */
    public void deposerEpargne(SavingsAccount compte, BigDecimal arrondi) {
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * Met a jour l'objectif d'epargne impacte par l'arrondi.
     * <p>
     * Role attendu : augmenter {@code objectif.currentAmount} de l'arrondi et passer le statut
     * a {@code REACHED} si le montant cible est atteint (sinon conserver {@code IN_PROGRESS}).
     *
     * @param objectif objectif cible a crediter
     * @param arrondi  montant a affecter a l'objectif
     */
    public void majObjectif(SavingsGoal objectif, BigDecimal arrondi) {
        throw new UnsupportedOperationException("TODO");
    }

    /* =====================================================================================
     *  Squelette d'integration (aucune logique metier)
     * ===================================================================================== */

    /**
     * Consommateur de la file {@code savings.queue} (binding sur la routing key {@code wallet.debited}).
     * <p>
     * Etapes : deserialiser l'enveloppe d'evenement, ignorer tout evenement dont le type n'est pas
     * PURCHASE, ignorer un evenement deja traite (idempotence par {@code sourceEventId}), puis
     * enchainer les 3 traitements de l'epargne par arrondi.
     */
    @RabbitListener(queues = "${savings.rabbitmq.queue}")
    public void onWalletDebited(String payload) {
        WalletDebitedEvent event;
        try {
            event = objectMapper.readValue(payload, WalletDebitedEvent.class);
        } catch (JsonProcessingException ex) {
            log.error("Evenement wallet.debited illisible, envoi en dead-letter : {}", payload, ex);
            throw new AmqpRejectAndDontRequeueException("Payload wallet.debited illisible", ex);
        }

        if (event.eventId() == null) {
            log.warn("Evenement wallet.debited sans eventId, ignore : {}", payload);
            return;
        }
        if (!event.isPurchase()) {
            log.debug("Evenement {} ignore : type {} different de PURCHASE", event.eventId(), event.type());
            return;
        }
        if (roundUpRepository.existsBySourceEventId(event.eventId())) {
            log.debug("Evenement {} deja traite : idempotence", event.eventId());
            return;
        }
        if (event.data() == null || event.data().userId() == null || event.data().amount() == null) {
            log.warn("Evenement {} incomplet (data/userId/amount), ignore", event.eventId());
            return;
        }

        SavingsAccount compte = accountRepository.findByUserId(event.data().userId()).orElse(null);
        if (compte == null) {
            log.info("Aucun compte d'epargne pour l'utilisateur {}, evenement {} ignore",
                    event.data().userId(), event.eventId());
            return;
        }
        if (!compte.isRoundUpEnabled()) {
            log.debug("Arrondi desactive pour l'utilisateur {}, evenement {} ignore",
                    event.data().userId(), event.eventId());
            return;
        }

        // TODO : selectionner l'objectif a crediter (regle de priorite a definir par l'etudiant)
        SavingsGoal objectifCible = null;

        BigDecimal arrondi = calculerArrondi(event.data().amount(), compte.getRoundUpStep());
        deposerEpargne(compte, arrondi);
        majObjectif(objectifCible, arrondi);

        // TODO : persister le RoundUp (accountId, sourceEventId = event.eventId(), originalAmount,
        //        roundedAmount, savedAmount, statut SAVED ou DEFERRED, createdAt).
    }

    /**
     * Rejeu periodique des arrondis restes en statut DEFERRED.
     */
    @Scheduled(fixedDelayString = "${savings.roundup.retry-delay-ms:60000}")
    public void retryDeferred() {
        // TODO : relire les RoundUp en DEFERRED (roundUpRepository.findByStatus(RoundUpStatus.DEFERRED))
        //        puis tenter de rejouer deposerEpargne / majObjectif et repositionner le statut.
        throw new UnsupportedOperationException("TODO");
    }
}
