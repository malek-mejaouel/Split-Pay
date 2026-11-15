-- ============================================================================
--  SplitPay - savings-service (MS6)
--  Script d'initialisation PostgreSQL pour la base `savings_db`
--
--  Utilisation :
--    1) creer la base (une seule fois) :
--         CREATE DATABASE savings_db;
--    2) se connecter a savings_db puis executer ce script :
--         psql -U postgres -d savings_db -f init.sql
--
--  Remarque : le service est configure avec `spring.jpa.hibernate.ddl-auto=update`.
--  Ce script est donc OPTIONNEL : il permet de creer le schema proprement a la main
--  (ou en production) tout en restant compatible avec le schema genere par Hibernate.
--  Les noms de tables/colonnes/contraintes correspondent exactement aux entites JPA.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Comptes d'epargne (savings_accounts)
--    - balance >= 0 et round_up_step > 0
--    - un seul compte par utilisateur : UNIQUE (user_id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_accounts (
    id               UUID           NOT NULL,
    user_id          UUID           NOT NULL,
    balance          NUMERIC(19, 2) NOT NULL,
    round_up_enabled BOOLEAN        NOT NULL,
    round_up_step    NUMERIC(19, 2) NOT NULL,
    created_at       TIMESTAMP(6)   NOT NULL,
    CONSTRAINT pk_savings_accounts PRIMARY KEY (id),
    CONSTRAINT uk_savings_accounts_user_id UNIQUE (user_id),
    CONSTRAINT ck_savings_accounts_balance CHECK (balance >= 0),
    CONSTRAINT ck_savings_accounts_round_up_step CHECK (round_up_step > 0)
);

-- ---------------------------------------------------------------------------
-- 2. Objectifs d'epargne (savings_goals)
--    - target_amount > 0, current_amount >= 0
--    - index (account_id, status) pour les listes filtrees par statut
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_goals (
    id             UUID           NOT NULL,
    account_id     UUID           NOT NULL,
    name           VARCHAR(50)    NOT NULL,
    target_amount  NUMERIC(19, 2) NOT NULL,
    current_amount NUMERIC(19, 2) NOT NULL,
    deadline       DATE           NOT NULL,
    status         VARCHAR(20)    NOT NULL,
    CONSTRAINT pk_savings_goals PRIMARY KEY (id),
    CONSTRAINT ck_savings_goals_target_amount CHECK (target_amount > 0),
    CONSTRAINT ck_savings_goals_current_amount CHECK (current_amount >= 0),
    CONSTRAINT ck_savings_goals_status CHECK (status IN ('IN_PROGRESS', 'REACHED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_account_status
    ON savings_goals (account_id, status);

-- ---------------------------------------------------------------------------
-- 3. Arrondis d'epargne (round_ups)
--    - UNIQUE (source_event_id) : garantit l'idempotence du traitement d'evenement
--    - index (account_id, status) pour l'historique et le rejeu des DEFERRED
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS round_ups (
    id               UUID           NOT NULL,
    account_id       UUID           NOT NULL,
    source_event_id  UUID           NOT NULL,
    original_amount  NUMERIC(19, 2) NOT NULL,
    rounded_amount   NUMERIC(19, 2) NOT NULL,
    saved_amount     NUMERIC(19, 2) NOT NULL,
    status           VARCHAR(20)    NOT NULL,
    created_at       TIMESTAMP(6)   NOT NULL,
    CONSTRAINT pk_round_ups PRIMARY KEY (id),
    CONSTRAINT uk_round_ups_source_event_id UNIQUE (source_event_id),
    CONSTRAINT ck_round_ups_status CHECK (status IN ('PENDING', 'SAVED', 'DEFERRED'))
);

CREATE INDEX IF NOT EXISTS idx_round_ups_account_status
    ON round_ups (account_id, status);

-- ---------------------------------------------------------------------------
-- 4. Verification (optionnel)
-- ---------------------------------------------------------------------------
-- SELECT table_name, constraint_name, constraint_type
--   FROM information_schema.table_constraints
--  WHERE table_schema = 'public'
--  ORDER BY table_name, constraint_type;
